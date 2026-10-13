package com.hcl.RetailManagement.repository;


import com.hcl.RetailManagement.entity.StockTransfer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockTransferRepository
        extends JpaRepository<StockTransfer, Integer> {

}
