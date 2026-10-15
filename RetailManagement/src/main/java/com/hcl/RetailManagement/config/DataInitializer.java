package com.hcl.RetailManagement.config;

import com.hcl.RetailManagement.entity.Role;
import com.hcl.RetailManagement.entity.User;
import com.hcl.RetailManagement.repository.RoleRepository;
import com.hcl.RetailManagement.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;

    public DataInitializer(RoleRepository roleRepository, UserRepository userRepository) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        // Ensure standard business roles exist
        Role adminRole = getOrCreateRole("admin", "System Administrator with full access");
        Role managerRole = getOrCreateRole("manager", "Warehouse & Inventory Operations Manager");
        Role retailerRole = getOrCreateRole("retailer", "Store Retailer & Order Operator");
        Role procurementRole = getOrCreateRole("procurement", "Procurement & Supplier Relations Specialist");
        Role customerRole = getOrCreateRole("customer", "End Consumer & General Customer");

        // Seed demo accounts for seamless role-based testing
        getOrCreateUser("admin@retailflow.com", "admin123", "Alex", "Vance", adminRole, "8888000001");
        getOrCreateUser("manager@retailflow.com", "manager123", "Marcus", "Lee", managerRole, "8888000002");
        getOrCreateUser("retailer@retailflow.com", "retail123", "Sophia", "Patel", retailerRole, "8888000003");
        getOrCreateUser("procurement@retailflow.com", "procure123", "David", "Miller", procurementRole, "8888000004");
        getOrCreateUser("customer@retailflow.com", "customer123", "Emma", "Watson", customerRole, "8888000005");
    }

    private Role getOrCreateRole(String roleName, String description) {
        return roleRepository.findByRoleNameIgnoreCase(roleName).orElseGet(() -> {
            Role role = new Role();
            role.setRoleName(roleName);
            role.setDescription(description);
            return roleRepository.save(role);
        });
    }

    private void getOrCreateUser(String email, String password, String firstName, String lastName, Role role, String phone) {
        if (userRepository.findByEmail(email).isEmpty()) {
            User user = new User();
            user.setEmail(email);
            user.setPassword(password);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setRole(role);
            user.setPhone(phone);
            user.setStatus("ACTIVE");
            userRepository.save(user);
        }
    }
}
