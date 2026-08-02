package com.ecotrack.backend.controller;

import com.ecotrack.backend.dto.request.CarbonEntryRequest;
import com.ecotrack.backend.dto.response.CarbonEntryResponse;
import com.ecotrack.backend.service.interfaces.CarbonEntryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/carbon")
@RequiredArgsConstructor
public class CarbonEntryController {

    private final CarbonEntryService carbonEntryService;

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<CarbonEntryResponse> createCarbonEntry(
            @Valid @RequestBody CarbonEntryRequest request, 
            Principal principal) {
        CarbonEntryResponse response = carbonEntryService.createCarbonEntry(principal.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<CarbonEntryResponse>> getUserCarbonEntries(Principal principal) {
        List<CarbonEntryResponse> responses = carbonEntryService.getUserCarbonEntries(principal.getName());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<CarbonEntryResponse> getCarbonEntryById(
            @PathVariable Long id, 
            Principal principal) {
        CarbonEntryResponse response = carbonEntryService.getCarbonEntryById(principal.getName(), id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<CarbonEntryResponse> updateCarbonEntry(
            @PathVariable Long id, 
            @Valid @RequestBody CarbonEntryRequest request, 
            Principal principal) {
        CarbonEntryResponse response = carbonEntryService.updateCarbonEntry(principal.getName(), id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Void> deleteCarbonEntry(
            @PathVariable Long id, 
            Principal principal) {
        carbonEntryService.deleteCarbonEntry(principal.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
