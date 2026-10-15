package com.hcl.RetailManagement.service;


import com.hcl.RetailManagement.entity.StockTransfer;
import com.hcl.RetailManagement.repository.StockTransferRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StockTransferService {

    private final StockTransferRepository repository;
    private final com.hcl.RetailManagement.repository.InventoryRepository inventoryRepository;
    private final com.hcl.RetailManagement.repository.UserRepository userRepository;

    public StockTransferService(
            StockTransferRepository repository,
            com.hcl.RetailManagement.repository.InventoryRepository inventoryRepository,
            com.hcl.RetailManagement.repository.UserRepository userRepository) {

        this.repository = repository;
        this.inventoryRepository = inventoryRepository;
        this.userRepository = userRepository;
    }

    public StockTransfer createTransfer(
            StockTransfer transfer) {

        if (transfer.getSourceWarehouse() != null && transfer.getDestinationWarehouse() != null &&
            transfer.getSourceWarehouse().getWarehouseId() != null &&
            transfer.getSourceWarehouse().getWarehouseId().equals(transfer.getDestinationWarehouse().getWarehouseId())) {
            throw new IllegalArgumentException("Source and destination warehouses cannot be the same.");
        }

        if (transfer.getCreatedBy() == null) {
            userRepository.findAll().stream().findFirst().ifPresent(transfer::setCreatedBy);
        }

        return repository.save(transfer);
    }

    public List<StockTransfer> getAllTransfers() {
        return repository.findAll();
    }

    public Optional<StockTransfer> getTransferById(
            Integer id) {

        return repository.findById(id);
    }

    @org.springframework.transaction.annotation.Transactional
    public StockTransfer updateTransfer(
            Integer id,
            StockTransfer details) {

        StockTransfer transfer =
                repository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Stock transfer not found"));

        String oldStatus = transfer.getStatus();

        if (details.getProduct() != null) transfer.setProduct(details.getProduct());
        if (details.getSourceWarehouse() != null) transfer.setSourceWarehouse(details.getSourceWarehouse());
        if (details.getDestinationWarehouse() != null) transfer.setDestinationWarehouse(details.getDestinationWarehouse());
        if (details.getQuantity() != null) transfer.setQuantity(details.getQuantity());
        if (details.getCreatedBy() != null) transfer.setCreatedBy(details.getCreatedBy());
        if (details.getStatus() != null) transfer.setStatus(details.getStatus());

        // Validate warehouses
        if (transfer.getSourceWarehouse() != null && transfer.getDestinationWarehouse() != null &&
            transfer.getSourceWarehouse().getWarehouseId() != null &&
            transfer.getSourceWarehouse().getWarehouseId().equals(transfer.getDestinationWarehouse().getWarehouseId())) {
            throw new IllegalArgumentException("Source and destination warehouses cannot be the same.");
        }

        // If transitioning to COMPLETED from non-completed status, perform inventory movement
        if ("COMPLETED".equalsIgnoreCase(transfer.getStatus()) && !"COMPLETED".equalsIgnoreCase(oldStatus)) {
            executeInventoryTransfer(transfer);
        }

        return repository.save(transfer);
    }

    private void executeInventoryTransfer(StockTransfer transfer) {
        if (transfer.getProduct() == null || transfer.getSourceWarehouse() == null || transfer.getDestinationWarehouse() == null) {
            return;
        }

        Integer productId = transfer.getProduct().getProductId();
        Integer srcWarehouseId = transfer.getSourceWarehouse().getWarehouseId();
        Integer destWarehouseId = transfer.getDestinationWarehouse().getWarehouseId();
        int qty = transfer.getQuantity() != null ? transfer.getQuantity() : 0;

        // Deduct from source warehouse
        com.hcl.RetailManagement.entity.Inventory srcInv = inventoryRepository
                .findByProduct_ProductIdAndWarehouse_WarehouseId(productId, srcWarehouseId)
                .orElse(null);
        if (srcInv != null) {
            int currentQty = srcInv.getQuantity() != null ? srcInv.getQuantity() : 0;
            srcInv.setQuantity(Math.max(0, currentQty - qty));
            inventoryRepository.save(srcInv);
        }

        // Add to destination warehouse
        com.hcl.RetailManagement.entity.Inventory destInv = inventoryRepository
                .findByProduct_ProductIdAndWarehouse_WarehouseId(productId, destWarehouseId)
                .orElse(null);
        if (destInv == null) {
            destInv = new com.hcl.RetailManagement.entity.Inventory();
            destInv.setProduct(transfer.getProduct());
            destInv.setWarehouse(transfer.getDestinationWarehouse());
            destInv.setQuantity(qty);
            destInv.setReservedQuantity(0);
        } else {
            int currentDestQty = destInv.getQuantity() != null ? destInv.getQuantity() : 0;
            destInv.setQuantity(currentDestQty + qty);
        }
        inventoryRepository.save(destInv);
    }

    public void deleteTransfer(Integer id) {

        if (!repository.existsById(id)) {
            throw new RuntimeException(
                    "Stock transfer not found");
        }

        repository.deleteById(id);
    }
}