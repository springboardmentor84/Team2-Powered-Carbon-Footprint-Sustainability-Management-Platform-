package com.ecotrack.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserProfileResponse {
    private String fullName;
    private String email;
    private String profileImage;
    private String preferences;
    private Integer ecoPoints;
    private String role;
    private String currentLevel;
    private String nextLevel;
    private Integer pointsRemaining;
    private Integer progressPercentage;
    
    private String gender;
    private java.time.LocalDate dateOfBirth;
    private String phone;
    private String location;
    private String university;
    private String department;
    private String rollNumber;
    private String year;
    
    private Double totalEmissions;
    private Integer currentStreak;
    private Integer activitiesCount;
    private Integer globalRank;
    private java.time.LocalDateTime createdAt;
    private String accountStatus;
}
