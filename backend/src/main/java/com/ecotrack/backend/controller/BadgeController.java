package com.ecotrack.backend.controller;

import com.ecotrack.backend.dto.response.BadgeResponse;
import com.ecotrack.backend.service.interfaces.BadgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/badges")
@RequiredArgsConstructor
public class BadgeController {

    private final BadgeService badgeService;

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<BadgeResponse>> getMyBadges(Principal principal) {
        String email = principal.getName();
        List<BadgeResponse> badges = badgeService.getMyBadges(email);
        return ResponseEntity.ok(badges);
    }
}
