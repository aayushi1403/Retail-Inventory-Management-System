package com.hcl.RetailManagement.repository;


import com.hcl.RetailManagement.entity.CustomerOrder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerOrderRepository
        extends JpaRepository<CustomerOrder, Integer> {

}
