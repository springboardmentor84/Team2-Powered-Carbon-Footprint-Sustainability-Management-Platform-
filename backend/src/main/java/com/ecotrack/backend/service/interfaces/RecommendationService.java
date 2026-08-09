package com.ecotrack.backend.service.interfaces;

import com.ecotrack.backend.dto.response.RecommendationResponse;
import java.util.List;

public interface RecommendationService {
    List<RecommendationResponse> getRecommendations(String email);
}
