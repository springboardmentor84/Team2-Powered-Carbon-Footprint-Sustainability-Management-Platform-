package com.ecotrack.backend.service.impl;

import com.ecotrack.backend.dto.request.UpdatePreferencesRequest;
import com.ecotrack.backend.dto.request.UpdateProfileRequest;
import com.ecotrack.backend.dto.response.UserProfileResponse;
import com.ecotrack.backend.entity.CarbonEntry;
import com.ecotrack.backend.entity.User;
import com.ecotrack.backend.repository.CarbonEntryRepository;
import com.ecotrack.backend.repository.UserRepository;
import com.ecotrack.backend.service.interfaces.CloudinaryService;
import com.ecotrack.backend.service.interfaces.LeaderboardService;
import com.ecotrack.backend.service.interfaces.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    private final CarbonEntryRepository carbonEntryRepository;
    private final LeaderboardService leaderboardService;

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
        
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getProfileImage() != null) user.setProfileImage(request.getProfileImage());
        if (request.getGender() != null) user.setGender(request.getGender());
        if (request.getDateOfBirth() != null) user.setDateOfBirth(request.getDateOfBirth());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getLocation() != null) user.setLocation(request.getLocation());
        if (request.getUniversity() != null) user.setUniversity(request.getUniversity());
        if (request.getDepartment() != null) user.setDepartment(request.getDepartment());
        if (request.getRollNumber() != null) user.setRollNumber(request.getRollNumber());
        if (request.getYear() != null) user.setYear(request.getYear());
        
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
        int level = 1;
        if (ecoPoints < 500) level = 1;
        else if (ecoPoints < 1000) level = 2;
        else if (ecoPoints < 2000) level = 3;
        else if (ecoPoints < 3500) level = 4;
        else if (ecoPoints < 5000) level = 5;
        else level = 6;

        String currentLevel = getLevelName(level);
        String nextLevel = level < 6 ? getLevelName(level + 1) : "Max Level Reached";
        
        int pointsForCurrent = getPointsForLevel(level);
        int pointsForNext = getPointsForLevel(level + 1);
        
        int pointsRemaining = level < 6 ? Math.max(0, pointsForNext - ecoPoints) : 0;
        int progressPercentage = 100;
        if (level < 6) {
            double rawProgress = (double) (ecoPoints - pointsForCurrent) / (pointsForNext - pointsForCurrent) * 100.0;
            progressPercentage = (int) Math.max(0, Math.min(100, rawProgress));
        }

        Double totalEmissions = carbonEntryRepository.sumCarbonEmissionByUser_Email(user.getEmail());
        if (totalEmissions == null) totalEmissions = 0.0;
        
        Long activitiesCount = carbonEntryRepository.countByUser_Email(user.getEmail());
        
        Integer globalRank = null;
        try {
            globalRank = leaderboardService.getMyRank(user.getEmail()).getRank();
        } catch (Exception e) {
            log.error("Could not fetch rank for user", e);
        }

        return UserProfileResponse.builder()
                .fullName(user.getFullName())
                .email(user.getEmail())
                .profileImage(user.getProfileImage())
                .preferences(user.getPreferences())
                .ecoPoints(user.getEcoPoints())
                .role(user.getRole().name())
                .currentLevel(currentLevel)
                .nextLevel(nextLevel)
                .pointsRemaining(pointsRemaining)
                .progressPercentage(progressPercentage)
                .gender(user.getGender())
                .dateOfBirth(user.getDateOfBirth())
                .phone(user.getPhone())
                .location(user.getLocation())
                .university(user.getUniversity())
                .department(user.getDepartment())
                .rollNumber(user.getRollNumber())
                .year(user.getYear())
                .totalEmissions(totalEmissions)
                .currentStreak(calculateStreak(user.getEmail()))
                .activitiesCount(activitiesCount != null ? activitiesCount.intValue() : 0)
                .globalRank(globalRank)
                .createdAt(user.getCreatedAt())
                .accountStatus(user.getActive() != null && user.getActive() ? "Active" : "Disabled")
                .build();
    }
    
    private Integer calculateStreak(String email) {
        List<CarbonEntry> entries = carbonEntryRepository.findByUser_EmailOrderByCreatedAtDesc(email);
        if (entries == null || entries.isEmpty()) return 0;

        Set<LocalDate> activeDays = entries.stream()
                .map(e -> e.getCreatedAt().toLocalDate())
                .collect(Collectors.toSet());

        LocalDate today = LocalDate.now();
        int streak = 0;

        if (activeDays.contains(today)) {
            streak++;
            LocalDate checkDate = today.minusDays(1);
            while (activeDays.contains(checkDate)) {
                streak++;
                checkDate = checkDate.minusDays(1);
            }
        } else if (activeDays.contains(today.minusDays(1))) {
            streak++; // streak from yesterday
            LocalDate checkDate = today.minusDays(2);
            while (activeDays.contains(checkDate)) {
                streak++;
                checkDate = checkDate.minusDays(1);
            }
        }
        
        return streak;
    }

    private String getLevelName(int level) {
        switch (level) {
            case 1: return "Eco Beginner";
            case 2: return "Green Contributor";
            case 3: return "Sustainability Advocate";
            case 4: return "Earth Protector";
            case 5: return "Eco Champion";
            case 6: return "Carbon Master";
            default: return "Legend";
        }
    }

    private int getPointsForLevel(int level) {
        switch (level) {
            case 1: return 0;
            case 2: return 500;
            case 3: return 1000;
            case 4: return 2000;
            case 5: return 3500;
            case 6: return 5000;
            default: return 5000;
        }
    }
}
