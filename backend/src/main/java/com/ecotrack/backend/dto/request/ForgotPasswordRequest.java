package com.ecotrack.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(

        @NotBlank(message = "Email is required")
        @Email(message = "Please enter a valid email address")
        String email

) {
}