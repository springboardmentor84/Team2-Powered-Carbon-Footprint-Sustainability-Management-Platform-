package com.ecotrack.backend.repository;

import com.ecotrack.backend.entity.Notification;
import com.ecotrack.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUser_EmailOrderByCreatedAtDesc(String email);
    
    boolean existsByUserAndTitleAndMessage(User user, String title, String message);
}
