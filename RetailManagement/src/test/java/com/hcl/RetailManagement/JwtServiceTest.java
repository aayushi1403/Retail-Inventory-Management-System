package com.hcl.RetailManagement;

import com.hcl.RetailManagement.entity.Role;
import com.hcl.RetailManagement.entity.User;
import com.hcl.RetailManagement.security.CustomUserDetails;
import com.hcl.RetailManagement.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", "RetailFlowSuperSecretKeyForJwtAuthenticationMustBeAtLeast256Bits2026");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 3600000L); // 1 hour
    }

    @Test
    void testGenerateAndValidateToken() {
        Role role = new Role();
        role.setRoleName("STAFF");

        User user = new User();
        user.setUserId(10);
        user.setEmail("staff@example.com");
        user.setFirstName("Tyler");
        user.setLastName("Durden");
        user.setRole(role);
        user.setStatus("ACTIVE");

        CustomUserDetails userDetails = new CustomUserDetails(user);

        String token = jwtService.generateToken(user, List.of("products.read", "inventory.read"));
        assertNotNull(token);
        assertFalse(token.isEmpty());

        // Extract claims
        String username = jwtService.extractUsername(token);
        assertEquals("staff@example.com", username);

        // Validate token
        assertTrue(jwtService.isTokenValid(token, userDetails));
        assertTrue(jwtService.isTokenValid(token));
    }

    @Test
    void testTokenExpirationValidation() {
        Role role = new Role();
        role.setRoleName("STAFF");

        User user = new User();
        user.setUserId(11);
        user.setEmail("expired@example.com");
        user.setRole(role);
        user.setStatus("ACTIVE");

        CustomUserDetails userDetails = new CustomUserDetails(user);

        // Configure a negative expiration (expired in the past)
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", -5000L);
        String expiredToken = jwtService.generateToken(user, List.of());

        assertFalse(jwtService.isTokenValid(expiredToken, userDetails));
        assertFalse(jwtService.isTokenValid(expiredToken));
    }

    @Test
    void testInvalidTokenSignature() {
        String invalidToken = "eyJhbGciOiJIUzI1NiJ9.invalidpayload.invalidsignature";
        assertFalse(jwtService.isTokenValid(invalidToken));
    }
}
