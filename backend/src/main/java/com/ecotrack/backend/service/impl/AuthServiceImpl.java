package com.ecotrack.backend.service.impl;

import com.ecotrack.backend.dto.request.ChangePasswordRequest;
import com.ecotrack.backend.dto.request.DeactivateAccountRequest;
import com.ecotrack.backend.dto.request.ForgotPasswordRequest;
import com.ecotrack.backend.dto.request.LoginRequest;
import com.ecotrack.backend.dto.request.RegisterRequest;
import com.ecotrack.backend.dto.request.ResetPasswordRequest;
import com.ecotrack.backend.dto.request.VerifyOtpRequest;
import com.ecotrack.backend.dto.response.LoginResponse;
import com.ecotrack.backend.dto.response.RegisterResponse;
import com.ecotrack.backend.entity.User;
import com.ecotrack.backend.enums.Role;
import com.ecotrack.backend.exception.custom.EmailAlreadyExistsException;
import com.ecotrack.backend.exception.custom.InvalidCredentialsException;
import com.ecotrack.backend.repository.UserRepository;
import com.ecotrack.backend.security.jwt.JwtService;
import com.ecotrack.backend.service.interfaces.AuthService;
import com.ecotrack.backend.service.interfaces.PasswordResetOtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final PasswordResetOtpService passwordResetOtpService;

    @Value("${security.jwt.expiration-time}")
    private long jwtExpiration;

    // ============================================================
    // REGISTER
    // ============================================================

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

    // ============================================================
    // LOGIN
    // ============================================================

    @Override
    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new InvalidCredentialsException(
                                "Invalid email or password"
                        )
                );

        if (!user.getActive()) {
            throw new InvalidCredentialsException(
                    "Your account has been deactivated. Please contact support."
            );
        }

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {
            throw new InvalidCredentialsException(
                    "Invalid email or password"
            );
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

    // ============================================================
    // CHANGE PASSWORD
    // ============================================================

    @Override
    public void changePassword(
            String email,
            ChangePasswordRequest request
    ) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        if (!passwordEncoder.matches(
                request.currentPassword(),
                user.getPassword()
        )) {
            throw new RuntimeException(
                    "Current password is incorrect"
            );
        }

        if (!request.newPassword()
                .equals(request.confirmPassword())) {

            throw new RuntimeException(
                    "New password and confirm password do not match"
            );
        }

        if (passwordEncoder.matches(
                request.newPassword(),
                user.getPassword()
        )) {

            throw new RuntimeException(
                    "New password cannot be the same as your current password"
            );
        }

        user.setPassword(
                passwordEncoder.encode(
                        request.newPassword()
                )
        );

        userRepository.save(user);
    }

    // ============================================================
    // DEACTIVATE ACCOUNT
    // ============================================================

    @Override
    public void deactivateAccount(
            String email,
            DeactivateAccountRequest request
    ) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        if (!passwordEncoder.matches(
                request.password(),
                user.getPassword()
        )) {

            throw new RuntimeException(
                    "Incorrect password. Account was not deactivated."
            );
        }

        user.setActive(false);

        userRepository.save(user);
    }

    // ============================================================
    // FORGOT PASSWORD
    // ============================================================

    @Override
    public void forgotPassword(
            ForgotPasswordRequest request
    ) {

        User user = userRepository.findByEmail(
                request.email()
        ).orElseThrow(() ->
                new RuntimeException(
                        "No account found with this email address"
                )
        );

        if (!user.getActive()) {
            throw new RuntimeException(
                    "This account has been deactivated."
            );
        }

        passwordResetOtpService.generateOtp(
                user.getEmail()
        );
    }

    // ============================================================
    // VERIFY OTP
    // ============================================================

    @Override
    public void verifyOtp(
            VerifyOtpRequest request
    ) {

        passwordResetOtpService.verifyOtp(
                request.email(),
                request.otp()
        );
    }

    // ============================================================
    // RESET PASSWORD
    // ============================================================

    @Override
    public void resetPassword(
            ResetPasswordRequest request
    ) {

        if (!request.newPassword()
                .equals(request.confirmPassword())) {

            throw new RuntimeException(
                    "New password and confirm password do not match"
            );
        }

        User user = userRepository.findByEmail(
                request.email()
        ).orElseThrow(() ->
                new RuntimeException("User not found")
        );

        if (!user.getActive()) {
            throw new RuntimeException(
                    "This account has been deactivated."
            );
        }

        boolean otpVerified =
                passwordResetOtpService.isOtpVerified(
                        request.email(),
                        request.otp()
                );

        if (!otpVerified) {
            throw new RuntimeException(
                    "OTP verification is required or OTP has expired."
            );
        }

        user.setPassword(
                passwordEncoder.encode(
                        request.newPassword()
                )
        );

        userRepository.save(user);

        passwordResetOtpService.deleteOtp(
                request.email()
        );
    }
}