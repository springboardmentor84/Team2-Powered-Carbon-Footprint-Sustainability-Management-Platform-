package com.ecotrack.backend.service.interfaces;

import com.ecotrack.backend.enums.CarbonCategory;

public interface CarbonCalculationService {
    Double calculateEmission(CarbonCategory category, String activity, Double quantity);
}
