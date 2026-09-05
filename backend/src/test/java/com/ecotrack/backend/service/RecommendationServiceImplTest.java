package com.ecotrack.backend.service;

import com.ecotrack.backend.dto.response.CategoryEmissionResponse;
import com.ecotrack.backend.dto.response.DashboardSummaryResponse;
import com.ecotrack.backend.dto.response.RecommendationResponse;
import com.ecotrack.backend.enums.CarbonCategory;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import com.ecotrack.backend.service.impl.RecommendationServiceImpl;
import com.ecotrack.backend.service.interfaces.AIService;
import com.ecotrack.backend.service.interfaces.DashboardService;
import com.ecotrack.backend.service.interfaces.GoalService;
import com.ecotrack.backend.service.interfaces.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("RecommendationServiceImpl Unit Tests")
class RecommendationServiceImplTest {

    @Mock
    private DashboardService dashboardService;

    @Mock
    private GoalService goalService;

    @Mock
    private UserService userService;

    @Mock
    private AIService aiService;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private RecommendationServiceImpl recommendationService;

    // Real ObjectMapper for verifying JSON parsing behavior
    private final ObjectMapper realMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        // Inject real ObjectMapper into the service — @InjectMocks creates a mock ObjectMapper
        // but JSON parsing needs the real one
        org.springframework.test.util.ReflectionTestUtils.setField(
                recommendationService, "objectMapper", realMapper);
    }

    // ============================================================
    // FALLBACK — NO ENTRIES
    // ============================================================

    @Test
    @DisplayName("getRecommendations - returns onboarding tip when user has no entries")
    void getRecommendations_noEntries_returnsOnboardingTip() {
        // Arrange: summary says 0 entries
        DashboardSummaryResponse summary = DashboardSummaryResponse.builder()
                .totalEntries(0L)
                .totalCarbonEmission(0.0)
                .build();

        when(dashboardService.getSummary("test@ecotrack.com")).thenReturn(summary);

        // Act
        List<RecommendationResponse> result =
                recommendationService.getRecommendations("test@ecotrack.com", false);

        // Assert: fallback message about starting to track
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCategory()).isEqualTo("GENERAL");
        assertThat(result.get(0).getPriority()).isEqualTo("HIGH");
        assertThat(result.get(0).getTitle()).containsIgnoringCase("track");

        // AI should never be called when there are no entries
        verify(aiService, never()).generateRecommendations(anyString());
    }

    // ============================================================
    // FALLBACK — AI FAILURE
    // ============================================================

    @Test
    @DisplayName("getRecommendations - falls back to highest category when AI fails")
    void getRecommendations_aiFailure_returnsFallback() {
        // Arrange: user has entries, AI returns null
        DashboardSummaryResponse summary = DashboardSummaryResponse.builder()
                .totalEntries(5L)
                .totalCarbonEmission(50.0)
                .build();

        CategoryEmissionResponse transport = new CategoryEmissionResponse(
                CarbonCategory.TRANSPORT, 30.0);
        CategoryEmissionResponse food = new CategoryEmissionResponse(
                CarbonCategory.FOOD, 20.0);

        when(dashboardService.getSummary("test@ecotrack.com")).thenReturn(summary);
        when(dashboardService.getCategoryEmissions("test@ecotrack.com"))
                .thenReturn(List.of(transport, food));
        when(dashboardService.getRecentEntries("test@ecotrack.com")).thenReturn(List.of());
        when(goalService.getMyGoals("test@ecotrack.com")).thenReturn(List.of());
        when(userService.getProfile("test@ecotrack.com")).thenReturn(
                com.ecotrack.backend.dto.response.UserProfileResponse.builder()
                        .email("test@ecotrack.com").ecoPoints(0).build());
        when(aiService.generateRecommendations(anyString())).thenReturn(null);
        when(dashboardService.getCategoryEmissions("test@ecotrack.com"))
                .thenReturn(List.of(transport, food));

        // Act
        List<RecommendationResponse> result =
                recommendationService.getRecommendations("test@ecotrack.com", false);

        // Assert: fallback returns the highest emission category
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCategory()).isEqualTo("TRANSPORT");
        assertThat(result.get(0).getPriority()).isEqualTo("HIGH");
    }

    // ============================================================
    // CACHE
    // ============================================================

    @Test
    @DisplayName("getRecommendations - second call returns cached result, AI not called twice")
    void getRecommendations_secondCall_returnsCachedResult() {
        // Arrange
        DashboardSummaryResponse summary = DashboardSummaryResponse.builder()
                .totalEntries(3L)
                .totalCarbonEmission(30.0)
                .build();

        String aiJson = "[{\"title\":\"Go cycling\",\"recommendation\":\"Cycle to work.\","
                + "\"category\":\"TRANSPORT\",\"priority\":\"HIGH\",\"reason\":\"High transport emissions\"}]";

        when(dashboardService.getSummary("cache@ecotrack.com")).thenReturn(summary);
        when(dashboardService.getCategoryEmissions("cache@ecotrack.com"))
                .thenReturn(List.of(new CategoryEmissionResponse(CarbonCategory.TRANSPORT, 30.0)));
        when(dashboardService.getRecentEntries("cache@ecotrack.com")).thenReturn(List.of());
        when(goalService.getMyGoals("cache@ecotrack.com")).thenReturn(List.of());
        when(userService.getProfile("cache@ecotrack.com")).thenReturn(
                com.ecotrack.backend.dto.response.UserProfileResponse.builder()
                        .email("cache@ecotrack.com").ecoPoints(10).build());
        when(aiService.generateRecommendations(anyString())).thenReturn(aiJson);

        // Act — call twice
        List<RecommendationResponse> first =
                recommendationService.getRecommendations("cache@ecotrack.com", false);
        List<RecommendationResponse> second =
                recommendationService.getRecommendations("cache@ecotrack.com", false);

        // Assert — both return the same result
        assertThat(first).isEqualTo(second);
        assertThat(first.get(0).getTitle()).isEqualTo("Go cycling");

        // AI should only be called ONCE — second call served from cache
        verify(aiService, times(1)).generateRecommendations(anyString());
    }

    // ============================================================
    // AI SUCCESS
    // ============================================================

    @Test
    @DisplayName("getRecommendations - AI returns valid JSON, parsed and returned correctly")
    void getRecommendations_aiSuccess_returnsAiRecommendations() {
        // Arrange
        DashboardSummaryResponse summary = DashboardSummaryResponse.builder()
                .totalEntries(5L)
                .totalCarbonEmission(80.0)
                .build();

        String aiJson = "["
                + "{\"title\":\"Switch to public transport\",\"recommendation\":\"Use bus or metro.\","
                + "\"category\":\"TRANSPORT\",\"priority\":\"HIGH\",\"reason\":\"High transport emissions\"},"
                + "{\"title\":\"Reduce meat intake\",\"recommendation\":\"Try plant-based meals.\","
                + "\"category\":\"FOOD\",\"priority\":\"MEDIUM\",\"reason\":\"Food is second category\"},"
                + "{\"title\":\"Turn off lights\",\"recommendation\":\"Save electricity.\","
                + "\"category\":\"ENERGY\",\"priority\":\"LOW\",\"reason\":\"Small but consistent savings\"}"
                + "]";

        when(dashboardService.getSummary("ai@ecotrack.com")).thenReturn(summary);
        when(dashboardService.getCategoryEmissions("ai@ecotrack.com"))
                .thenReturn(List.of(new CategoryEmissionResponse(CarbonCategory.TRANSPORT, 50.0)));
        when(dashboardService.getRecentEntries("ai@ecotrack.com")).thenReturn(List.of());
        when(goalService.getMyGoals("ai@ecotrack.com")).thenReturn(List.of());
        when(userService.getProfile("ai@ecotrack.com")).thenReturn(
                com.ecotrack.backend.dto.response.UserProfileResponse.builder()
                        .email("ai@ecotrack.com").ecoPoints(50).build());
        when(aiService.generateRecommendations(anyString())).thenReturn(aiJson);

        // Act
        List<RecommendationResponse> result =
                recommendationService.getRecommendations("ai@ecotrack.com", false);

        // Assert
        assertThat(result).hasSize(3);
        assertThat(result.get(0).getTitle()).isEqualTo("Switch to public transport");
        assertThat(result.get(0).getCategory()).isEqualTo("TRANSPORT");
        assertThat(result.get(1).getCategory()).isEqualTo("FOOD");
        assertThat(result.get(2).getCategory()).isEqualTo("ENERGY");
    }
}
