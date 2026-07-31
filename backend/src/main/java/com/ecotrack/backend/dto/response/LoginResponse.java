package com.ecotrack.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse {

    private String token;
    private String tokenType;
    private long expiresIn;
    
    private Long id;
    private String fullName;
    private String email;
    private String role;
}
