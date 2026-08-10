#!/bin/bash

API_URL="http://localhost:8080/api/v1"
EMAIL="testuser@example.com"
PASSWORD="password123"

echo "1. Register/Login to get Token"
RESPONSE=$(curl -s -X POST $API_URL/auth/login -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL\", \"password\":\"$PASSWORD\"}")
TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
echo "Token: $TOKEN"

echo -e "\n\n2. Check Initial Eco Points"
curl -s -X GET $API_URL/rewards/points -H "Authorization: Bearer $TOKEN"

echo -e "\n\n3. Create Challenge (Target 50, Reward 100)"
CREATE_RESP=$(curl -s -X POST $API_URL/challenges \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "One Time Reward Test",
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

echo -e "\n4. Join Challenge"
curl -s -X POST $API_URL/challenges/$CH_ID/join -H "Authorization: Bearer $TOKEN"

echo -e "\n\n5. Add Carbon Entry (30 km - Partial)"
curl -s -X POST $API_URL/carbon \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "TRANSPORT",
    "activity": "rode my bike",
    "quantity": 30,
    "unit": "km"
  }' > /dev/null

echo -e "\n\n6. Check Progress (Expected: IN_PROGRESS, No Reward)"
curl -s -X GET $API_URL/challenges/$CH_ID/progress -H "Authorization: Bearer $TOKEN"

echo -e "\n\n7. Add Carbon Entry (25 km - Complete)"
curl -s -X POST $API_URL/carbon \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "TRANSPORT",
    "activity": "rode my bike",
    "quantity": 25,
    "unit": "km"
  }' > /dev/null

echo -e "\n\n8. Check Progress (Expected: COMPLETED, rewardGranted: true)"
curl -s -X GET $API_URL/challenges/$CH_ID/progress -H "Authorization: Bearer $TOKEN"

echo -e "\n\n9. Verify Eco Points (+100)"
curl -s -X GET $API_URL/rewards/points -H "Authorization: Bearer $TOKEN"

echo -e "\n\n10. Check Progress Again (Idempotency Check)"
curl -s -X GET $API_URL/challenges/$CH_ID/progress -H "Authorization: Bearer $TOKEN"

echo -e "\n\n11. Verify Eco Points Unchanged"
curl -s -X GET $API_URL/rewards/points -H "Authorization: Bearer $TOKEN"

echo -e "\n\n12. Verify Reward Transactions (Should be 1 completion transaction)"
curl -s -X GET $API_URL/rewards -H "Authorization: Bearer $TOKEN" | grep -o 'Challenge Completed: [0-9]*'
