package com.hcl.RetailManagement.repository;
import com.hcl.RetailManagement.entity.Role;
import com.hcl.RetailManagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
public interface UserRepository extends JpaRepository<User,Integer>{

    Optional<User> findByEmail(String email);
}