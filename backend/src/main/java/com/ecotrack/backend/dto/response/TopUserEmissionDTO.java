package com.ecotrack.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopUserEmissionDTO {
    private String name;
    private String email;
    private Double totalEmission;
}
