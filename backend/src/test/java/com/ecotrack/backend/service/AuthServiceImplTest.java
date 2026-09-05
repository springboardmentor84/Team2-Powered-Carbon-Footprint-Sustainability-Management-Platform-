package com.ecotrack.backend.service;

import com.ecotrack.backend.dto.request.LoginRequest;
import com.ecotrack.backend.dto.request.RegisterRequest;
import com.ecotrack.backend.dto.response.LoginResponse;
import com.ecotrack.backend.dto.response.RegisterResponse;
import com.ecotrack.backend.entity.User;
import com.ecotrack.backend.enums.Role;
import com.ecotrack.backend.exception.custom.EmailAlreadyExistsException;
import com.ecotrack.backend.exception.custom.InvalidCredentialsException;
import com.ecotrack.backend.repository.UserRepository;
import com.ecotrack.backend.security.jwt.JwtService;
import com.ecotrack.backend.service.impl.AuthServiceImpl;
import com.ecotrack.backend.service.interfaces.PasswordResetOtpService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthServiceImpl Unit Tests")
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private PasswordResetOtpService passwordResetOtpService;

    @InjectMocks
    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        // Inject the @Value field since we're not loading Spring context
        ReflectionTestUtils.setField(authService, "jwtExpiration", 86400000L);
    }

    // ============================================================
    // REGISTER TESTS
    // ============================================================

    @Test
    @DisplayName("register - success: new email registers correctly")
    void register_success() {
        // Arrange
        RegisterRequest request = RegisterRequest.builder()
                .fullName("Test User")
                .email("test@ecotrack.com")
                .password("Password123")
                .build();

        User savedUser = User.builder()
                .id(1L)
                .fullName("Test User")
                .email("test@ecotrack.com")
                .password("encoded_password")
                .role(Role.USER)
                .ecoPoints(0)
                .active(true)
                .build();

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        // Act
        RegisterResponse response = authService.register(request);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getEmail()).isEqualTo("test@ecotrack.com");
        assertThat(response.getFullName()).isEqualTo("Test User");
        assertThat(response.getRole()).isEqualTo(Role.USER);
        verify(userRepository).save(any(User.class));
        verify(passwordEncoder).encode("Password123");
    }

    @Test
    @DisplayName("register - failure: duplicate email throws EmailAlreadyExistsException")
    void register_duplicateEmail_throwsException() {
        // Arrange
        RegisterRequest request = RegisterRequest.builder()
                .fullName("Test User")
                .email("existing@ecotrack.com")
                .password("Password123")
                .build();

        when(userRepository.existsByEmail("existing@ecotrack.com")).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(EmailAlreadyExistsException.class)
                .hasMessage("Email already exists");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("register - password is encoded, never stored in plain text")
    void register_passwordIsEncoded() {
        // Arrange
        RegisterRequest request = RegisterRequest.builder()
                .fullName("Test User")
                .email("test@ecotrack.com")
                .password("MyPlainPassword")
                .build();

        User savedUser = User.builder().id(1L).fullName("Test User")
                .email("test@ecotrack.com").password("$2a$hashed")
                .role(Role.USER).ecoPoints(0).active(true).build();

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode("MyPlainPassword")).thenReturn("$2a$hashed");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        // Act
        authService.register(request);

        // Assert: encoder was called with the plain password
        verify(passwordEncoder).encode("MyPlainPassword");
        // And save was called with the encoded password, not the plain one
        verify(userRepository).save(argThat(user ->
                user.getPassword().equals("$2a$hashed")
        ));
    }

    // ============================================================
    // LOGIN TESTS
    // ============================================================

    @Test
    @DisplayName("login - success: valid credentials return JWT token")
    void login_success() {
        // Arrange
        LoginRequest request = LoginRequest.builder()
                .email("user@ecotrack.com")
                .password("correctPassword")
                .build();

        User user = User.builder()
                .id(1L)
                .fullName("Eco User")
                .email("user@ecotrack.com")
                .password("encoded_password")
                .role(Role.USER)
                .active(true)
                .build();

        when(userRepository.findByEmail("user@ecotrack.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("correctPassword", "encoded_password")).thenReturn(true);
        when(jwtService.generateToken(user)).thenReturn("mock.jwt.token");

        // Act
        LoginResponse response = authService.login(request);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("mock.jwt.token");
        assertThat(response.getEmail()).isEqualTo("user@ecotrack.com");
        assertThat(response.getRole()).isEqualTo("USER");
        assertThat(response.getTokenType()).isEqualTo("Bearer");
    }

    @Test
    @DisplayName("login - failure: email not found throws InvalidCredentialsException")
    void login_emailNotFound_throwsException() {
        // Arrange
        LoginRequest request = LoginRequest.builder()
                .email("unknown@ecotrack.com")
                .password("anyPassword")
                .build();

        when(userRepository.findByEmail("unknown@ecotrack.com")).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Invalid email or password");
    }

    @Test
    @DisplayName("login - failure: wrong password throws InvalidCredentialsException")
    void login_wrongPassword_throwsException() {
        // Arrange
        LoginRequest request = LoginRequest.builder()
                .email("user@ecotrack.com")
                .password("wrongPassword")
                .build();

        User user = User.builder()
                .id(1L).email("user@ecotrack.com")
                .password("encoded_password").role(Role.USER).active(true).build();

        when(userRepository.findByEmail("user@ecotrack.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPassword", "encoded_password")).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Invalid email or password");

        verify(jwtService, never()).generateToken(any());
    }

    @Test
    @DisplayName("login - failure: deactivated account throws InvalidCredentialsException")
    void login_deactivatedAccount_throwsException() {
        // Arrange
        LoginRequest request = LoginRequest.builder()
                .email("inactive@ecotrack.com")
                .password("correctPassword")
                .build();

        User user = User.builder()
                .id(1L).email("inactive@ecotrack.com")
                .password("encoded_password").role(Role.USER).active(false).build();

        when(userRepository.findByEmail("inactive@ecotrack.com")).thenReturn(Optional.of(user));

        // Act & Assert
        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessageContaining("deactivated");

        verify(passwordEncoder, never()).matches(anyString(), anyString());
        verify(jwtService, never()).generateToken(any());
    }
}
