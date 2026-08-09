package com.ecotrack.backend.service.impl;

import com.ecotrack.backend.dto.response.CategoryEmissionResponse;
import com.ecotrack.backend.dto.response.DashboardSummaryResponse;
import com.ecotrack.backend.dto.response.CarbonEntryResponse;
import com.ecotrack.backend.dto.response.GoalResponse;
import com.ecotrack.backend.dto.response.UserProfileResponse;
import com.ecotrack.backend.dto.response.RecommendationResponse;
import com.ecotrack.backend.service.interfaces.AIService;
import com.ecotrack.backend.service.interfaces.DashboardService;
import com.ecotrack.backend.service.interfaces.GoalService;
import com.ecotrack.backend.service.interfaces.RecommendationService;
import com.ecotrack.backend.service.interfaces.UserService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationServiceImpl implements RecommendationService {

    private final DashboardService dashboardService;
    private final GoalService goalService;
    private final UserService userService;
    private final AIService aiService;
    private final ObjectMapper objectMapper;

    @Override
    public List<RecommendationResponse> getRecommendations(String email) {
        try {
            // Gather data
            DashboardSummaryResponse summary = dashboardService.getSummary(email);
            
            // Check if user has no entries
            if (summary == null || summary.getTotalEntries() == null || summary.getTotalEntries() == 0) {
                return List.of(
                    RecommendationResponse.builder()
                        .title("Start tracking your carbon footprint")
                        .recommendation("Start recording your carbon activities to receive personalized sustainability recommendations.")
                        .category("GENERAL")
                        .priority("HIGH")
                        .reason("No carbon entries found in your account.")
                        .build()
                );
            }

            List<CategoryEmissionResponse> categories = dashboardService.getCategoryEmissions(email);
            List<CarbonEntryResponse> recentEntries = dashboardService.getRecentEntries(email);
            List<GoalResponse> activeGoals = goalService.getMyGoals(email);
            UserProfileResponse profile = userService.getProfile(email);

            // Construct Prompt Context
            StringBuilder promptBuilder = new StringBuilder();
            promptBuilder.append("You are an AI Sustainability Assistant. Generate personalized sustainability recommendations based on the following user data. ");
            promptBuilder.append("Return the response strictly as a JSON array of up to 3 recommendation objects. ");
            promptBuilder.append("Each object must have the following keys: 'title', 'recommendation', 'category' (e.g. TRANSPORT, FOOD, ENERGY, GENERAL), 'priority' (HIGH, MEDIUM, LOW), and 'reason'. ");
            promptBuilder.append("Do not include markdown code block formatting (like ```json), just return the raw JSON array.\n\n");
            promptBuilder.append("User Data:\n");
            promptBuilder.append("- Total Emission: ").append(summary.getTotalCarbonEmission()).append(" kg CO2\n");
            
            promptBuilder.append("- Category Emissions: ");
            for (CategoryEmissionResponse cat : categories) {
                promptBuilder.append(cat.getCategory().name()).append(" (").append(cat.getTotalEmission()).append(" kg), ");
            }
            promptBuilder.append("\n");

            promptBuilder.append("- Recent Activities: ");
            for (int i = 0; i < Math.min(recentEntries.size(), 5); i++) {
                promptBuilder.append(recentEntries.get(i).getActivity()).append(", ");
            }
            promptBuilder.append("\n");
            
            if (activeGoals != null && !activeGoals.isEmpty()) {
                promptBuilder.append("- Active Goals: ");
                for (GoalResponse goal : activeGoals) {
                    promptBuilder.append(goal.getTitle()).append(" (Target: ").append(goal.getTargetCarbon()).append(" kg, Current: ").append(goal.getCurrentCarbon()).append(" kg), ");
                }
                promptBuilder.append("\n");
            }
            
            promptBuilder.append("- Eco Points: ").append(profile.getEcoPoints() != null ? profile.getEcoPoints() : 0).append("\n");

            // Call AI Service
            String aiResponseStr = aiService.generateRecommendations(promptBuilder.toString());
            
            if (aiResponseStr != null && !aiResponseStr.isBlank()) {
                // Extract JSON array robustly by finding the first '[' and last ']'
                int startIndex = aiResponseStr.indexOf('[');
                int endIndex = aiResponseStr.lastIndexOf(']');
                
                if (startIndex != -1 && endIndex != -1 && endIndex > startIndex) {
                    String jsonArray = aiResponseStr.substring(startIndex, endIndex + 1);
                    List<RecommendationResponse> recommendations = objectMapper.readValue(jsonArray, new TypeReference<List<RecommendationResponse>>() {});
                    if (recommendations != null && !recommendations.isEmpty()) {
                        // Limit to max 3
                        return recommendations.subList(0, Math.min(3, recommendations.size()));
                    }
                } else {
                    log.error("AI Response did not contain a valid JSON array. Raw response: {}", aiResponseStr);
                }
            }

        } catch (Exception e) {
            log.error("Failed to generate AI recommendations", e);
        }

        log.info("Gemini API failure -> executing fallback strategy");
        // Fallback Recommendation
        return generateFallbackRecommendation(email);
    }
    
    private List<RecommendationResponse> generateFallbackRecommendation(String email) {
        try {
            List<CategoryEmissionResponse> categories = dashboardService.getCategoryEmissions(email);
            if (categories != null && !categories.isEmpty()) {
                // Find highest emission category
                CategoryEmissionResponse highest = categories.get(0);
                for (CategoryEmissionResponse cat : categories) {
                    if (cat.getTotalEmission() > highest.getTotalEmission()) {
                        highest = cat;
                    }
                }
                
                return List.of(
                    RecommendationResponse.builder()
                        .title("Focus on Your Highest Emission Category")
                        .recommendation("Review your highest-emission category (" + highest.getCategory().name() + ") and try to reduce activities contributing most to it.")
                        .category(highest.getCategory().name())
                        .priority("HIGH")
                        .reason(highest.getCategory().name() + " is currently your highest recorded emission category with " + highest.getTotalEmission() + " kg CO2.")
                        .build()
                );
            }
        } catch (Exception e) {
            log.error("Failed to generate fallback recommendation", e);
        }
        
        return List.of(
            RecommendationResponse.builder()
                .title("Reduce General Emissions")
                .recommendation("Consider walking instead of driving for short trips, and reducing energy usage at home.")
                .category("GENERAL")
                .priority("MEDIUM")
                .reason("We couldn't generate a personalized recommendation right now, but these are general good practices.")
                .build()
        );
    }
}
