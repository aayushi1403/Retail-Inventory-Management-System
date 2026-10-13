package com.hcl.RetailManagement.service;

import com.hcl.RetailManagement.entity.Product;
import com.hcl.RetailManagement.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Optional<Product> getProductById(Integer id) {
        return productRepository.findById(id);
    }

    public Optional<Product> getProductBySku(String sku) {
        return productRepository.findBySku(sku);
    }

    public Product updateProduct(Integer id, Product details) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setCategory(details.getCategory());
        product.setProductName(details.getProductName());
        product.setSku(details.getSku());
        product.setDescription(details.getDescription());
        product.setPrice(details.getPrice());
        product.setReorderLevel(details.getReorderLevel());
        product.setStatus(details.getStatus());

        return productRepository.save(product);
    }

    public void deleteProduct(Integer id) {

        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found");
        }

        productRepository.deleteById(id);
    }
}