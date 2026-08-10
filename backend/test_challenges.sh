#!/bin/bash

# Configuration
API_URL="http://localhost:8080/api/v1"
EMAIL="testuser@example.com"
PASSWORD="password123"

echo "1. Register/Login to get Token"
# Attempt login, if fail attempt register
RESPONSE=$(curl -s -X POST $API_URL/auth/login -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL\", \"password\":\"$PASSWORD\"}")
TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

if [ -z "$TOKEN" ]; then
    echo "Login failed, registering..."
    RESPONSE=$(curl -s -X POST $API_URL/auth/signup -H "Content-Type: application/json" -d "{\"fullName\":\"Test User\", \"email\":\"$EMAIL\", \"password\":\"$PASSWORD\"}")
    TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
fi
echo "Token: $TOKEN"

echo -e "\n2. Create Challenge"
CREATE_RESP=$(curl -s -X POST $API_URL/challenges \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Cycle To Work",
    "description": "Use cycling instead of a car for your daily commute.",
    "category": "CYCLE_TO_WORK",
    "startDate": "2026-08-15",
    "endDate": "2026-08-22",
    "target": 50,
    "unit": "km",
    "rewardPoints": 100
  }')
echo $CREATE_RESP
CHALLENGE_ID=$(echo $CREATE_RESP | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
echo "Challenge ID: $CHALLENGE_ID"

echo -e "\n3. Get All Challenges"
curl -s -X GET $API_URL/challenges \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n\n4. Get Challenge by ID"
curl -s -X GET $API_URL/challenges/$CHALLENGE_ID \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n\n5. Update Challenge"
curl -s -X PUT $API_URL/challenges/$CHALLENGE_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Cycle To Work Updated",
    "description": "Updated desc.",
    "category": "CYCLE_TO_WORK",
    "startDate": "2026-08-15",
    "endDate": "2026-08-22",
    "target": 60,
    "unit": "km",
    "rewardPoints": 120
  }'

echo -e "\n\n6. Test Validation (negative target)"
curl -s -X POST $API_URL/challenges \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bad Challenge",
    "description": "Desc",
    "category": "CYCLE_TO_WORK",
    "startDate": "2026-08-15",
    "endDate": "2026-08-22",
    "target": -5,
    "unit": "km",
    "rewardPoints": 100
  }'

echo -e "\n\n7. Delete Challenge"
curl -s -w "\nHTTP Status: %{http_code}" -X DELETE $API_URL/challenges/$CHALLENGE_ID \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n\n8. Verify Deletion"
curl -s -w "\nHTTP Status: %{http_code}" -X GET $API_URL/challenges/$CHALLENGE_ID \
  -H "Authorization: Bearer $TOKEN"
