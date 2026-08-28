package com.ecotrack.backend.service.interfaces;

import com.ecotrack.backend.dto.request.ChangePasswordRequest;
import com.ecotrack.backend.dto.request.DeactivateAccountRequest;
import com.ecotrack.backend.dto.request.ForgotPasswordRequest;
import com.ecotrack.backend.dto.request.LoginRequest;
import com.ecotrack.backend.dto.request.RegisterRequest;
import com.ecotrack.backend.dto.request.ResetPasswordRequest;
import com.ecotrack.backend.dto.request.VerifyOtpRequest;
import com.ecotrack.backend.dto.response.LoginResponse;
import com.ecotrack.backend.dto.response.RegisterResponse;

public interface AuthService {

    // Existing authentication methods
    RegisterResponse register(RegisterRequest request);

    LoginResponse login(LoginRequest request);

    // Account settings
    void changePassword(
            String email,
            ChangePasswordRequest request
    );

    void deactivateAccount(
            String email,
            DeactivateAccountRequest request
    );

    // Forgot password flow
    void forgotPassword(
            ForgotPasswordRequest request
    );

    void verifyOtp(
            VerifyOtpRequest request
    );

    void resetPassword(
            ResetPasswordRequest request
    );
}