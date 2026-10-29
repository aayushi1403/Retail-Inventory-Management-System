package com.hcl.RetailManagement;

import com.hcl.RetailManagement.dto.AuthRequest;
import com.hcl.RetailManagement.dto.AuthResponse;
import com.hcl.RetailManagement.dto.RegisterRequest;
import com.hcl.RetailManagement.entity.Role;
import com.hcl.RetailManagement.entity.User;
import com.hcl.RetailManagement.exception.EmailAlreadyExistsException;
import com.hcl.RetailManagement.exception.InvalidCredentialsException;
import com.hcl.RetailManagement.repository.RoleRepository;
import com.hcl.RetailManagement.repository.UserRepository;
import com.hcl.RetailManagement.security.JwtService;
import com.hcl.RetailManagement.security.TokenRevocationService;
import com.hcl.RetailManagement.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private TokenRevocationService tokenRevocationService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, roleRepository, passwordEncoder, jwtService, tokenRevocationService);
    }

    @Test
    void testRegisterSuccess_HashesPasswordAndAssignsSafeRole() {
        RegisterRequest req = new RegisterRequest();
        req.setFirstName("Sarah");
        req.setLastName("Connor");
        req.setEmail("sarah@example.com");
        req.setPassword("Secret123!");
        req.setPhone("5551234567");

        Role staffRole = new Role();
        staffRole.setRoleName("STAFF");

        when(userRepository.existsByEmail("sarah@example.com")).thenReturn(false);
        when(roleRepository.findByRoleNameIgnoreCase("STAFF")).thenReturn(Optional.of(staffRole));
        when(passwordEncoder.encode("Secret123!")).thenReturn("$2a$10$encodedHash1234567890");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setUserId(100);
            return u;
        });
        when(jwtService.generateToken(any(User.class), anyList())).thenReturn("mock.jwt.token");
        when(jwtService.getExpirationTime()).thenReturn(86400000L);

        AuthResponse resp = authService.register(req);

        assertNotNull(resp);
        assertEquals("mock.jwt.token", resp.getToken());
        assertEquals("sarah@example.com", resp.getUser().getEmail());
        assertEquals("STAFF", resp.getUser().getRoleName());

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();
        assertEquals("$2a$10$encodedHash1234567890", savedUser.getPassword());
        assertEquals("ACTIVE", savedUser.getStatus());
    }

    @Test
    void testRegister_PreventsDuplicateEmail() {
        RegisterRequest req = new RegisterRequest();
        req.setFirstName("Sarah");
        req.setEmail("existing@example.com");
        req.setPassword("Secret123!");

        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        assertThrows(EmailAlreadyExistsException.class, () -> authService.register(req));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testRegister_MitigatesPrivilegeEscalation() {
        RegisterRequest req = new RegisterRequest();
        req.setFirstName("Hacker");
        req.setEmail("hacker@example.com");
        req.setPassword("Secret123!");
        req.setRoleName("ADMIN"); // Attempting privilege escalation

        Role staffRole = new Role();
        staffRole.setRoleName("STAFF");

        when(userRepository.existsByEmail("hacker@example.com")).thenReturn(false);
        when(roleRepository.findByRoleNameIgnoreCase("STAFF")).thenReturn(Optional.of(staffRole));
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$hash");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        AuthResponse resp = authService.register(req);

        // Verify the role assigned was safely demoted to STAFF
        assertEquals("STAFF", resp.getUser().getRoleName());
    }

    @Test
    void testLogin_Success() {
        AuthRequest req = new AuthRequest("alex@example.com", "admin123");

        Role role = new Role();
        role.setRoleName("ADMIN");

        User user = new User();
        user.setUserId(1);
        user.setEmail("alex@example.com");
        user.setPassword("$2a$10$hashedPassword");
        user.setRole(role);
        user.setStatus("ACTIVE");

        when(userRepository.findByEmail("alex@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("admin123", "$2a$10$hashedPassword")).thenReturn(true);
        when(jwtService.generateToken(any(User.class), anyList())).thenReturn("signed.jwt.token");
        when(jwtService.getExpirationTime()).thenReturn(86400000L);

        AuthResponse resp = authService.login(req);

        assertNotNull(resp);
        assertEquals("signed.jwt.token", resp.getToken());
        assertEquals("alex@example.com", resp.getUser().getEmail());
    }

    @Test
    void testLogin_InvalidPassword_ThrowsException() {
        AuthRequest req = new AuthRequest("alex@example.com", "wrongpassword");

        User user = new User();
        user.setEmail("alex@example.com");
        user.setPassword("$2a$10$hashedPassword");
        user.setStatus("ACTIVE");

        when(userRepository.findByEmail("alex@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongpassword", "$2a$10$hashedPassword")).thenReturn(false);

        assertThrows(InvalidCredentialsException.class, () -> authService.login(req));
    }

    @Test
    void testLogout_RevokesToken() {
        String token = "Bearer sample.jwt.token";
        authService.logout(token);
        verify(tokenRevocationService).revokeToken(token);
    }
}
