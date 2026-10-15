package com.hcl.RetailManagement.service;


import com.hcl.RetailManagement.entity.Inventory;
import com.hcl.RetailManagement.repository.InventoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    public InventoryService(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    public Inventory createInventory(Inventory inventory) {
        return inventoryRepository.save(inventory);
    }

    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    public Optional<Inventory> getInventoryById(Integer id) {
        return inventoryRepository.findById(id);
    }

    public Optional<Inventory> getByProductAndWarehouse(
            Integer productId,
            Integer warehouseId) {

        return inventoryRepository
                .findByProduct_ProductIdAndWarehouse_WarehouseId(
                        productId, warehouseId
                );
    }

    public List<Inventory> getByWarehouse(Integer warehouseId) {
        return inventoryRepository.findByWarehouse_WarehouseId(warehouseId);
    }

    public List<Inventory> getByProduct(Integer productId) {
        return inventoryRepository.findByProduct_ProductId(productId);
    }

    public List<Inventory> getLowStockInventory() {
        return inventoryRepository.findAll().stream()
                .filter(i -> i.getProduct() != null && 
                             i.getProduct().getReorderLevel() != null && 
                             i.getQuantity() != null &&
                             i.getQuantity() <= i.getProduct().getReorderLevel())
                .collect(java.util.stream.Collectors.toList());
    }

    public Inventory updateInventory(
            Integer id,
            Inventory details) {

        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Inventory not found"));

        if (details.getProduct() != null) inventory.setProduct(details.getProduct());
        if (details.getWarehouse() != null) inventory.setWarehouse(details.getWarehouse());
        if (details.getQuantity() != null) inventory.setQuantity(details.getQuantity());
        if (details.getReservedQuantity() != null) inventory.setReservedQuantity(details.getReservedQuantity());

        return inventoryRepository.save(inventory);
    }

    public void deleteInventory(Integer id) {

        if (!inventoryRepository.existsById(id)) {
            throw new RuntimeException("Inventory not found");
        }

        inventoryRepository.deleteById(id);
    }
}
