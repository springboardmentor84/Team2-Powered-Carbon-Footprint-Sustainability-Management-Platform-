package com.ecotrack.backend.repository;

import com.ecotrack.backend.entity.GeneratedReport;
import com.ecotrack.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GeneratedReportRepository extends JpaRepository<GeneratedReport, Long> {
    List<GeneratedReport> findByUserOrderByGeneratedAtDesc(User user);
}
