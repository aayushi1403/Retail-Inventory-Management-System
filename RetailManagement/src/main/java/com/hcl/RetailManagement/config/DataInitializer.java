package com.hcl.RetailManagement.config;

import com.hcl.RetailManagement.entity.Role;
import com.hcl.RetailManagement.entity.User;
import com.hcl.RetailManagement.repository.RoleRepository;
import com.hcl.RetailManagement.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(RoleRepository roleRepository,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Ensure standard business roles exist
        Role adminRole = getOrCreateRole("admin", "System Administrator with full access");
        Role managerRole = getOrCreateRole("manager", "Warehouse & Inventory Operations Manager");
        Role staffRole = getOrCreateRole("staff", "Retail Operations Staff Member");
        Role retailerRole = getOrCreateRole("retailer", "Store Retailer & Order Operator");
        Role procurementRole = getOrCreateRole("procurement", "Procurement & Supplier Relations Specialist");
        Role customerRole = getOrCreateRole("customer", "End Consumer & General Customer");

        // Seed demo accounts with BCrypt-hashed passwords for secure testing
        getOrCreateUser("admin@retailflow.com", "admin123", "Alex", "Vance", adminRole, "8888000001");
        getOrCreateUser("manager@retailflow.com", "manager123", "Marcus", "Lee", managerRole, "8888000002");
        getOrCreateUser("staff@retailflow.com", "staff123", "Tyler", "Durden", staffRole, "8888000006");
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

    private void getOrCreateUser(String email, String rawPassword, String firstName, String lastName, Role role, String phone) {
        userRepository.findByEmail(email).ifPresentOrElse(existingUser -> {
            // If user exists and password is not yet BCrypt hashed, upgrade it seamlessly
            String currentPassword = existingUser.getPassword();
            if (currentPassword == null || (!currentPassword.startsWith("$2a$") && !currentPassword.startsWith("$2b$") && !currentPassword.startsWith("$2y$"))) {
                existingUser.setPassword(passwordEncoder.encode(rawPassword));
                userRepository.save(existingUser);
            }
        }, () -> {
            User user = new User();
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(rawPassword));
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setRole(role);
            user.setPhone(phone);
            user.setStatus("ACTIVE");
            userRepository.save(user);
        });
    }
}
