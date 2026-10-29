package com.hcl.RetailManagement.service;

import com.hcl.RetailManagement.dto.AuthRequest;
import com.hcl.RetailManagement.dto.AuthResponse;
import com.hcl.RetailManagement.dto.RegisterRequest;
import com.hcl.RetailManagement.dto.UserDto;
import com.hcl.RetailManagement.entity.Role;
import com.hcl.RetailManagement.entity.User;
import com.hcl.RetailManagement.exception.EmailAlreadyExistsException;
import com.hcl.RetailManagement.exception.InvalidCredentialsException;
import com.hcl.RetailManagement.exception.ResourceNotFoundException;
import com.hcl.RetailManagement.repository.RoleRepository;
import com.hcl.RetailManagement.repository.UserRepository;
import com.hcl.RetailManagement.security.JwtService;
import com.hcl.RetailManagement.security.TokenRevocationService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TokenRevocationService tokenRevocationService;

    public AuthService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       TokenRevocationService tokenRevocationService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.tokenRevocationService = tokenRevocationService;
    }

    public AuthResponse login(AuthRequest request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            throw new IllegalArgumentException("Email / User ID and password are required.");
        }

        String identifier = request.getEmail().trim();
        if (identifier.startsWith("#")) {
            identifier = identifier.substring(1).trim();
        }

        User user = null;
        if (identifier.matches("\\d+")) {
            try {
                Integer uid = Integer.parseInt(identifier);
                user = userRepository.findById(uid).orElse(null);
            } catch (Exception ignored) {
            }
        }

        if (user == null) {
            user = userRepository.findByEmail(identifier.toLowerCase()).orElse(null);
        }

        if (user == null) {
            throw new InvalidCredentialsException("Invalid User ID / email or password.");
        }

        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw new RuntimeException("Account is currently inactive. Please contact your system administrator.");
        }

        String storedPassword = user.getPassword();
        boolean passwordMatches = false;

        // Check if already BCrypt encoded ($2a$, $2b$, or $2y$)
        if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$") || storedPassword.startsWith("$2y$")) {
            passwordMatches = passwordEncoder.matches(request.getPassword().trim(), storedPassword);
        } else {
            // Legacy plaintext fallback: transparently upgrade to BCrypt
            if (storedPassword.equals(request.getPassword().trim())) {
                passwordMatches = true;
                user.setPassword(passwordEncoder.encode(request.getPassword().trim()));
                userRepository.save(user);
            }
        }

        if (!passwordMatches) {
            throw new InvalidCredentialsException("Invalid User ID / email or password.");
        }

        List<String> permissions = getPermissionsForRole(user.getRole() != null ? user.getRole().getRoleName() : null);
        String token = jwtService.generateToken(user, permissions);
        UserDto userDto = toUserDto(user);

        return new AuthResponse(token, jwtService.getExpirationTime(), userDto, "Authentication successful");
    }

    public AuthResponse register(RegisterRequest request) {
        if (request.getEmail() == null || request.getPassword() == null || request.getFirstName() == null) {
            throw new IllegalArgumentException("First name, email, and password are required.");
        }

        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException("An account with this email already exists: " + email);
        }

        // Prevent privilege escalation: public registration defaults to STAFF or safe non-admin roles
        String requestedRole = request.getRoleName();
        String safeRoleName = "STAFF";
        if (requestedRole != null) {
            String normalized = requestedRole.trim().toUpperCase();
            if (normalized.contains("ADMIN") || normalized.contains("MANAGER")) {
                // Deny privilege escalation to admin/manager from public sign up
                safeRoleName = "STAFF";
            } else if (normalized.contains("CUSTOMER")) {
                safeRoleName = "CUSTOMER";
            } else if (normalized.contains("RETAIL") || normalized.contains("STAFF")) {
                safeRoleName = "STAFF";
            } else {
                safeRoleName = "STAFF";
            }
        }

        final String targetRoleName = safeRoleName;
        Role role = roleRepository.findByRoleNameIgnoreCase(targetRoleName)
                .orElseGet(() -> roleRepository.findByRoleNameIgnoreCase("STAFF")
                        .orElseGet(() -> roleRepository.findByRoleNameIgnoreCase("RETAILER")
                                .orElseGet(() -> {
                                    Role newRole = new Role();
                                    newRole.setRoleName("STAFF");
                                    newRole.setDescription("Retail Operations Staff Member");
                                    return roleRepository.save(newRole);
                                })));

        User user = new User();
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName() != null ? request.getLastName().trim() : null);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword().trim()));
        user.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        user.setRole(role);
        user.setStatus("ACTIVE");

        User savedUser = userRepository.save(user);

        List<String> permissions = getPermissionsForRole(role.getRoleName());
        String token = jwtService.generateToken(savedUser, permissions);
        UserDto userDto = toUserDto(savedUser);

        return new AuthResponse(token, jwtService.getExpirationTime(), userDto, "Registration successful");
    }

    public UserDto getCurrentUser(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7).trim();
        }

        if (token != null && !tokenRevocationService.isRevoked(token) && jwtService.isTokenValid(token)) {
            try {
                String email = jwtService.extractUsername(token);
                return userRepository.findByEmail(email)
                        .map(this::toUserDto)
                        .orElse(null);
            } catch (Exception ignored) {
            }
        }

        return null;
    }

    public UserDto getCurrentUserByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase())
                .map(this::toUserDto)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    public void logout(String token) {
        if (token != null) {
            tokenRevocationService.revokeToken(token);
        }
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
        } else if (normalized.contains("MANAGER")) {
            return Arrays.asList("inventory.read", "inventory.manage", "warehouses.read",
                    "stock_transfers.read", "stock_transfers.create", "stock_transfers.approve",
                    "purchase_orders.read", "purchase_orders.receive", "products.read", "reports.read");
        } else if (normalized.contains("STAFF") || normalized.contains("RETAIL") || normalized.contains("STORE")) {
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
}
