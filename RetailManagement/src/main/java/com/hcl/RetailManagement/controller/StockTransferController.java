package com.hcl.RetailManagement.controller;


import com.hcl.RetailManagement.entity.StockTransfer;
import com.hcl.RetailManagement.service.StockTransferService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock-transfers")
public class StockTransferController {

    private final StockTransferService service;

    public StockTransferController(
            StockTransferService service) {

        this.service = service;
    }

    @PostMapping
    public StockTransfer createTransfer(
            @RequestBody StockTransfer transfer) {

        return service.createTransfer(transfer);
    }

    @GetMapping
    public List<StockTransfer> getAllTransfers() {
        return service.getAllTransfers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<StockTransfer> getTransferById(
            @PathVariable Integer id) {

        return service.getTransferById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<StockTransfer> updateTransfer(
            @PathVariable Integer id,
            @RequestBody StockTransfer details) {

        try {
            return ResponseEntity.ok(
                    service.updateTransfer(id, details)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransfer(
            @PathVariable Integer id) {

        try {
            service.deleteTransfer(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}