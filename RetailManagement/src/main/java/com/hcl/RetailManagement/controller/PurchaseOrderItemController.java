package com.hcl.RetailManagement.controller;

import com.hcl.RetailManagement.entity.PurchaseOrderItem;
import com.hcl.RetailManagement.service.PurchaseOrderItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchase-order-items")
public class PurchaseOrderItemController {

    private final PurchaseOrderItemService service;

    public PurchaseOrderItemController(
            PurchaseOrderItemService service) {

        this.service = service;
    }

    @PostMapping
    public PurchaseOrderItem createItem(
            @RequestBody PurchaseOrderItem item) {

        return service.createItem(item);
    }

    @GetMapping
    public List<PurchaseOrderItem> getAllItems() {
        return service.getAllItems();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrderItem> getItemById(
            @PathVariable Integer id) {

        return service.getItemById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<PurchaseOrderItem> updateItem(
            @PathVariable Integer id,
            @RequestBody PurchaseOrderItem details) {

        try {
            return ResponseEntity.ok(
                    service.updateItem(id, details)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(
            @PathVariable Integer id) {

        try {
            service.deleteItem(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
