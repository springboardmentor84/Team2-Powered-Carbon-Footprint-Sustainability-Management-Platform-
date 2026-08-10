#!/bin/bash

API_URL="http://localhost:8080/api/v1"
EMAIL_A="user_leaderboard_a@example.com"
EMAIL_B="user_leaderboard_b@example.com"
EMAIL_C="user_leaderboard_c@example.com"
PASSWORD="password123"

# Register users (ignore if already registered)
curl -s -X POST $API_URL/auth/signup -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL_A\", \"password\":\"$PASSWORD\", \"fullName\":\"User A\"}" > /dev/null
curl -s -X POST $API_URL/auth/signup -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL_B\", \"password\":\"$PASSWORD\", \"fullName\":\"User B\"}" > /dev/null
curl -s -X POST $API_URL/auth/signup -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL_C\", \"password\":\"$PASSWORD\", \"fullName\":\"User C\"}" > /dev/null

echo "1. Getting Tokens"
TOKEN_A=$(curl -s -X POST $API_URL/auth/login -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL_A\", \"password\":\"$PASSWORD\"}" | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
TOKEN_B=$(curl -s -X POST $API_URL/auth/login -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL_B\", \"password\":\"$PASSWORD\"}" | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
TOKEN_C=$(curl -s -X POST $API_URL/auth/login -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL_C\", \"password\":\"$PASSWORD\"}" | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

echo -e "\n2. Create Challenge (Target 100)"
CREATE_RESP=$(curl -s -X POST $API_URL/challenges \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Leaderboard Test Challenge",
    "description": "Desc.",
    "category": "CYCLE_TO_WORK",
    "startDate": "2020-01-01",
    "endDate": "2030-01-01",
    "target": 100,
    "unit": "km",
    "rewardPoints": 100
  }')
CH_ID=$(echo $CREATE_RESP | grep -o '"id":[0-9]*' | grep -o '[0-9]*' | head -1)
echo "Challenge ID: $CH_ID"

echo -e "\n3. Join Challenge (A, B, C)"
curl -s -X POST $API_URL/challenges/$CH_ID/join -H "Authorization: Bearer $TOKEN_A" > /dev/null
curl -s -X POST $API_URL/challenges/$CH_ID/join -H "Authorization: Bearer $TOKEN_B" > /dev/null
curl -s -X POST $API_URL/challenges/$CH_ID/join -H "Authorization: Bearer $TOKEN_C" > /dev/null

echo -e "\n4. Add Carbon Entries (A=90, B=70, C=40)"
curl -s -X POST $API_URL/carbon -H "Authorization: Bearer $TOKEN_A" -H "Content-Type: application/json" -d '{"category": "TRANSPORT", "activity": "rode my bike", "quantity": 90, "unit": "km"}' > /dev/null
curl -s -X POST $API_URL/carbon -H "Authorization: Bearer $TOKEN_B" -H "Content-Type: application/json" -d '{"category": "TRANSPORT", "activity": "rode my bike", "quantity": 70, "unit": "km"}' > /dev/null
curl -s -X POST $API_URL/carbon -H "Authorization: Bearer $TOKEN_C" -H "Content-Type: application/json" -d '{"category": "TRANSPORT", "activity": "rode my bike", "quantity": 40, "unit": "km"}' > /dev/null

echo -e "\n5. Check Leaderboard (Expected: A=90, B=70, C=40)"
curl -s -X GET $API_URL/challenges/$CH_ID/leaderboard -H "Authorization: Bearer $TOKEN_A" | grep -o '"fullName":"[^"]*","profileImage":[^,]*,"currentProgress":[0-9.]*,"target":[0-9.]*,"unit":"km","completionPercentage":[0-9.]*' | sed 's/"//g'

echo -e "\n\n6. Add 40 to User C (Total 80)"
curl -s -X POST $API_URL/carbon -H "Authorization: Bearer $TOKEN_C" -H "Content-Type: application/json" -d '{"category": "TRANSPORT", "activity": "rode my bike", "quantity": 40, "unit": "km"}' > /dev/null

echo -e "\n7. Check Leaderboard (Expected: A=90, C=80, B=70)"
curl -s -X GET $API_URL/challenges/$CH_ID/leaderboard -H "Authorization: Bearer $TOKEN_A" | grep -o '"fullName":"[^"]*","profileImage":[^,]*,"currentProgress":[0-9.]*,"target":[0-9.]*,"unit":"km","completionPercentage":[0-9.]*' | sed 's/"//g'

echo -e "\n\n8. User B Leaves"
curl -s -X DELETE $API_URL/challenges/$CH_ID/leave -H "Authorization: Bearer $TOKEN_B" > /dev/null

echo -e "\n9. Check Leaderboard (Expected: A=90, C=80. B is gone)"
curl -s -X GET $API_URL/challenges/$CH_ID/leaderboard -H "Authorization: Bearer $TOKEN_A" | grep -o '"fullName":"[^"]*","profileImage":[^,]*,"currentProgress":[0-9.]*,"target":[0-9.]*,"unit":"km","completionPercentage":[0-9.]*' | sed 's/"//g'

echo -e "\n10. Check Global Leaderboard (Expected: contains ecoPoints)"
curl -s -X GET $API_URL/leaderboard -H "Authorization: Bearer $TOKEN_A" | grep -o 'ecoPoints' | head -3
