package com.hcl.RetailManagement;

import com.hcl.RetailManagement.controller.AuthController;
import com.hcl.RetailManagement.controller.ProductController;
import com.hcl.RetailManagement.dto.UserDto;
import com.hcl.RetailManagement.entity.Product;
import com.hcl.RetailManagement.entity.Role;
import com.hcl.RetailManagement.entity.User;
import com.hcl.RetailManagement.exception.GlobalExceptionHandler;
import com.hcl.RetailManagement.repository.UserRepository;
import com.hcl.RetailManagement.security.*;
import com.hcl.RetailManagement.service.AuthService;
import com.hcl.RetailManagement.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class SecurityIntegrationTest {

    private MockMvc mockMvc;

    @Mock
    private ProductService productService;

    @Mock
    private AuthService authService;

    @Mock
    private UserRepository userRepository;

    private JwtService jwtService;
    private TokenRevocationService tokenRevocationService;
    private CustomUserDetailsService customUserDetailsService;
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @BeforeEach
    void setUp() {
        org.springframework.security.core.context.SecurityContextHolder.clearContext();
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", "RetailFlowSuperSecretKeyForJwtAuthenticationMustBeAtLeast256Bits2026");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 86400000L);

        tokenRevocationService = new TokenRevocationService(jwtService);
        customUserDetailsService = new CustomUserDetailsService(userRepository);
        jwtAuthenticationFilter = new JwtAuthenticationFilter(jwtService, customUserDetailsService, tokenRevocationService);

        ProductController productController = new ProductController(productService);
        AuthController authController = new AuthController(authService);

        mockMvc = MockMvcBuilders.standaloneSetup(productController, authController)
                .addFilters(jwtAuthenticationFilter)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void testPublicLoginRoute_AccessibleWithoutToken() throws Exception {
        when(authService.login(any())).thenReturn(new com.hcl.RetailManagement.dto.AuthResponse("token", null, "OK"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"admin@retailflow.com\",\"password\":\"admin123\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void testAuthenticatedRoute_WithValidToken_Succeeds() throws Exception {
        Role staffRole = new Role();
        staffRole.setRoleName("STAFF");

        User user = new User();
        user.setUserId(99);
        user.setEmail("authtest@retailflow.com");
        user.setPassword("$2a$10$encryptedPassword");
        user.setRole(staffRole);
        user.setStatus("ACTIVE");

        when(userRepository.findByEmail("authtest@retailflow.com")).thenReturn(Optional.of(user));
        when(productService.getAllProducts()).thenReturn(List.of(new Product()));

        String token = jwtService.generateToken(user, List.of("products.read"));

        mockMvc.perform(get("/api/products")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void testRevokedToken_RejectedAfterLogout() throws Exception {
        Role staffRole = new Role();
        staffRole.setRoleName("STAFF");

        User user = new User();
        user.setUserId(99);
        user.setEmail("authtest@retailflow.com");
        user.setRole(staffRole);
        user.setStatus("ACTIVE");

        String token = jwtService.generateToken(user, List.of("products.read"));

        // Revoke the token (simulate logout)
        tokenRevocationService.revokeToken(token);

        // Access /api/auth/me should fail with unauthorized since token is revoked
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }
}
