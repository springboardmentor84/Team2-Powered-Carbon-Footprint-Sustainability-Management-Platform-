package com.ecotrack.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemHealthResponse {
    private String systemStatus; // HEALTHY, DEGRADED, DOWN
    private String backendStatus;
    private String databaseStatus;
    private long uptimeSeconds;
    private long jvmMemoryUsedMB;
    private long jvmMemoryMaxMB;
    private String javaVersion;
    private int availableProcessors;
    private LocalDateTime lastChecked;
}
