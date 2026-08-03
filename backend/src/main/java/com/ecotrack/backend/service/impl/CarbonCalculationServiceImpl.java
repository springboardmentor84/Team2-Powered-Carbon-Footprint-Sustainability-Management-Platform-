package com.ecotrack.backend.service.impl;

import com.ecotrack.backend.enums.CarbonCategory;
import com.ecotrack.backend.service.interfaces.CarbonCalculationService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class CarbonCalculationServiceImpl implements CarbonCalculationService {

    @Override
    public Double calculateEmission(CarbonCategory category, String activity, Double quantity) {
        double factor = getEmissionFactor(category, activity);
        double rawEmission = quantity * factor;
        return roundToTwoDecimalPlaces(rawEmission);
    }

    private double getEmissionFactor(CarbonCategory category, String activity) {
        if (category == null || activity == null) {
            return 1.0;
        }

        String act = activity.trim().toLowerCase();

        switch (category) {
            case TRANSPORT:
                return getTransportFactor(act);
            case ELECTRICITY:
                return 0.82;
            case WATER:
                return 0.0003;
            case FOOD:
                return getFoodFactor(act);
            case WASTE:
                return 0.45; // General Waste
            case SHOPPING:
                return 15.0; // Clothing Purchase
            default:
                return 1.0;
        }
    }

    private double getTransportFactor(String activity) {
        switch (activity) {
            case "car":
                return 0.192;
            case "bike":
                return 0.000;
            case "bus":
                return 0.105;
            case "train":
                return 0.041;
            default:
                return 1.0;
        }
    }

    private double getFoodFactor(String activity) {
        if (activity.contains("vegetarian")) {
            return 1.5;
        } else if (activity.contains("chicken")) {
            return 3.5;
        } else if (activity.contains("beef")) {
            return 7.2;
        }
        return 1.0;
    }

    private Double roundToTwoDecimalPlaces(double value) {
        return BigDecimal.valueOf(value)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }
}
