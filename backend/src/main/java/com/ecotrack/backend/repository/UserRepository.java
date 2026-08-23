package com.ecotrack.backend.repository;

import com.ecotrack.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findByEmailForUpdate(String email);

    java.util.List<User> findAllByRoleAndActiveTrueOrderByEcoPointsDesc(com.ecotrack.backend.enums.Role role);

    long countByRole(com.ecotrack.backend.enums.Role role);
    
    long countByRoleAndActiveTrue(com.ecotrack.backend.enums.Role role);
    
    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(u.ecoPoints), 0) FROM User u WHERE u.role = :role")
    Long sumEcoPointsByRole(@org.springframework.data.repository.query.Param("role") com.ecotrack.backend.enums.Role role);

    java.util.List<User> findTop5ByRoleOrderByEcoPointsDesc(com.ecotrack.backend.enums.Role role);
    java.util.List<User> findTop5ByOrderByCreatedAtDesc();

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE " +
           "(:search IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) AND " +
           "(:role IS NULL OR u.role = :role) AND " +
           "(:active IS NULL OR u.active = :active) AND " +
           "(CAST(:startDate AS java.time.LocalDateTime) IS NULL OR u.createdAt >= :startDate) AND " +
           "(CAST(:endDate AS java.time.LocalDateTime) IS NULL OR u.createdAt <= :endDate)")
    org.springframework.data.domain.Page<User> findFilteredUsers(
            @org.springframework.data.repository.query.Param("search") String search, 
            @org.springframework.data.repository.query.Param("role") com.ecotrack.backend.enums.Role role, 
            @org.springframework.data.repository.query.Param("active") Boolean active, 
            @org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate, 
            @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate, 
            org.springframework.data.domain.Pageable pageable);
}
