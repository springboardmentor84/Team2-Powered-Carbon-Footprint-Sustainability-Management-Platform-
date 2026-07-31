package com.ecotrack.backend.dto.response;

import com.ecotrack.backend.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterResponse {

    private Long id;
    
    private String fullName;
    
    private String email;
    
    private Role role;
    
    private Integer ecoPoints;
    
    private Boolean active;
    
    private LocalDateTime createdAt;
}
