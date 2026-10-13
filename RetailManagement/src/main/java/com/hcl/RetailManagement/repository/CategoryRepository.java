package com.hcl.RetailManagement.repository;



import com.hcl.RetailManagement.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository
        extends JpaRepository<Category, Integer> {

}