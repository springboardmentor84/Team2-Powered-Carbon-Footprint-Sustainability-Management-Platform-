package com.ecotrack.backend.repository;

import com.ecotrack.backend.entity.CarbonEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CarbonEntryRepository extends JpaRepository<CarbonEntry, Long> {
}
