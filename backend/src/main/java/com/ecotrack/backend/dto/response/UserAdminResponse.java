package com.ecotrack.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserAdminResponse {
    private Long id;
    private String fullName;
    private String email;
    private String role;
    private Integer ecoPoints;
    private Boolean active;
    private LocalDateTime createdAt;
}
