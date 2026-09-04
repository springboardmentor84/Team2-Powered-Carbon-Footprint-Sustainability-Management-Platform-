package com.ecotrack.backend.repository;

import com.ecotrack.backend.entity.Goal;
import com.ecotrack.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {

    List<Goal> findAllByUser(User user);

    List<Goal> findAllByUserId(Long userId);

    Optional<Goal> findByIdAndUser(Long id, User user);

    void deleteByIdAndUser(Long id, User user);

    long countByStatus(com.ecotrack.backend.enums.GoalStatus status);
    
    List<Goal> findTop5ByOrderByCreatedAtDesc();

    // --- Admin Analytics Expanded Queries ---
    long countByCreatedAtBetween(java.time.LocalDateTime startDate, java.time.LocalDateTime endDate);
    long countByStatusAndCreatedAtBetween(com.ecotrack.backend.enums.GoalStatus status, java.time.LocalDateTime startDate, java.time.LocalDateTime endDate);
}