package com.ecotrack.backend.service.impl;

import com.ecotrack.backend.dto.response.NotificationResponse;
import com.ecotrack.backend.entity.Notification;
import com.ecotrack.backend.entity.User;
import com.ecotrack.backend.exception.custom.ResourceNotFoundException;
import com.ecotrack.backend.repository.NotificationRepository;
import com.ecotrack.backend.service.interfaces.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    public List<NotificationResponse> getMyNotifications(String email) {
        List<Notification> notifications = notificationRepository.findByUser_EmailOrderByCreatedAtDesc(email);
        return notifications.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public NotificationResponse markAsRead(Long id, String email) {
        Notification notification = getNotificationAndValidateOwnership(id, email);
        notification.setIsRead(true);
        Notification saved = notificationRepository.save(notification);
        return mapToResponse(saved);
    }

    @Override
    public void deleteNotification(Long id, String email) {
        Notification notification = getNotificationAndValidateOwnership(id, email);
        notificationRepository.delete(notification);
    }

    @Override
    public void createNotification(User user, String title, String message) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    private Notification getNotificationAndValidateOwnership(Long id, String email) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        
        if (!notification.getUser().getEmail().equals(email)) {
            throw new ResourceNotFoundException("Notification not found");
        }
        
        return notification;
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
            .id(notification.getId())
            .title(notification.getTitle())
            .message(notification.getMessage())
            .isRead(notification.getIsRead())
            .createdAt(notification.getCreatedAt())
            .build();
    }
}
