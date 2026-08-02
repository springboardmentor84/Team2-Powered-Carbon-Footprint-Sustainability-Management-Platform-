package com.ecotrack.backend.service.interfaces;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Map;

public interface CloudinaryService {
    /**
     * Uploads a file to Cloudinary and returns a map containing the secure URL and public ID.
     */
    Map<String, String> uploadImage(MultipartFile file) throws IOException;

    /**
     * Deletes an image from Cloudinary by its public ID.
     */
    void deleteImage(String publicId) throws IOException;
}
