package com.ecotrack.backend.repository;

import com.ecotrack.backend.dto.response.CategoryEmissionResponse;
import com.ecotrack.backend.entity.CarbonEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CarbonEntryRepository extends JpaRepository<CarbonEntry, Long> {

    Long countByUser_Email(String email);

    @Query("SELECT SUM(c.carbonEmission) FROM CarbonEntry c WHERE c.user.email = :email")
    Double sumCarbonEmissionByUser_Email(@Param("email") String email);

    @Query("SELECT new com.ecotrack.backend.dto.response.CategoryEmissionResponse(c.category, SUM(c.carbonEmission)) " +
           "FROM CarbonEntry c WHERE c.user.email = :email GROUP BY c.category")
    List<CategoryEmissionResponse> findCategoryEmissionsByUser_Email(@Param("email") String email);

    @Query("SELECT SUM(c.carbonEmission) FROM CarbonEntry c WHERE c.user.email = :email " +
           "AND c.createdAt >= :startDate AND c.createdAt <= :endDate")
    Double sumCarbonEmissionByUser_EmailAndCreatedAtBetween(
            @Param("email") String email,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    List<CarbonEntry> findTop5ByUser_EmailOrderByCreatedAtDesc(String email);

    List<CarbonEntry> findByUser_EmailOrderByCreatedAtDesc(String email);

    List<CarbonEntry> findByUser_EmailAndCreatedAtBetween(String email, LocalDateTime startDate, LocalDateTime endDate);

    List<CarbonEntry> findByUser_EmailAndCreatedAtBetweenOrderByCreatedAtDesc(String email, LocalDateTime startDate, LocalDateTime endDate);
}
