package com.ecotrack.backend.dto.response;

import com.ecotrack.backend.enums.CarbonCategory;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryEmissionResponse {
    private CarbonCategory category;
    private Double totalEmission;
}
