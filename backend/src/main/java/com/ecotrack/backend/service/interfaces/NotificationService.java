package com.ecotrack.backend.service.interfaces;

import com.ecotrack.backend.dto.response.NotificationResponse;
import com.ecotrack.backend.entity.User;

import java.util.List;

public interface NotificationService {
    List<NotificationResponse> getMyNotifications(String email);
    NotificationResponse markAsRead(Long id, String email);
    void deleteNotification(Long id, String email);
    void createNotification(User user, String title, String message);
}
