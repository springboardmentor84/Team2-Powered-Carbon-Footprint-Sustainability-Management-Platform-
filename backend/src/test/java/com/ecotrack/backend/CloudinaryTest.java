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
        config.put("cloud_name", "fakecloudname123"); // FAKE CLOUD NAME
        config.put("api_key", "439172672988712"); // REAL KEY
        config.put("api_secret", "ivDQR-Ao72Mc0TQV1ObcyktN4RA"); // REAL SECRET
        
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
