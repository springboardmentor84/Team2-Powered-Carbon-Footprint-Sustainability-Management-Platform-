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
public class UpdatePreferencesRequest {
    @NotBlank(message = "Preferences cannot be blank")
    private String preferences;
}
