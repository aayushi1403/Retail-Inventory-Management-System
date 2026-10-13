package com.hcl.RetailManagement.service;


import com.hcl.RetailManagement.entity.Supplier;
import com.hcl.RetailManagement.repository.SupplierRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public SupplierService(SupplierRepository supplierRepository) {
        this.supplierRepository = supplierRepository;
    }

    public Supplier createSupplier(Supplier supplier) {
        return supplierRepository.save(supplier);
    }

    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    public Optional<Supplier> getSupplierById(Integer id) {
        return supplierRepository.findById(id);
    }

    public Supplier updateSupplier(
            Integer id,
            Supplier details) {

        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Supplier not found"));

        supplier.setSupplierName(details.getSupplierName());
        supplier.setContactPerson(details.getContactPerson());
        supplier.setEmail(details.getEmail());
        supplier.setPhone(details.getPhone());
        supplier.setAddress(details.getAddress());
        supplier.setStatus(details.getStatus());

        return supplierRepository.save(supplier);
    }

    public void deleteSupplier(Integer id) {

        if (!supplierRepository.existsById(id)) {
            throw new RuntimeException("Supplier not found");
        }

        supplierRepository.deleteById(id);
    }
}