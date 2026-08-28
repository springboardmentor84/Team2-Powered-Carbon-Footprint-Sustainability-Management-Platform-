package com.ecotrack.backend.service.interfaces;

public interface PasswordResetOtpService {

    void generateOtp(String email);

    void verifyOtp(String email, String otp);

    boolean isOtpVerified(String email, String otp);

    void deleteOtp(String email);
}