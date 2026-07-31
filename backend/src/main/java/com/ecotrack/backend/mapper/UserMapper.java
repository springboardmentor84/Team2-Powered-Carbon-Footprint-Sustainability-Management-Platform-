package com.ecotrack.backend.mapper;

import com.ecotrack.backend.dto.response.RegisterResponse;
import com.ecotrack.backend.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public RegisterResponse toRegisterResponse(User user) {
        return RegisterResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .ecoPoints(user.getEcoPoints())
                .active(user.getActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
