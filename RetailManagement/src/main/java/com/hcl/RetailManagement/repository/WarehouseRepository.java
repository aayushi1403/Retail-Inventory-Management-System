package com.hcl.RetailManagement.repository;

import com.hcl.RetailManagement.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WarehouseRepository
        extends JpaRepository<Warehouse, Integer> {

}