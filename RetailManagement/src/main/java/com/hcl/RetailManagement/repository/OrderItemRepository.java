package com.hcl.RetailManagement.repository;


import com.hcl.RetailManagement.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository
        extends JpaRepository<OrderItem, Integer> {

}