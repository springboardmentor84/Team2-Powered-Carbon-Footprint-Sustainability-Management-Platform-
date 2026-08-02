package com.ecotrack.backend.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.ecotrack.backend.service.interfaces.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryServiceImpl implements CloudinaryService {

    private final Cloudinary cloudinary;

    @Override
    public Map<String, String> uploadImage(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload an empty file");
        }
        
        // Validate size (5MB = 5 * 1024 * 1024 bytes)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new org.springframework.web.multipart.MaxUploadSizeExceededException(5 * 1024 * 1024);
        }
        
        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !(contentType.equals("image/jpeg") || contentType.equals("image/png") || contentType.equals("image/webp"))) {
            throw new IllegalArgumentException("Invalid file type. Only JPG, JPEG, PNG, and WEBP are allowed.");
        }
        
        // Generate a unique filename using UUID to prevent collisions
        String publicId = UUID.randomUUID().toString();
        
        log.info("Uploading new image. Generated base public_id: {}", publicId);
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "public_id", publicId,
                "folder", "ecotrack/profiles"
        ));
        
        log.info("Cloudinary upload response public_id: {}", uploadResult.get("public_id"));
        
        return Map.of(
            "secure_url", uploadResult.get("secure_url").toString(),
            "public_id", uploadResult.get("public_id").toString()
        );
    }

    @Override
    public void deleteImage(String publicId) {
        log.info("Attempting to delete image with publicId: '{}'", publicId);
        if (publicId == null || publicId.isEmpty()) {
            log.info("publicId is null or empty, skipping deletion");
            return;
        }
        
        try {
            Map result = cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("invalidate", true));
            log.info("Cloudinary destroy result for '{}': {}", publicId, result);
        } catch (Exception e) {
            log.error("Failed to delete image from Cloudinary: {}", publicId, e);
            // We don't want to fail the main transaction just because image cleanup failed
        }
    }
}
