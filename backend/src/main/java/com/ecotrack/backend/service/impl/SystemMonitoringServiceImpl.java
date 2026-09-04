package com.ecotrack.backend.service.impl;

import com.ecotrack.backend.dto.response.SystemHealthResponse;
import com.ecotrack.backend.service.interfaces.SystemMonitoringService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;

import java.lang.management.ManagementFactory;
import java.time.LocalDateTime;

@Service
public class SystemMonitoringServiceImpl implements SystemMonitoringService {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public SystemHealthResponse getSystemHealth() {
        String dbStatus = checkDatabaseHealth();
        String backendStatus = "HEALTHY"; // If this is executing, backend is UP
        String systemStatus = dbStatus.equals("HEALTHY") ? "HEALTHY" : "DEGRADED";

        Runtime runtime = Runtime.getRuntime();
        long maxMemory = runtime.maxMemory();
        long allocatedMemory = runtime.totalMemory();
        long freeMemory = runtime.freeMemory();
        long usedMemory = allocatedMemory - freeMemory;
        
        long mb = 1024 * 1024;

        long uptime = ManagementFactory.getRuntimeMXBean().getUptime() / 1000; // in seconds
        String javaVersion = System.getProperty("java.version");
        int processors = runtime.availableProcessors();

        return SystemHealthResponse.builder()
                .systemStatus(systemStatus)
                .backendStatus(backendStatus)
                .databaseStatus(dbStatus)
                .uptimeSeconds(uptime)
                .jvmMemoryUsedMB(usedMemory / mb)
                .jvmMemoryMaxMB(maxMemory / mb)
                .javaVersion(javaVersion != null ? javaVersion : "Unknown")
                .availableProcessors(processors)
                .lastChecked(LocalDateTime.now())
                .build();
    }

    private String checkDatabaseHealth() {
        try {
            Object result = entityManager.createNativeQuery("SELECT 1").getSingleResult();
            if (result != null) {
                return "HEALTHY";
            }
            return "DOWN";
        } catch (Exception e) {
            return "DOWN";
        }
    }
}
