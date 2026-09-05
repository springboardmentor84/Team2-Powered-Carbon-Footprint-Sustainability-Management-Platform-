package com.ecotrack.backend.service;

import com.ecotrack.backend.dto.response.NotificationResponse;
import com.ecotrack.backend.entity.Notification;
import com.ecotrack.backend.entity.User;
import com.ecotrack.backend.enums.Role;
import com.ecotrack.backend.exception.custom.ResourceNotFoundException;
import com.ecotrack.backend.repository.NotificationRepository;
import com.ecotrack.backend.service.impl.NotificationServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationServiceImpl Unit Tests")
class NotificationServiceImplTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private User buildUser(String email) {
        return User.builder()
                .id(1L).fullName("Test User").email(email)
                .role(Role.USER).active(true).build();
    }

    private Notification buildNotification(Long id, User user, boolean isRead) {
        Notification n = Notification.builder()
                .title("Test Title")
                .message("Test message")
                .isRead(isRead)
                .user(user)
                .build();
        // Simulate persisted ID and timestamp via reflection
        org.springframework.test.util.ReflectionTestUtils.setField(n, "id", id);
        org.springframework.test.util.ReflectionTestUtils.setField(n, "createdAt", LocalDateTime.now());
        return n;
    }

    // ============================================================
    // GET MY NOTIFICATIONS
    // ============================================================

    @Test
    @DisplayName("getMyNotifications - returns all notifications for user, sorted by date desc")
    void getMyNotifications_returnsCorrectList() {
        // Arrange
        User user = buildUser("user@ecotrack.com");
        Notification n1 = buildNotification(1L, user, false);
        Notification n2 = buildNotification(2L, user, true);

        when(notificationRepository.findByUser_EmailOrderByCreatedAtDesc("user@ecotrack.com"))
                .thenReturn(List.of(n1, n2));

        // Act
        List<NotificationResponse> result =
                notificationService.getMyNotifications("user@ecotrack.com");

        // Assert
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getTitle()).isEqualTo("Test Title");
        assertThat(result.get(1).getIsRead()).isTrue();
    }

    @Test
    @DisplayName("getMyNotifications - returns empty list when user has no notifications")
    void getMyNotifications_noNotifications_returnsEmptyList() {
        when(notificationRepository.findByUser_EmailOrderByCreatedAtDesc("empty@ecotrack.com"))
                .thenReturn(List.of());

        List<NotificationResponse> result =
                notificationService.getMyNotifications("empty@ecotrack.com");

        assertThat(result).isEmpty();
    }

    // ============================================================
    // MARK AS READ
    // ============================================================

    @Test
    @DisplayName("markAsRead - sets isRead to true and saves")
    void markAsRead_setsReadFlagAndSaves() {
        // Arrange
        User user = buildUser("user@ecotrack.com");
        Notification notification = buildNotification(5L, user, false);

        when(notificationRepository.findById(5L)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        // Act
        NotificationResponse response = notificationService.markAsRead(5L, "user@ecotrack.com");

        // Assert
        assertThat(response.getIsRead()).isTrue();
        verify(notificationRepository).save(notification);
    }

    @Test
    @DisplayName("markAsRead - throws ResourceNotFoundException when notification not found")
    void markAsRead_notFound_throwsException() {
        when(notificationRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> notificationService.markAsRead(99L, "user@ecotrack.com"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("markAsRead - throws ResourceNotFoundException when notification belongs to different user")
    void markAsRead_wrongOwner_throwsException() {
        User owner = buildUser("owner@ecotrack.com");
        Notification notification = buildNotification(10L, owner, false);

        when(notificationRepository.findById(10L)).thenReturn(Optional.of(notification));

        // Different user tries to mark it as read
        assertThatThrownBy(() ->
                notificationService.markAsRead(10L, "hacker@ecotrack.com"))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(notificationRepository, never()).save(any());
    }

    // ============================================================
    // DELETE
    // ============================================================

    @Test
    @DisplayName("deleteNotification - deletes notification when owner calls it")
    void deleteNotification_success() {
        User user = buildUser("user@ecotrack.com");
        Notification notification = buildNotification(7L, user, false);

        when(notificationRepository.findById(7L)).thenReturn(Optional.of(notification));

        notificationService.deleteNotification(7L, "user@ecotrack.com");

        verify(notificationRepository).delete(notification);
    }

    @Test
    @DisplayName("deleteNotification - throws ResourceNotFoundException for wrong owner")
    void deleteNotification_wrongOwner_throwsException() {
        User owner = buildUser("owner@ecotrack.com");
        Notification notification = buildNotification(7L, owner, false);

        when(notificationRepository.findById(7L)).thenReturn(Optional.of(notification));

        assertThatThrownBy(() ->
                notificationService.deleteNotification(7L, "other@ecotrack.com"))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(notificationRepository, never()).delete(any());
    }

    // ============================================================
    // CREATE NOTIFICATION
    // ============================================================

    @Test
    @DisplayName("createNotification - saves notification with correct fields")
    void createNotification_savesCorrectly() {
        User user = buildUser("user@ecotrack.com");

        notificationService.createNotification(user, "Badge Earned", "You earned Eco Beginner badge!");

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());

        Notification saved = captor.getValue();
        assertThat(saved.getTitle()).isEqualTo("Badge Earned");
        assertThat(saved.getMessage()).isEqualTo("You earned Eco Beginner badge!");
        assertThat(saved.getIsRead()).isFalse();
        assertThat(saved.getUser()).isEqualTo(user);
    }
}
