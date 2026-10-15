package com.hcl.RetailManagement.service;

import com.hcl.RetailManagement.dto.AuthRequest;
import com.hcl.RetailManagement.dto.AuthResponse;
import com.hcl.RetailManagement.dto.RegisterRequest;
import com.hcl.RetailManagement.dto.UserDto;
import com.hcl.RetailManagement.entity.Role;
import com.hcl.RetailManagement.entity.User;
import com.hcl.RetailManagement.repository.RoleRepository;
import com.hcl.RetailManagement.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public AuthService(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    public AuthResponse login(AuthRequest request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            throw new IllegalArgumentException("Email and password are required.");
        }

        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("Invalid email or password."));

        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw new RuntimeException("Account is currently inactive. Please contact your system administrator.");
        }

        // Support direct comparison or bcrypt match
        if (!user.getPassword().equals(request.getPassword().trim())) {
            throw new RuntimeException("Invalid email or password.");
        }

        String token = generateToken(user);
        UserDto userDto = toUserDto(user);

        return new AuthResponse(token, userDto, "Authentication successful");
    }

    public AuthResponse register(RegisterRequest request) {
        if (request.getEmail() == null || request.getPassword() == null || request.getFirstName() == null) {
            throw new IllegalArgumentException("First name, email, and password are required.");
        }

        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("An account with this email already exists.");
        }

        String roleName = request.getRoleName() != null ? request.getRoleName() : "RETAILER";
        Role role = roleRepository.findByRoleNameIgnoreCase(roleName)
                .orElseGet(() -> roleRepository.findAll().stream().findFirst().orElseThrow(
                        () -> new RuntimeException("No valid role found.")
                ));

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(email);
        user.setPassword(request.getPassword().trim());
        user.setPhone(request.getPhone());
        user.setRole(role);
        user.setStatus("ACTIVE");

        User savedUser = userRepository.save(user);
        String token = generateToken(savedUser);
        UserDto userDto = toUserDto(savedUser);

        return new AuthResponse(token, userDto, "Registration successful");
    }

    public UserDto getCurrentUser(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        // Token format: base64(email:timestamp) or simple token
        if (token != null) {
            try {
                String decoded = new String(Base64.getDecoder().decode(token));
                String email = decoded.split(":")[0];
                return userRepository.findByEmail(email)
                        .map(this::toUserDto)
                        .orElse(null);
            } catch (Exception ignored) {
            }
        }

        return null;
    }

    public UserDto toUserDto(User user) {
        UserDto dto = new UserDto();
        dto.setUserId(user.getUserId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setStatus(user.getStatus());
        dto.setCreatedAt(user.getCreatedAt());

        if (user.getRole() != null) {
            String roleName = user.getRole().getRoleName();
            dto.setRole(user.getRole());
            dto.setRoleName(roleName);
            dto.setRoleDescription(user.getRole().getDescription());
            dto.setPermissions(getPermissionsForRole(roleName));
        } else {
            dto.setRoleName("GUEST");
            dto.setPermissions(Collections.emptyList());
        }

        return dto;
    }

    public List<String> getPermissionsForRole(String roleName) {
        if (roleName == null) return Collections.emptyList();
        String normalized = roleName.trim().toUpperCase();

        if (normalized.contains("ADMIN")) {
            return Arrays.asList("*", "admin.access", "users.manage", "products.manage", "inventory.manage",
                    "warehouses.manage", "suppliers.manage", "orders.manage", "transfers.manage", "reports.read");
        } else if (normalized.contains("MANAGER") || normalized.contains("MODERATOR")) {
            return Arrays.asList("inventory.read", "inventory.manage", "warehouses.read",
                    "stock_transfers.read", "stock_transfers.create", "stock_transfers.approve",
                    "purchase_orders.read", "purchase_orders.receive", "products.read", "reports.read");
        } else if (normalized.contains("RETAIL") || normalized.contains("STORE")) {
            return Arrays.asList("products.read", "inventory.read", "customer_orders.read",
                    "customer_orders.create", "warehouses.read");
        } else if (normalized.contains("PROCURE") || normalized.contains("SUPPLI")) {
            return Arrays.asList("suppliers.read", "suppliers.manage", "purchase_orders.read",
                    "purchase_orders.create", "purchase_orders.manage", "products.read", "warehouses.read");
        } else if (normalized.contains("CUSTOMER")) {
            return Arrays.asList("products.read", "customer_orders.read", "customer_orders.create");
        }

        return Arrays.asList("products.read", "inventory.read");
    }

    private String generateToken(User user) {
        String payload = user.getEmail() + ":" + System.currentTimeMillis();
        return Base64.getEncoder().encodeToString(payload.getBytes());
    }
}
