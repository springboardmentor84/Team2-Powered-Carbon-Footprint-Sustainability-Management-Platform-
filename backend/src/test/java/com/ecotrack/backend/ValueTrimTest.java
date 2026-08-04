package com.ecotrack.backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class ValueTrimTest {

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Test
    public void testTrim() {
        System.out.println("INJECTED_CLOUD_NAME_LENGTH=" + cloudName.length());
        System.out.println("INJECTED_CLOUD_NAME='" + cloudName + "'");
    }
}
