package com.hcl.RetailManagement.repository;
import com.hcl.RetailManagement.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role,Integer>{
    java.util.Optional<Role> findByRoleNameIgnoreCase(String roleName);
}
