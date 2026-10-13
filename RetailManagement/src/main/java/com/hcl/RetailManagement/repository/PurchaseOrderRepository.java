package com.hcl.RetailManagement.repository;


import com.hcl.RetailManagement.entity.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PurchaseOrderRepository
        extends JpaRepository<PurchaseOrder, Integer> {

}