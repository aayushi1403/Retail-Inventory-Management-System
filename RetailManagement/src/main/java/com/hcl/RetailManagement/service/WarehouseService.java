package com.hcl.RetailManagement.service;


import com.hcl.RetailManagement.entity.Warehouse;
import com.hcl.RetailManagement.repository.WarehouseRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;

    public WarehouseService(WarehouseRepository warehouseRepository) {
        this.warehouseRepository = warehouseRepository;
    }

    public Warehouse createWarehouse(Warehouse warehouse) {
        return warehouseRepository.save(warehouse);
    }

    public List<Warehouse> getAllWarehouses() {
        return warehouseRepository.findAll();
    }

    public Optional<Warehouse> getWarehouseById(Integer id) {
        return warehouseRepository.findById(id);
    }

    public Warehouse updateWarehouse(
            Integer id,
            Warehouse details) {

        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Warehouse not found"));

        warehouse.setWarehouseName(details.getWarehouseName());
        warehouse.setLocation(details.getLocation());
        warehouse.setManagerName(details.getManagerName());
        warehouse.setContactNumber(details.getContactNumber());
        warehouse.setStatus(details.getStatus());

        return warehouseRepository.save(warehouse);
    }

    public void deleteWarehouse(Integer id) {

        if (!warehouseRepository.existsById(id)) {
            throw new RuntimeException("Warehouse not found");
        }

        warehouseRepository.deleteById(id);
    }
}