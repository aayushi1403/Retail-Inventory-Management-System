package com.hcl.RetailManagement.controller;

import com.hcl.RetailManagement.entity.OrderItem;
import com.hcl.RetailManagement.service.OrderItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order-items")
public class OrderItemController {

    private final OrderItemService service;

    public OrderItemController(OrderItemService service) {
        this.service = service;
    }

    @PostMapping
    public OrderItem createItem(
            @RequestBody OrderItem item) {

        return service.createItem(item);
    }

    @GetMapping
    public List<OrderItem> getAllItems() {
        return service.getAllItems();
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderItem> getItemById(
            @PathVariable Integer id) {

        return service.getItemById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrderItem> updateItem(
            @PathVariable Integer id,
            @RequestBody OrderItem details) {

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