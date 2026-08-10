package com.ecotrack.backend.repository;

import com.ecotrack.backend.entity.RewardTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RewardTransactionRepository extends JpaRepository<RewardTransaction, Long> {
    List<RewardTransaction> findByUserEmailOrderByCreatedAtDesc(String email);
    List<RewardTransaction> findByCarbonEntryId(Long carbonEntryId);
    boolean existsByUser_IdAndReason(Long userId, String reason);
}
