package com.ecotrack.backend.controller;

import com.ecotrack.backend.dto.request.UpdatePreferencesRequest;
import com.ecotrack.backend.dto.request.UpdateProfileRequest;
import com.ecotrack.backend.dto.response.UserProfileResponse;
import com.ecotrack.backend.service.interfaces.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<UserProfileResponse> getUserProfile(Principal principal) {
        UserProfileResponse response = userService.getProfile(principal.getName());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<UserProfileResponse> updateUserProfile(
            @Valid @RequestBody UpdateProfileRequest request, 
            Principal principal) {
        UserProfileResponse response = userService.updateProfile(principal.getName(), request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/preferences")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<UserProfileResponse> updateUserPreferences(
            @Valid @RequestBody UpdatePreferencesRequest request, 
            Principal principal) {
        UserProfileResponse response = userService.updatePreferences(principal.getName(), request);
        return ResponseEntity.ok(response);
    }

    @org.springframework.web.bind.annotation.PostMapping("/profile/image")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<UserProfileResponse> uploadProfileImage(
            @org.springframework.web.bind.annotation.RequestParam("image") org.springframework.web.multipart.MultipartFile image, 
            Principal principal) throws java.io.IOException {
        UserProfileResponse response = userService.uploadProfileImage(principal.getName(), image);
        return ResponseEntity.ok(response);
    }
}
