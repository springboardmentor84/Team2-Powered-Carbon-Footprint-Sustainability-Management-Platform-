package com.ecotrack.backend.service.impl;

import com.ecotrack.backend.dto.request.UpdatePreferencesRequest;
import com.ecotrack.backend.dto.request.UpdateProfileRequest;
import com.ecotrack.backend.dto.response.UserProfileResponse;
import com.ecotrack.backend.entity.User;
import com.ecotrack.backend.repository.UserRepository;
import com.ecotrack.backend.service.interfaces.UserService;
import com.ecotrack.backend.service.interfaces.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    @Override
    public UserProfileResponse uploadProfileImage(String email, MultipartFile file) throws IOException {
        User user = getUserByEmail(email);
        
        // Delete old image if it exists
        log.info("Checking for previous image to delete for user: {}", email);
        if (user.getProfileImagePublicId() != null && !user.getProfileImagePublicId().isEmpty()) {
            cloudinaryService.deleteImage(user.getProfileImagePublicId());
        } else if (user.getProfileImage() != null && user.getProfileImage().contains("cloudinary.com")) {
            // Fallback for old images without publicId stored in DB
            String secureUrl = user.getProfileImage();
            String[] urlParts = secureUrl.split("/");
            String lastPart = urlParts[urlParts.length - 1];
            String filename = lastPart.contains(".") ? lastPart.substring(0, lastPart.lastIndexOf('.')) : lastPart;
            cloudinaryService.deleteImage("ecotrack/profiles/" + filename);
        }
        
        // Upload new image
        log.info("Starting upload of new profile image...");
        java.util.Map<String, String> uploadResult = cloudinaryService.uploadImage(file);
        log.info("New image uploaded successfully. Updating user record.");
        
        user.setProfileImage(uploadResult.get("secure_url"));
        user.setProfileImagePublicId(uploadResult.get("public_id"));
        
        log.info("Saving updated profile to PostgreSQL... URL: {}, Public ID: {}", user.getProfileImage(), user.getProfileImagePublicId());
        User updatedUser = userRepository.save(user);
        log.info("Successfully updated profile image in PostgreSQL.");
        
        return mapToUserProfileResponse(updatedUser);
    }

    @Override
    public UserProfileResponse getProfile(String email) {
        User user = getUserByEmail(email);
        return mapToUserProfileResponse(user);
    }

    @Override
    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = getUserByEmail(email);
        
        user.setFullName(request.getFullName());
        if (request.getProfileImage() != null) {
            user.setProfileImage(request.getProfileImage());
        }
        
        User updatedUser = userRepository.save(user);
        return mapToUserProfileResponse(updatedUser);
    }

    @Override
    public UserProfileResponse updatePreferences(String email, UpdatePreferencesRequest request) {
        User user = getUserByEmail(email);
        
        user.setPreferences(request.getPreferences());
        
        User updatedUser = userRepository.save(user);
        return mapToUserProfileResponse(updatedUser);
    }
    
    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }
    
    private UserProfileResponse mapToUserProfileResponse(User user) {
        int ecoPoints = user.getEcoPoints() != null ? user.getEcoPoints() : 0;
        String nextLevel = "Max Level Reached";
        int pointsRemaining = 0;
        int progressPercentage = 100;

        if (ecoPoints < 1) {
            nextLevel = "Eco Beginner";
            pointsRemaining = 1 - ecoPoints;
            progressPercentage = (int) (((double) ecoPoints / 1) * 100);
        } else if (ecoPoints < 100) {
            nextLevel = "Green Explorer";
            pointsRemaining = 100 - ecoPoints;
            progressPercentage = (int) (((double) (ecoPoints - 1) / (100 - 1)) * 100);
        } else if (ecoPoints < 250) {
            nextLevel = "Carbon Saver";
            pointsRemaining = 250 - ecoPoints;
            progressPercentage = (int) (((double) (ecoPoints - 100) / (250 - 100)) * 100);
        } else if (ecoPoints < 500) {
            nextLevel = "Eco Champion";
            pointsRemaining = 500 - ecoPoints;
            progressPercentage = (int) (((double) (ecoPoints - 250) / (500 - 250)) * 100);
        }

        return UserProfileResponse.builder()
                .fullName(user.getFullName())
                .email(user.getEmail())
                .profileImage(user.getProfileImage())
                .preferences(user.getPreferences())
                .ecoPoints(user.getEcoPoints())
                .role(user.getRole().name())
                .nextLevel(nextLevel)
                .pointsRemaining(pointsRemaining)
                .progressPercentage(progressPercentage)
                .build();
    }
}
