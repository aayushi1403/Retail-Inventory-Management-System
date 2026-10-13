package com.hcl.RetailManagement.service;

import com.hcl.RetailManagement.entity.Role;
import com.hcl.RetailManagement.repository.RoleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RoleService {

    private final RoleRepository roleRepository;

    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    // Create Role
    public Role createRole(Role role) {
        return roleRepository.save(role);
    }

    // Get all Roles
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    // Get Role by ID
    public Optional<Role> getRoleById(Integer id) {
        return roleRepository.findById(id);
    }

    // Update Role
    public Role updateRole(Integer id, Role roleDetails) {

        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        role.setRoleName(roleDetails.getRoleName());
        role.setDescription(roleDetails.getDescription());

        return roleRepository.save(role);
    }

    // Delete Role
    public void deleteRole(Integer id) {

        if (!roleRepository.existsById(id)) {
            throw new RuntimeException("Role not found");
        }

        roleRepository.deleteById(id);
    }
}