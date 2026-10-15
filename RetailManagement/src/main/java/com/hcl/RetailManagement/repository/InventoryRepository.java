package com.hcl.RetailManagement.repository;

import com.hcl.RetailManagement.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InventoryRepository
        extends JpaRepository<Inventory, Integer> {

    Optional<Inventory> findByProduct_ProductIdAndWarehouse_WarehouseId(
            Integer productId,
            Integer warehouseId
    );

    java.util.List<Inventory> findByWarehouse_WarehouseId(Integer warehouseId);

    java.util.List<Inventory> findByProduct_ProductId(Integer productId);
}