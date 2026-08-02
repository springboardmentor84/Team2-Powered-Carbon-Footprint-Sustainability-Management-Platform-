package com.ecotrack.backend.service.interfaces;

import com.ecotrack.backend.dto.request.UpdatePreferencesRequest;
import com.ecotrack.backend.dto.request.UpdateProfileRequest;
import com.ecotrack.backend.dto.response.UserProfileResponse;

public interface UserService {
    UserProfileResponse getProfile(String email);
    UserProfileResponse updateProfile(String email, UpdateProfileRequest request);
    UserProfileResponse updatePreferences(String email, UpdatePreferencesRequest request);
    UserProfileResponse uploadProfileImage(String email, org.springframework.web.multipart.MultipartFile file) throws java.io.IOException;
}
