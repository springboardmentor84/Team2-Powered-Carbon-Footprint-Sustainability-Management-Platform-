package com.ecotrack.backend.service.impl;

import com.ecotrack.backend.dto.request.CarbonEntryRequest;
import com.ecotrack.backend.dto.response.CarbonEntryResponse;
import com.ecotrack.backend.entity.CarbonEntry;
import com.ecotrack.backend.entity.User;
import com.ecotrack.backend.repository.CarbonEntryRepository;
import com.ecotrack.backend.repository.UserRepository;
import com.ecotrack.backend.service.interfaces.CarbonEntryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CarbonEntryServiceImpl implements CarbonEntryService {

    private final CarbonEntryRepository carbonEntryRepository;
    private final UserRepository userRepository;

    @Override
    public CarbonEntryResponse createCarbonEntry(String email, CarbonEntryRequest request) {
        User user = getUserByEmail(email);

        CarbonEntry entry = CarbonEntry.builder()
                .user(user)
                .category(request.getCategory())
                .activity(request.getActivity())
                .quantity(request.getQuantity())
                .unit(request.getUnit())
                .carbonEmission(request.getCarbonEmission())
                .build();

        CarbonEntry savedEntry = carbonEntryRepository.save(entry);
        return mapToResponse(savedEntry);
    }

    @Override
    public List<CarbonEntryResponse> getUserCarbonEntries(String email) {
        User user = getUserByEmail(email);
        
        return user.getCarbonEntries().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CarbonEntryResponse getCarbonEntryById(String email, Long id) {
        CarbonEntry entry = getEntryByIdAndValidateUser(email, id);
        return mapToResponse(entry);
    }

    @Override
    public CarbonEntryResponse updateCarbonEntry(String email, Long id, CarbonEntryRequest request) {
        CarbonEntry entry = getEntryByIdAndValidateUser(email, id);

        entry.setCategory(request.getCategory());
        entry.setActivity(request.getActivity());
        entry.setQuantity(request.getQuantity());
        entry.setUnit(request.getUnit());
        entry.setCarbonEmission(request.getCarbonEmission());

        CarbonEntry updatedEntry = carbonEntryRepository.save(entry);
        return mapToResponse(updatedEntry);
    }

    @Override
    public void deleteCarbonEntry(String email, Long id) {
        CarbonEntry entry = getEntryByIdAndValidateUser(email, id);
        carbonEntryRepository.delete(entry);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    private CarbonEntry getEntryByIdAndValidateUser(String email, Long id) {
        CarbonEntry entry = carbonEntryRepository.findById(id)
                .orElseThrow(() -> new com.ecotrack.backend.exception.custom.ResourceNotFoundException("Carbon entry not found with id: " + id));

        if (!entry.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException("You do not have permission to access this resource");
        }

        return entry;
    }

    private CarbonEntryResponse mapToResponse(CarbonEntry entry) {
        return CarbonEntryResponse.builder()
                .id(entry.getId())
                .category(entry.getCategory())
                .activity(entry.getActivity())
                .quantity(entry.getQuantity())
                .unit(entry.getUnit())
                .carbonEmission(entry.getCarbonEmission())
                .createdAt(entry.getCreatedAt())
                .updatedAt(entry.getUpdatedAt())
                .build();
    }
}
