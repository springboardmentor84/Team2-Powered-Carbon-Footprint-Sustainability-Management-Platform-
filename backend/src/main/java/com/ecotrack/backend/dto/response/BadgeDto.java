package com.ecotrack.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BadgeDto {
    private Long id;
    private String name;
    private String description;
    private String icon;
    private Integer pointsRequired;
    private Boolean unlocked;
}
