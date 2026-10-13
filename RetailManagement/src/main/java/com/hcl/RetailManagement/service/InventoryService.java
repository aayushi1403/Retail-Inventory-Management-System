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

    public Inventory updateInventory(
            Integer id,
            Inventory details) {

        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Inventory not found"));

        inventory.setProduct(details.getProduct());
        inventory.setWarehouse(details.getWarehouse());
        inventory.setQuantity(details.getQuantity());
        inventory.setReservedQuantity(details.getReservedQuantity());

        return inventoryRepository.save(inventory);
    }

    public void deleteInventory(Integer id) {

        if (!inventoryRepository.existsById(id)) {
            throw new RuntimeException("Inventory not found");
        }

        inventoryRepository.deleteById(id);
    }
}
