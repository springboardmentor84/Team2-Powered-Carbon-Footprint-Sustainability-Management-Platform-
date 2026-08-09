package com.ecotrack.backend.service.impl;

import com.ecotrack.backend.service.interfaces.AIService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import lombok.extern.slf4j.Slf4j;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class GeminiAIServiceImpl implements AIService {

    @Value("${ai.api.key}")
    private String apiKey;

    @Value("${ai.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent}")
    private String apiUrl;

    private final RestTemplate restTemplate;

    public GeminiAIServiceImpl() {
        this.restTemplate = new RestTemplate();
    }

    @Override
    public String generateRecommendations(String prompt) {
        try {
            String url = apiUrl + "?key=" + apiKey;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Constructing Gemini API request payload
            Map<String, Object> requestBody = new HashMap<>();
            
            Map<String, Object> part = new HashMap<>();
            part.put("text", prompt);
            
            Map<String, Object> content = new HashMap<>();
            content.put("parts", List.of(part));
            
            requestBody.put("contents", List.of(content));

            // Request JSON response
            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("response_mime_type", "application/json");
            requestBody.put("generationConfig", generationConfig);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> contentBlock = (Map<String, Object>) candidates.get(0).get("content");
                    if (contentBlock != null) {
                        List<Map<String, Object>> parts = (List<Map<String, Object>>) contentBlock.get("parts");
                        if (parts != null && !parts.isEmpty()) {
                            log.info("Gemini API success: Successfully generated recommendations");
                            return (String) parts.get(0).get("text");
                        }
                    }
                }
            }
            log.warn("Gemini API failure: AI service returned unexpected format or empty response");
            return null;
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            log.error("Gemini API failure: HTTP {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            return null;
        } catch (Exception e) {
            log.error("Gemini API failure: Error communicating with AI service", e);
            return null;
        }
    }
}
