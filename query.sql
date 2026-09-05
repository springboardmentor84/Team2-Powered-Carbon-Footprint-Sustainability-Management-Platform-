-- 1. Total Users & Active Users (role = USER)
SELECT COUNT(*) AS total_users, SUM(CASE WHEN active = true THEN 1 ELSE 0 END) AS active_users FROM users WHERE role = 'USER';

-- 2. Total Entries
SELECT COUNT(*) AS total_entries FROM carbon_entries;

-- 3. Total Emissions
SELECT SUM(carbon_emission) AS total_emissions FROM carbon_entries;

-- 4. Average Emission/Entry
SELECT AVG(carbon_emission) AS avg_emission FROM carbon_entries;

-- 5. Goals
SELECT status, COUNT(*) FROM goals GROUP BY status;

-- 6. Challenge Participants
SELECT COUNT(*) AS total_participations FROM challenge_participations;
SELECT COUNT(DISTINCT user_id) AS unique_participants FROM challenge_participations;
SELECT COUNT(*) AS total_challenges FROM challenges;

-- 7. Reports Generated
SELECT COUNT(*) AS total_reports FROM generated_reports;

-- 8. Categories
SELECT category, SUM(carbon_emission) FROM carbon_entries GROUP BY category;

-- 9. Most Recorded Activities
SELECT activity, COUNT(*) FROM carbon_entries GROUP BY activity ORDER BY COUNT(*) DESC LIMIT 5;

-- 10. Top Emitters
SELECT u.full_name, u.email, SUM(c.carbon_emission) AS total 
FROM carbon_entries c 
JOIN users u ON c.user_id = u.id 
GROUP BY u.id 
ORDER BY total DESC 
LIMIT 5;
