#!/bin/bash

API_URL="http://localhost:8080/api/v1"
EMAIL="testuser@example.com"
PASSWORD="password123"

echo "1. Register/Login to get Token"
RESPONSE=$(curl -s -X POST $API_URL/auth/login -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL\", \"password\":\"$PASSWORD\"}")
TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

echo "Token: $TOKEN"

echo -e "\n1.5 Create Challenge"
CREATE_RESP=$(curl -s -X POST $API_URL/challenges \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Good Challenge",
    "description": "Desc.",
    "category": "CYCLE_TO_WORK",
    "startDate": "2026-08-15",
    "endDate": "2026-08-22",
    "target": 50,
    "unit": "km",
    "rewardPoints": 100
  }')
CH_ID=$(echo $CREATE_RESP | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
echo "Challenge ID: $CH_ID"


echo -e "\n2. Join Challenge"
curl -s -w "\nHTTP Status: %{http_code}" -X POST $API_URL/challenges/$CH_ID/join -H "Authorization: Bearer $TOKEN"

echo -e "\n\n3. Duplicate Join Challenge (should be 409)"
curl -s -w "\nHTTP Status: %{http_code}" -X POST $API_URL/challenges/$CH_ID/join -H "Authorization: Bearer $TOKEN"

echo -e "\n\n4. Get My Challenges"
curl -s -X GET $API_URL/challenges/my -H "Authorization: Bearer $TOKEN"

echo -e "\n\n5. Get Participants for Challenge"
curl -s -X GET $API_URL/challenges/$CH_ID/participants -H "Authorization: Bearer $TOKEN"

echo -e "\n\n6. Leave Challenge"
curl -s -w "\nHTTP Status: %{http_code}" -X DELETE $API_URL/challenges/$CH_ID/leave -H "Authorization: Bearer $TOKEN"

echo -e "\n\n7. Join Again (after leaving)"
curl -s -w "\nHTTP Status: %{http_code}" -X POST $API_URL/challenges/$CH_ID/join -H "Authorization: Bearer $TOKEN"

echo -e "\n\n8. Create Expired Challenge and Join"
CREATE_RESP2=$(curl -s -X POST $API_URL/challenges \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Expired Challenge",
    "description": "Desc.",
    "category": "CYCLE_TO_WORK",
    "startDate": "2020-01-01",
    "endDate": "2021-01-01",
    "target": 50,
    "unit": "km",
    "rewardPoints": 100
  }')
CH_ID2=$(echo $CREATE_RESP2 | grep -o '"id":[0-9]*' | grep -o '[0-9]*')

curl -s -w "\nHTTP Status: %{http_code}" -X POST $API_URL/challenges/$CH_ID2/join -H "Authorization: Bearer $TOKEN"
