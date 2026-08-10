#!/bin/bash

API_URL="http://localhost:8080/api/v1"
EMAIL="testuser@example.com"
PASSWORD="password123"

echo "1. Register/Login to get Token"
RESPONSE=$(curl -s -X POST $API_URL/auth/login -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL\", \"password\":\"$PASSWORD\"}")
TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

echo "Token: $TOKEN"

echo -e "\n2. Create Challenge"
CREATE_RESP=$(curl -s -X POST $API_URL/challenges \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Progress Test Challenge",
    "description": "Desc.",
    "category": "CYCLE_TO_WORK",
    "startDate": "2020-01-01",
    "endDate": "2030-01-01",
    "target": 50,
    "unit": "km",
    "rewardPoints": 100
  }')
CH_ID=$(echo $CREATE_RESP | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
echo "Challenge ID: $CH_ID"


echo -e "\n3. Join Challenge"
curl -s -w "\nHTTP Status: %{http_code}" -X POST $API_URL/challenges/$CH_ID/join -H "Authorization: Bearer $TOKEN"

echo -e "\n\n4. Add Carbon Entry (TRANSPORT, bike, 20 km) - SHOULD MATCH"
curl -s -X POST $API_URL/carbon \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "TRANSPORT",
    "activity": "rode my bike",
    "quantity": 20,
    "unit": "km"
  }'

echo -e "\n\n5. Add Carbon Entry (TRANSPORT, car, 50 km) - SHOULD NOT MATCH"
curl -s -X POST $API_URL/carbon \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "TRANSPORT",
    "activity": "car",
    "quantity": 50,
    "unit": "km"
  }'

echo -e "\n\n6. Add Carbon Entry (TRANSPORT, cycle, 15 km) - SHOULD MATCH"
curl -s -X POST $API_URL/carbon \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "TRANSPORT",
    "activity": "cycle to office",
    "quantity": 15,
    "unit": "km"
  }'

echo -e "\n\n7. Get Progress (Expected: 20 + 15 = 35, Target: 50, % = 70)"
curl -s -X GET $API_URL/challenges/$CH_ID/progress -H "Authorization: Bearer $TOKEN"
