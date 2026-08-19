package com.ecotrack.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "generated_reports")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeneratedReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String reportPeriod;

    private LocalDate startDate;
    private LocalDate endDate;

    @Column(nullable = false)
    private Double totalEmissions;

    @Column(nullable = false)
    private Integer totalActivities;

    @Column(nullable = false)
    private String format; // "PDF" or "CSV"

    @Column(nullable = false)
    private Integer downloads = 0;

    @Lob
    private byte[] fileData;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime generatedAt;
}
