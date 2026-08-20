package com.ecotrack.backend.repository;

import com.ecotrack.backend.entity.RewardRedemption;
import com.ecotrack.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RewardRedemptionRepository extends JpaRepository<RewardRedemption, Long> {
    List<RewardRedemption> findByUserOrderByRedeemedAtDesc(User user);
}
