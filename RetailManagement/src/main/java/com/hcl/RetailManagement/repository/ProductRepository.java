package com.hcl.RetailManagement.repository;


import com.hcl.RetailManagement.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductRepository
        extends JpaRepository<Product, Integer> {

    Optional<Product> findBySku(String sku);
}

