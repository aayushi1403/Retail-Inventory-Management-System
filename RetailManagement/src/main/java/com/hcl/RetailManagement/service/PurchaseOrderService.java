package com.hcl.RetailManagement.service;


import com.hcl.RetailManagement.entity.PurchaseOrder;
import com.hcl.RetailManagement.repository.PurchaseOrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;

    public PurchaseOrderService(
            PurchaseOrderRepository purchaseOrderRepository) {

        this.purchaseOrderRepository = purchaseOrderRepository;
    }

    public PurchaseOrder createPurchaseOrder(
            PurchaseOrder order) {

        return purchaseOrderRepository.save(order);
    }

    public List<PurchaseOrder> getAllPurchaseOrders() {
        return purchaseOrderRepository.findAll();
    }

    public Optional<PurchaseOrder> getPurchaseOrderById(
            Integer id) {

        return purchaseOrderRepository.findById(id);
    }

    public PurchaseOrder updatePurchaseOrder(
            Integer id,
            PurchaseOrder details) {

        PurchaseOrder order =
                purchaseOrderRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Purchase order not found"));

        order.setSupplier(details.getSupplier());
        order.setWarehouse(details.getWarehouse());
        order.setCreatedBy(details.getCreatedBy());
        order.setOrderDate(details.getOrderDate());
        order.setExpectedDate(details.getExpectedDate());
        order.setStatus(details.getStatus());
        order.setTotalAmount(details.getTotalAmount());

        return purchaseOrderRepository.save(order);
    }

    public void deletePurchaseOrder(Integer id) {

        if (!purchaseOrderRepository.existsById(id)) {
            throw new RuntimeException(
                    "Purchase order not found");
        }

        purchaseOrderRepository.deleteById(id);
    }
}
