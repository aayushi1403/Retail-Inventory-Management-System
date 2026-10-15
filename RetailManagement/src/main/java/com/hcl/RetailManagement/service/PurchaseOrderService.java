package com.hcl.RetailManagement.service;


import com.hcl.RetailManagement.entity.PurchaseOrder;
import com.hcl.RetailManagement.repository.PurchaseOrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final com.hcl.RetailManagement.repository.PurchaseOrderItemRepository itemRepository;
    private final com.hcl.RetailManagement.repository.InventoryRepository inventoryRepository;
    private final com.hcl.RetailManagement.repository.UserRepository userRepository;

    public PurchaseOrderService(
            PurchaseOrderRepository purchaseOrderRepository,
            com.hcl.RetailManagement.repository.PurchaseOrderItemRepository itemRepository,
            com.hcl.RetailManagement.repository.InventoryRepository inventoryRepository,
            com.hcl.RetailManagement.repository.UserRepository userRepository) {

        this.purchaseOrderRepository = purchaseOrderRepository;
        this.itemRepository = itemRepository;
        this.inventoryRepository = inventoryRepository;
        this.userRepository = userRepository;
    }

    public PurchaseOrder createPurchaseOrder(
            PurchaseOrder order) {

        if (order.getCreatedBy() == null) {
            userRepository.findAll().stream().findFirst().ifPresent(order::setCreatedBy);
        }

        return purchaseOrderRepository.save(order);
    }

    public List<PurchaseOrder> getAllPurchaseOrders() {
        return purchaseOrderRepository.findAll();
    }

    public Optional<PurchaseOrder> getPurchaseOrderById(
            Integer id) {

        return purchaseOrderRepository.findById(id);
    }

    @org.springframework.transaction.annotation.Transactional
    public PurchaseOrder updatePurchaseOrder(
            Integer id,
            PurchaseOrder details) {

        PurchaseOrder order =
                purchaseOrderRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Purchase order not found"));

        String oldStatus = order.getStatus();

        if (details.getSupplier() != null) order.setSupplier(details.getSupplier());
        if (details.getWarehouse() != null) order.setWarehouse(details.getWarehouse());
        if (details.getCreatedBy() != null) order.setCreatedBy(details.getCreatedBy());
        if (details.getOrderDate() != null) order.setOrderDate(details.getOrderDate());
        if (details.getExpectedDate() != null) order.setExpectedDate(details.getExpectedDate());
        if (details.getStatus() != null) order.setStatus(details.getStatus());
        if (details.getTotalAmount() != null) order.setTotalAmount(details.getTotalAmount());

        PurchaseOrder saved = purchaseOrderRepository.save(order);

        if ("RECEIVED".equalsIgnoreCase(saved.getStatus()) && !"RECEIVED".equalsIgnoreCase(oldStatus)) {
            receivePurchaseOrderItems(saved);
        }

        return saved;
    }

    private void receivePurchaseOrderItems(PurchaseOrder order) {
        if (order.getWarehouse() == null) return;
        List<com.hcl.RetailManagement.entity.PurchaseOrderItem> items =
                itemRepository.findByPurchaseOrder_PurchaseOrderId(order.getPurchaseOrderId());

        for (com.hcl.RetailManagement.entity.PurchaseOrderItem item : items) {
            if (item.getProduct() == null) continue;
            Integer productId = item.getProduct().getProductId();
            Integer warehouseId = order.getWarehouse().getWarehouseId();
            int qty = item.getQuantity() != null ? item.getQuantity() : 0;

            com.hcl.RetailManagement.entity.Inventory inv = inventoryRepository
                    .findByProduct_ProductIdAndWarehouse_WarehouseId(productId, warehouseId)
                    .orElse(null);

            if (inv == null) {
                inv = new com.hcl.RetailManagement.entity.Inventory();
                inv.setProduct(item.getProduct());
                inv.setWarehouse(order.getWarehouse());
                inv.setQuantity(qty);
                inv.setReservedQuantity(0);
            } else {
                int currentQty = inv.getQuantity() != null ? inv.getQuantity() : 0;
                inv.setQuantity(currentQty + qty);
            }
            inventoryRepository.save(inv);
        }
    }

    public void deletePurchaseOrder(Integer id) {

        if (!purchaseOrderRepository.existsById(id)) {
            throw new RuntimeException(
                    "Purchase order not found");
        }

        purchaseOrderRepository.deleteById(id);
    }
}
