package com.hcl.RetailManagement;

import com.hcl.RetailManagement.controller.AuthController;
import com.hcl.RetailManagement.dto.AuthRequest;
import com.hcl.RetailManagement.dto.AuthResponse;
import com.hcl.RetailManagement.dto.RegisterRequest;
import com.hcl.RetailManagement.dto.UserDto;
import com.hcl.RetailManagement.exception.EmailAlreadyExistsException;
import com.hcl.RetailManagement.exception.GlobalExceptionHandler;
import com.hcl.RetailManagement.exception.InvalidCredentialsException;
import com.hcl.RetailManagement.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void testSignup_Success() throws Exception {
        UserDto userDto = new UserDto();
        userDto.setEmail("newuser@retailflow.com");
        userDto.setFirstName("New");
        userDto.setRoleName("STAFF");

        AuthResponse resp = new AuthResponse("mock.jwt.token", userDto, "Registration successful");
        when(authService.register(any(RegisterRequest.class))).thenReturn(resp);

        String payload = """
                {
                    "firstName": "New",
                    "lastName": "User",
                    "email": "newuser@retailflow.com",
                    "password": "Password123!",
                    "phone": "555-123-4567"
                }
                """;

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("mock.jwt.token"))
                .andExpect(jsonPath("$.user.email").value("newuser@retailflow.com"));
    }

    @Test
    void testSignup_ValidationFailure_MissingFields() throws Exception {
        // Missing firstName, password too short, invalid email
        String invalidPayload = """
                {
                    "email": "invalid-email",
                    "password": "123"
                }
                """;

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidPayload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.fieldErrors.firstName").exists())
                .andExpect(jsonPath("$.fieldErrors.email").exists())
                .andExpect(jsonPath("$.fieldErrors.password").exists());
    }

    @Test
    void testSignup_DuplicateEmail_ReturnsConflict() throws Exception {
        when(authService.register(any(RegisterRequest.class)))
                .thenThrow(new EmailAlreadyExistsException("An account with this email already exists: duplicate@example.com"));

        String payload = """
                {
                    "firstName": "Duplicate",
                    "email": "duplicate@example.com",
                    "password": "Password123!"
                }
                """;

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("An account with this email already exists: duplicate@example.com"));
    }

    @Test
    void testLogin_Success() throws Exception {
        UserDto userDto = new UserDto();
        userDto.setEmail("admin@retailflow.com");

        AuthResponse resp = new AuthResponse("admin.jwt.token", userDto, "Authentication successful");
        when(authService.login(any(AuthRequest.class))).thenReturn(resp);

        String payload = """
                {
                    "email": "admin@retailflow.com",
                    "password": "admin123"
                }
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("admin.jwt.token"));
    }

    @Test
    void testLogin_InvalidCredentials_ReturnsUnauthorized() throws Exception {
        when(authService.login(any(AuthRequest.class)))
                .thenThrow(new InvalidCredentialsException("Invalid User ID / email or password."));

        String payload = """
                {
                    "email": "admin@retailflow.com",
                    "password": "wrongpassword"
                }
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void testLogout_Success() throws Exception {
        mockMvc.perform(post("/api/auth/logout")
                        .header("Authorization", "Bearer valid.jwt.token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Successfully logged out. Token has been revoked."));

        verify(authService).logout("Bearer valid.jwt.token");
    }
}
