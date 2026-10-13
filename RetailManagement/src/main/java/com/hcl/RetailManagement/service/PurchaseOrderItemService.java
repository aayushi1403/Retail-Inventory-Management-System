package com.hcl.RetailManagement.service;


import com.hcl.RetailManagement.entity.PurchaseOrderItem;
import com.hcl.RetailManagement.repository.PurchaseOrderItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PurchaseOrderItemService {

    private final PurchaseOrderItemRepository repository;

    public PurchaseOrderItemService(
            PurchaseOrderItemRepository repository) {

        this.repository = repository;
    }

    public PurchaseOrderItem createItem(PurchaseOrderItem item) {
        return repository.save(item);
    }

    public List<PurchaseOrderItem> getAllItems() {
        return repository.findAll();
    }

    public Optional<PurchaseOrderItem> getItemById(Integer id) {
        return repository.findById(id);
    }

    public PurchaseOrderItem updateItem(
            Integer id,
            PurchaseOrderItem details) {

        PurchaseOrderItem item = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Purchase order item not found"));

        item.setPurchaseOrder(details.getPurchaseOrder());
        item.setProduct(details.getProduct());
        item.setQuantity(details.getQuantity());
        item.setUnitPrice(details.getUnitPrice());
        item.setSubtotal(details.getSubtotal());

        return repository.save(item);
    }

    public void deleteItem(Integer id) {

        if (!repository.existsById(id)) {
            throw new RuntimeException(
                    "Purchase order item not found");
        }

        repository.deleteById(id);
    }
}