#!/bin/bash
cat << 'INNER_EOF' >> src/main/java/com/ecotrack/backend/repository/UserRepository.java

    // --- Admin Analytics Expanded Queries ---
    long countByRoleAndCreatedAtBetween(com.ecotrack.backend.enums.Role role, java.time.LocalDateTime startDate, java.time.LocalDateTime endDate);

    long countByRoleAndActiveTrueAndCreatedAtBetween(com.ecotrack.backend.enums.Role role, java.time.LocalDateTime startDate, java.time.LocalDateTime endDate);
INNER_EOF

# Fix the closing bracket
sed -i '' '/^}$/d' src/main/java/com/ecotrack/backend/repository/UserRepository.java
echo "}" >> src/main/java/com/ecotrack/backend/repository/UserRepository.java
