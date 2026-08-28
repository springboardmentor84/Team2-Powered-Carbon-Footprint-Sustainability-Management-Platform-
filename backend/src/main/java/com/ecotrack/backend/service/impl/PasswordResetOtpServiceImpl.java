package com.ecotrack.backend.service.impl;

import com.ecotrack.backend.entity.PasswordResetOtp;
import com.ecotrack.backend.repository.PasswordResetOtpRepository;
import com.ecotrack.backend.service.interfaces.PasswordResetOtpService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Random;

@Service
@Transactional
public class PasswordResetOtpServiceImpl implements PasswordResetOtpService {

    private final PasswordResetOtpRepository passwordResetOtpRepository;

    public PasswordResetOtpServiceImpl(
            PasswordResetOtpRepository passwordResetOtpRepository
    ) {
        this.passwordResetOtpRepository = passwordResetOtpRepository;
    }

    @Override
    public void generateOtp(String email) {

        passwordResetOtpRepository.deleteByEmail(email);

        String otp = String.format(
                "%06d",
                new Random().nextInt(1_000_000)
        );

        PasswordResetOtp passwordResetOtp = new PasswordResetOtp(
                email,
                otp,
                LocalDateTime.now().plusMinutes(10),
                false
        );

        passwordResetOtpRepository.save(passwordResetOtp);

        // Temporary: OTP will be visible in the backend terminal.
        // We can replace this with actual email sending later.
        System.out.println();
        System.out.println("==========================================");
        System.out.println("PASSWORD RESET OTP");
        System.out.println("Email: " + email);
        System.out.println("OTP: " + otp);
        System.out.println("Expires: 10 minutes");
        System.out.println("==========================================");
        System.out.println();
    }

    @Override
    public void verifyOtp(String email, String otp) {

        PasswordResetOtp passwordResetOtp =
                passwordResetOtpRepository
                        .findTopByEmailOrderByIdDesc(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "OTP not found. Please request a new OTP."
                                )
                        );

        if (LocalDateTime.now().isAfter(passwordResetOtp.getExpiresAt())) {
            throw new RuntimeException(
                    "OTP has expired. Please request a new OTP."
            );
        }

        if (!passwordResetOtp.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        passwordResetOtp.setVerified(true);

        passwordResetOtpRepository.save(passwordResetOtp);
    }

    @Override
    public boolean isOtpVerified(String email, String otp) {

        return passwordResetOtpRepository
                .findTopByEmailOrderByIdDesc(email)
                .map(passwordResetOtp ->
                        passwordResetOtp.isVerified()
                                && passwordResetOtp.getOtp().equals(otp)
                                && !LocalDateTime.now()
                                .isAfter(passwordResetOtp.getExpiresAt())
                )
                .orElse(false);
    }

    @Override
    public void deleteOtp(String email) {
        passwordResetOtpRepository.deleteByEmail(email);
    }
}