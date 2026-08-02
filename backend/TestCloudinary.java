import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import java.util.Map;
import java.util.HashMap;

public class TestCloudinary {
    public static void main(String[] args) throws Exception {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", "ddszr1sdv");
        config.put("api_key", "439172672988712");
        config.put("api_secret", "ivDQR-Ao72Mc0TQV1ObcyktN4RA");
        Cloudinary cloudinary = new Cloudinary(config);
        
        System.out.println("Uploading a test image...");
        Map uploadResult = cloudinary.uploader().upload("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", ObjectUtils.asMap(
                "public_id", "test_delete_me",
                "folder", "ecotrack/profiles"
        ));
        
        String publicId = uploadResult.get("public_id").toString();
        System.out.println("Uploaded with public_id: " + publicId);
        
        System.out.println("Attempting to destroy...");
        Map result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        System.out.println("Destroy result: " + result);
    }
}
