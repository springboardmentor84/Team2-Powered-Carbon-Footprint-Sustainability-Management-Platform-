package com.ecotrack.backend.service.interfaces;

import com.ecotrack.backend.dto.request.CarbonEntryRequest;
import com.ecotrack.backend.dto.response.CarbonEntryResponse;

import java.util.List;

public interface CarbonEntryService {
    CarbonEntryResponse createCarbonEntry(String email, CarbonEntryRequest request);
    List<CarbonEntryResponse> getUserCarbonEntries(String email);
    CarbonEntryResponse getCarbonEntryById(String email, Long id);
    CarbonEntryResponse updateCarbonEntry(String email, Long id, CarbonEntryRequest request);
    void deleteCarbonEntry(String email, Long id);
}
