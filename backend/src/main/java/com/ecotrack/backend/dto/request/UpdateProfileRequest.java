package com.ecotrack.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateProfileRequest {
    @NotBlank(message = "Full name cannot be blank")
    private String fullName;
    
    private String profileImage;

    private String gender;
    private java.time.LocalDate dateOfBirth;
    private String phone;
    private String location;
    private String university;
    private String department;
    private String rollNumber;
    private String year;
}
