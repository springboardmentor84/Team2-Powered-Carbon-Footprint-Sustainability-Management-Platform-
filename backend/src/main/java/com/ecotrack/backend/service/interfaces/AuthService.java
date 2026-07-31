package com.ecotrack.backend.service.interfaces;

import com.ecotrack.backend.dto.request.RegisterRequest;
import com.ecotrack.backend.dto.response.RegisterResponse;

public interface AuthService {

    RegisterResponse register(RegisterRequest request);
}
