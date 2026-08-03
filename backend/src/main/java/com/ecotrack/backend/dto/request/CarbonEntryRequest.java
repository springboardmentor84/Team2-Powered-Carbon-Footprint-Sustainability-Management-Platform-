package com.ecotrack.backend.dto.request;

import com.ecotrack.backend.enums.CarbonCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CarbonEntryRequest {

    @NotNull(message = "Category is required")
    private CarbonCategory category;

    @NotBlank(message = "Activity cannot be blank")
    private String activity;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be greater than 0")
    private Double quantity;

    @NotBlank(message = "Unit is required")
    private String unit;
}
