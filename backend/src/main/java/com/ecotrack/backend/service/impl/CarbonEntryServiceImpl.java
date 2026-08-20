package com.ecotrack.backend.service.impl;

import com.ecotrack.backend.dto.request.CarbonEntryRequest;
import com.ecotrack.backend.dto.response.CarbonEntryResponse;
import com.ecotrack.backend.entity.CarbonEntry;
import com.ecotrack.backend.entity.User;
import com.ecotrack.backend.repository.CarbonEntryRepository;
import com.ecotrack.backend.repository.UserRepository;
import com.ecotrack.backend.service.interfaces.CarbonCalculationService;
import com.ecotrack.backend.service.interfaces.CarbonEntryService;
import com.ecotrack.backend.service.interfaces.RewardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CarbonEntryServiceImpl implements CarbonEntryService {

    private final CarbonEntryRepository carbonEntryRepository;

    private final UserRepository userRepository;

    private final CarbonCalculationService carbonCalculationService;

    private final RewardService rewardService;


    // =========================================================
    // CREATE
    // =========================================================

    @Override
    @Transactional
    public CarbonEntryResponse createCarbonEntry(
            String email,
            CarbonEntryRequest request) {

        System.out.println(
                "[CARBON] CREATE START - user=" + email
        );

        System.out.println(
                "[CARBON] category=" + request.getCategory()
                + ", activity=" + request.getActivity()
                + ", quantity=" + request.getQuantity()
                + ", unit=" + request.getUnit()
        );


        // -----------------------------------------------------
        // 1. FIND USER
        // -----------------------------------------------------

        User user = getUserByEmail(email);

        System.out.println(
                "[CARBON] USER FOUND - id=" + user.getId()
        );


        // -----------------------------------------------------
        // 2. CALCULATE EMISSION
        // -----------------------------------------------------

        Double calculatedEmission =
                carbonCalculationService.calculateEmission(
                        request.getCategory(),
                        request.getActivity(),
                        request.getQuantity()
                );

        System.out.println(
                "[CARBON] CALCULATED EMISSION="
                        + calculatedEmission
        );


        // -----------------------------------------------------
        // 3. CREATE ENTITY
        // -----------------------------------------------------

        CarbonEntry entry =
                CarbonEntry.builder()
                        .user(user)
                        .category(request.getCategory())
                        .activity(request.getActivity())
                        .quantity(request.getQuantity())
                        .unit(request.getUnit())
                        .carbonEmission(calculatedEmission)
                        .build();


        // -----------------------------------------------------
        // 4. SAVE CARBON ENTRY
        // -----------------------------------------------------

        CarbonEntry savedEntry =
                carbonEntryRepository.save(entry);

        System.out.println(
                "[CARBON] ENTRY SAVED - id="
                        + savedEntry.getId()
        );


        // -----------------------------------------------------
        // 5. REWARD
        // -----------------------------------------------------
        //
        // Reward processing is intentionally protected.
        //
        // Carbon entry must still be successfully returned
        // even if the reward/badge/notification system has
        // a separate problem.
        //
        // -----------------------------------------------------

        try {

            rewardService.processRewardForCarbonEntry(
                    savedEntry
            );

            System.out.println(
                    "[CARBON] REWARD PROCESSED"
            );

        } catch (Exception rewardError) {

            System.err.println(
                    "[CARBON] WARNING: Reward processing failed"
            );

            rewardError.printStackTrace();

        }


        // -----------------------------------------------------
        // 6. RETURN RESPONSE
        // -----------------------------------------------------

        CarbonEntryResponse response =
                mapToResponse(savedEntry);

        System.out.println(
                "[CARBON] CREATE COMPLETE - id="
                        + savedEntry.getId()
        );

        return response;
    }


    // =========================================================
    // GET ALL USER ENTRIES
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<CarbonEntryResponse> getUserCarbonEntries(
            String email) {

        User user = getUserByEmail(email);

        return user.getCarbonEntries()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }


    // =========================================================
    // GET ONE
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public CarbonEntryResponse getCarbonEntryById(
            String email,
            Long id) {

        CarbonEntry entry =
                getEntryByIdAndValidateUser(
                        email,
                        id
                );

        return mapToResponse(entry);
    }


    // =========================================================
    // UPDATE
    // =========================================================

    @Override
    @Transactional
    public CarbonEntryResponse updateCarbonEntry(
            String email,
            Long id,
            CarbonEntryRequest request) {

        CarbonEntry entry =
                getEntryByIdAndValidateUser(
                        email,
                        id
                );


        Double calculatedEmission =
                carbonCalculationService.calculateEmission(
                        request.getCategory(),
                        request.getActivity(),
                        request.getQuantity()
                );


        entry.setCategory(
                request.getCategory()
        );

        entry.setActivity(
                request.getActivity()
        );

        entry.setQuantity(
                request.getQuantity()
        );

        entry.setUnit(
                request.getUnit()
        );

        entry.setCarbonEmission(
                calculatedEmission
        );


        CarbonEntry updatedEntry =
                carbonEntryRepository.save(entry);


        return mapToResponse(updatedEntry);
    }


    // =========================================================
    // DELETE
    // =========================================================

    @Override
    @Transactional
    public void deleteCarbonEntry(
            String email,
            Long id) {

        CarbonEntry entry =
                getEntryByIdAndValidateUser(
                        email,
                        id
                );


        try {

            rewardService.revertRewardForCarbonEntry(
                    entry
            );

        } catch (Exception rewardError) {

            System.err.println(
                    "[CARBON] WARNING: Reward revert failed"
            );

            rewardError.printStackTrace();
        }


        carbonEntryRepository.delete(entry);
    }


    // =========================================================
    // FIND USER
    // =========================================================

    private User getUserByEmail(String email) {

        return userRepository
                .findByEmail(email)
                .orElseThrow(
                        () -> new UsernameNotFoundException(
                                "User not found: " + email
                        )
                );
    }


    // =========================================================
    // FIND + VALIDATE OWNERSHIP
    // =========================================================

    private CarbonEntry getEntryByIdAndValidateUser(
            String email,
            Long id) {

        CarbonEntry entry =
                carbonEntryRepository
                        .findById(id)
                        .orElseThrow(
                                () ->
                                        new com.ecotrack.backend.exception.custom.ResourceNotFoundException(
                                                "Carbon entry not found with id: "
                                                        + id
                                        )
                        );


        if (
                entry.getUser() == null
                        ||
                entry.getUser().getEmail() == null
                        ||
                !entry.getUser()
                        .getEmail()
                        .equals(email)
        ) {

            throw new AccessDeniedException(
                    "You do not have permission to access this resource"
            );
        }


        return entry;
    }


    // =========================================================
    // MAP ENTITY → RESPONSE
    // =========================================================

    private CarbonEntryResponse mapToResponse(
            CarbonEntry entry) {

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