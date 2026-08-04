package com.ecotrack.backend.controller;

import com.ecotrack.backend.service.interfaces.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/test")
@RequiredArgsConstructor
public class TestCloudinaryController {

    private final CloudinaryService cloudinaryService;

    @PostMapping("/upload")
    public ResponseEntity<?> upload(@RequestParam("image") MultipartFile image) throws Exception {
        Map<String, String> result = cloudinaryService.uploadImage(image);
        return ResponseEntity.ok(result);
    }
}
