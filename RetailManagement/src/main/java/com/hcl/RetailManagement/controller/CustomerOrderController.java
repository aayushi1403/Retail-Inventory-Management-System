package com.hcl.RetailManagement.controller;


import com.hcl.RetailManagement.entity.CustomerOrder;
import com.hcl.RetailManagement.service.CustomerOrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer-orders")
public class CustomerOrderController {

    private final CustomerOrderService service;

    public CustomerOrderController(
            CustomerOrderService service) {

        this.service = service;
    }

    @PostMapping
    public CustomerOrder createOrder(
            @RequestBody CustomerOrder order) {

        return service.createOrder(order);
    }

    @GetMapping
    public List<CustomerOrder> getAllOrders() {
        return service.getAllOrders();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerOrder> getOrderById(
            @PathVariable Integer id) {

        return service.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerOrder> updateOrder(
            @PathVariable Integer id,
            @RequestBody CustomerOrder details) {

        try {
            return ResponseEntity.ok(
                    service.updateOrder(id, details)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(
            @PathVariable Integer id) {

        try {
            service.deleteOrder(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
