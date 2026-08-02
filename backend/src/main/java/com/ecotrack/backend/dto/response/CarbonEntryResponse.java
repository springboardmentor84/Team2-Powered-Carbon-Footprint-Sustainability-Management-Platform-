package com.ecotrack.backend.dto.response;

import com.ecotrack.backend.enums.CarbonCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CarbonEntryResponse {
    
    private Long id;
    private CarbonCategory category;
    private String activity;
    private Double quantity;
    private String unit;
    private Double carbonEmission;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
