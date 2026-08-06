package com.ecotrack.backend.service.interfaces;

import com.ecotrack.backend.dto.response.BadgeResponse;
import com.ecotrack.backend.entity.User;

import java.util.List;

public interface BadgeService {
    List<BadgeResponse> getMyBadges(String email);
    void checkAndUnlockBadges(User user);
}
