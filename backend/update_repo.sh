#!/bin/bash
cat << 'INNER_EOF' >> src/main/java/com/ecotrack/backend/repository/CarbonEntryRepository.java

    // --- Admin Analytics Expanded Queries ---
    @Query("SELECT COUNT(c) FROM CarbonEntry c WHERE c.createdAt >= :startDate AND c.createdAt <= :endDate")
    Long countByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT SUM(c.carbonEmission) FROM CarbonEntry c WHERE c.createdAt >= :startDate AND c.createdAt <= :endDate")
    Double sumGlobalCarbonEmissionBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT new com.ecotrack.backend.dto.response.CategoryEmissionResponse(c.category, SUM(c.carbonEmission)) " +
           "FROM CarbonEntry c WHERE c.createdAt >= :startDate AND c.createdAt <= :endDate GROUP BY c.category")
    List<CategoryEmissionResponse> findGlobalCategoryEmissionsBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT new com.ecotrack.backend.dto.response.TopUserEmissionDTO(u.fullName, u.email, SUM(c.carbonEmission)) " +
           "FROM CarbonEntry c JOIN c.user u WHERE c.createdAt >= :startDate AND c.createdAt <= :endDate GROUP BY u.id, u.fullName, u.email ORDER BY SUM(c.carbonEmission) DESC")
    List<com.ecotrack.backend.dto.response.TopUserEmissionDTO> findTopUsersByEmissionBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, org.springframework.data.domain.Pageable pageable);

    @Query("SELECT new com.ecotrack.backend.dto.response.ActivityMetricDTO(c.activity, COUNT(c)) " +
           "FROM CarbonEntry c WHERE c.createdAt >= :startDate AND c.createdAt <= :endDate GROUP BY c.activity ORDER BY COUNT(c) DESC")
    List<com.ecotrack.backend.dto.response.ActivityMetricDTO> findMostRecordedActivitiesBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, org.springframework.data.domain.Pageable pageable);

    // Native queries for trends
    @Query(value = "SELECT DATE_TRUNC('day', created_at) AS period_date, SUM(carbon_emission) FROM carbon_entries WHERE created_at >= :startDate AND created_at <= :endDate GROUP BY DATE_TRUNC('day', created_at) ORDER BY period_date ASC", nativeQuery = true)
    List<Object[]> findDailyTrend(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query(value = "SELECT DATE_TRUNC('week', created_at) AS period_date, SUM(carbon_emission) FROM carbon_entries WHERE created_at >= :startDate AND created_at <= :endDate GROUP BY DATE_TRUNC('week', created_at) ORDER BY period_date ASC", nativeQuery = true)
    List<Object[]> findWeeklyTrend(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query(value = "SELECT DATE_TRUNC('month', created_at) AS period_date, SUM(carbon_emission) FROM carbon_entries WHERE created_at >= :startDate AND created_at <= :endDate GROUP BY DATE_TRUNC('month', created_at) ORDER BY period_date ASC", nativeQuery = true)
    List<Object[]> findMonthlyTrend(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query(value = "SELECT DATE_TRUNC('year', created_at) AS period_date, SUM(carbon_emission) FROM carbon_entries WHERE created_at >= :startDate AND created_at <= :endDate GROUP BY DATE_TRUNC('year', created_at) ORDER BY period_date ASC", nativeQuery = true)
    List<Object[]> findYearlyTrend(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
INNER_EOF

# Fix the closing bracket
sed -i '' '/^}$/d' src/main/java/com/ecotrack/backend/repository/CarbonEntryRepository.java
echo "}" >> src/main/java/com/ecotrack/backend/repository/CarbonEntryRepository.java
