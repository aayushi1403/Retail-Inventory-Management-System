package com.hcl.RetailManagement.service;


import com.hcl.RetailManagement.entity.StockTransfer;
import com.hcl.RetailManagement.repository.StockTransferRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StockTransferService {

    private final StockTransferRepository repository;

    public StockTransferService(
            StockTransferRepository repository) {

        this.repository = repository;
    }

    public StockTransfer createTransfer(
            StockTransfer transfer) {

        return repository.save(transfer);
    }

    public List<StockTransfer> getAllTransfers() {
        return repository.findAll();
    }

    public Optional<StockTransfer> getTransferById(
            Integer id) {

        return repository.findById(id);
    }

    public StockTransfer updateTransfer(
            Integer id,
            StockTransfer details) {

        StockTransfer transfer =
                repository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Stock transfer not found"));

        transfer.setProduct(details.getProduct());
        transfer.setSourceWarehouse(
                details.getSourceWarehouse());
        transfer.setDestinationWarehouse(
                details.getDestinationWarehouse());
        transfer.setQuantity(details.getQuantity());
        transfer.setStatus(details.getStatus());
        transfer.setCreatedBy(details.getCreatedBy());

        return repository.save(transfer);
    }

    public void deleteTransfer(Integer id) {

        if (!repository.existsById(id)) {
            throw new RuntimeException(
                    "Stock transfer not found");
        }

        repository.deleteById(id);
    }
}