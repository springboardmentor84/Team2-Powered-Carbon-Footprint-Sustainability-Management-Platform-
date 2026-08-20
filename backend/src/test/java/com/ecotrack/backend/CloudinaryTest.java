package com.ecotrack.backend;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.junit.jupiter.api.Test;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class CloudinaryTest {
    @Test
    public void testUpload() throws Exception {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", "YOUR_CLOUD_NAME"); // FAKE CLOUD NAME
        config.put("api_key", "YOUR_API_KEY"); // FAKE KEY
        config.put("api_secret", "YOUR_API_SECRET"); // FAKE SECRET
        
        Cloudinary cloudinary = new Cloudinary(config);
        String publicId = UUID.randomUUID().toString();
        
        String base64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
        
        try {
            Map uploadResult = cloudinary.uploader().upload(base64Image, ObjectUtils.asMap(
                    "public_id", publicId,
                    "folder", "ecotrack/profiles"
            ));
            System.out.println("UPLOAD_PUBLIC_ID=" + uploadResult.get("public_id"));
            System.out.println("UPLOAD_SECURE_URL=" + uploadResult.get("secure_url"));
        } catch(Exception e) {
            System.out.println("UPLOAD_EXCEPTION=" + e.getMessage());
        }
    }
}
