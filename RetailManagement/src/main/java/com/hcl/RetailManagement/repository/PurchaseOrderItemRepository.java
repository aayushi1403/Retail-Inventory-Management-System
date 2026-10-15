package com.hcl.RetailManagement.repository;


import com.hcl.RetailManagement.entity.PurchaseOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PurchaseOrderItemRepository
        extends JpaRepository<PurchaseOrderItem, Integer> {
    java.util.List<PurchaseOrderItem> findByPurchaseOrder_PurchaseOrderId(Integer purchaseOrderId);
}
