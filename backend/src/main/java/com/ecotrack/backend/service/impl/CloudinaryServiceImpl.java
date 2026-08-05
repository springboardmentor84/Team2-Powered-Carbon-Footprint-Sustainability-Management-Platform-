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
        
        String uuid = UUID.randomUUID().toString();
        
        log.info("Uploading image...");
        log.info("Original Filename: {}", file.getOriginalFilename());
        log.info("File Size: {} bytes", file.getSize());
        log.info("Generated UUID for public_id: {}", uuid);
        
        Map uploadResult;
        try {
            Map<String, Object> uploadParams = ObjectUtils.asMap(
                    "folder", "ecotrack/profiles",
                    "public_id", uuid,
                    "resource_type", "image"
            );
            log.info("Upload options: {}", uploadParams);
            uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);
        } catch (Exception e) {
            log.error("Cloudinary upload failed", e);
            throw new IOException("Cloudinary upload failed: " + e.getMessage(), e);
        }
        
        log.info("Upload response... COMPLETE map: {}", uploadResult);
        
        String secureUrl = uploadResult.get("secure_url") != null ? uploadResult.get("secure_url").toString() : null;
        String storedPublicId = uploadResult.get("public_id") != null ? uploadResult.get("public_id").toString() : null;
        String assetId = uploadResult.get("asset_id") != null ? uploadResult.get("asset_id").toString() : null;
        String version = uploadResult.get("version") != null ? uploadResult.get("version").toString() : null;
        String resourceType = uploadResult.get("resource_type") != null ? uploadResult.get("resource_type").toString() : null;
        
        log.info("Parsed Cloudinary Metadata:");
        log.info("Returned secure_url... {}", secureUrl);
        log.info("Returned public_id... {}", storedPublicId);
        log.info("Returned asset_id... {}", assetId);
        log.info("Returned version... {}", version);
        log.info("Returned resource_type... {}", resourceType);
        
        return Map.of(
            "secure_url", secureUrl,
            "public_id", storedPublicId
        );
    }

    @Override
    public void deleteImage(String publicId) {
        log.info("Deleting old image...");
        if (publicId == null || publicId.isEmpty()) {
            log.info("publicId is null or empty, skipping deletion");
            return;
        }
        
        try {
            Map result = cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("invalidate", true));
            log.info("Destroy response...");
            log.info("Cloudinary destroy result for '{}': {}", publicId, result);
        } catch (Exception e) {
            log.error("Failed to delete image from Cloudinary: {}", publicId, e);
            // We don't want to fail the main transaction just because image cleanup failed
        }
    }
}
