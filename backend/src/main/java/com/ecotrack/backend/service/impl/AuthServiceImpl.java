package com.ecotrack.backend.service.impl;

import com.ecotrack.backend.dto.request.LoginRequest;
import com.ecotrack.backend.dto.request.RegisterRequest;
import com.ecotrack.backend.dto.response.LoginResponse;
import com.ecotrack.backend.dto.response.RegisterResponse;
import com.ecotrack.backend.entity.User;
import com.ecotrack.backend.enums.Role;
import com.ecotrack.backend.repository.UserRepository;
import com.ecotrack.backend.service.interfaces.AuthService;
import com.ecotrack.backend.exception.custom.EmailAlreadyExistsException;
import com.ecotrack.backend.exception.custom.InvalidCredentialsException;
import com.ecotrack.backend.security.jwt.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Value("${security.jwt.expiration-time}")
    private long jwtExpiration;

    @Override
    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email already exists");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .ecoPoints(0)
                .active(true)
                .build();

        User savedUser = userRepository.save(user);

        return RegisterResponse.builder()
                .id(savedUser.getId())
                .fullName(savedUser.getFullName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .ecoPoints(savedUser.getEcoPoints())
                .active(savedUser.getActive())
                .createdAt(savedUser.getCreatedAt())
                .build();
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        String jwtToken = jwtService.generateToken(user);

        return LoginResponse.builder()
                .token(jwtToken)
                .tokenType("Bearer")
                .expiresIn(jwtExpiration)
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}
