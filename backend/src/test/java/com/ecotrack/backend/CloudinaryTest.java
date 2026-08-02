package com.ecotrack.backend;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Map;
import java.util.UUID;

@SpringBootTest
public class CloudinaryTest {

    @Autowired
    private Cloudinary cloudinary;

    @Test
    public void testCloudinaryUploadAndDestroy() throws Exception {
        String publicId = UUID.randomUUID().toString();
        
        System.out.println("Uploading a test image...");
        Map uploadResult = cloudinary.uploader().upload("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", ObjectUtils.asMap(
                "public_id", publicId,
                "folder", "ecotrack/profiles"
        ));
        
        String savedPublicId = uploadResult.get("public_id").toString();
        System.out.println("Uploaded with public_id: " + savedPublicId);
        
        System.out.println("Attempting to destroy...");
        Map result = cloudinary.uploader().destroy(savedPublicId, ObjectUtils.emptyMap());
        System.out.println("Destroy result: " + result);
    }
}
