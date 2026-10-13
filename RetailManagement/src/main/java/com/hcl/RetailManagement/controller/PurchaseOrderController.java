package com.hcl.RetailManagement.controller;


import com.hcl.RetailManagement.entity.PurchaseOrder;
import com.hcl.RetailManagement.service.PurchaseOrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchase-orders")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    public PurchaseOrderController(
            PurchaseOrderService purchaseOrderService) {

        this.purchaseOrderService = purchaseOrderService;
    }

    @PostMapping
    public PurchaseOrder createPurchaseOrder(
            @RequestBody PurchaseOrder order) {

        return purchaseOrderService.createPurchaseOrder(order);
    }

    @GetMapping
    public List<PurchaseOrder> getAllPurchaseOrders() {
        return purchaseOrderService.getAllPurchaseOrders();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrder> getPurchaseOrderById(
            @PathVariable Integer id) {

        return purchaseOrderService
                .getPurchaseOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<PurchaseOrder> updatePurchaseOrder(
            @PathVariable Integer id,
            @RequestBody PurchaseOrder details) {

        try {
            return ResponseEntity.ok(
                    purchaseOrderService
                            .updatePurchaseOrder(id, details)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePurchaseOrder(
            @PathVariable Integer id) {

        try {
            purchaseOrderService.deletePurchaseOrder(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
