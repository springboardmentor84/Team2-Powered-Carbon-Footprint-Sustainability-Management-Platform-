#!/bin/bash

API_URL="http://localhost:8080/api/v1"
EMAIL="user_notification_test@example.com"
PASSWORD="password123"

# Register user (ignore if already registered)
curl -s -X POST $API_URL/auth/signup -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL\", \"password\":\"$PASSWORD\", \"fullName\":\"Test User\"}" > /dev/null

echo "1. Login to get Token"
TOKEN=$(curl -s -X POST $API_URL/auth/login -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL\", \"password\":\"$PASSWORD\"}" | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

echo -e "\n\n2. Initial Notifications Count"
INIT_COUNT=$(curl -s -X GET $API_URL/notifications -H "Authorization: Bearer $TOKEN" | grep -o '"id":' | wc -l | tr -d ' ')
echo "Initial notifications: $INIT_COUNT"

echo -e "\n\n3. Create Challenge (Target 50, Reward 100)"
CREATE_RESP=$(curl -s -X POST $API_URL/challenges \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Cycle To Work",
    "description": "Desc.",
    "category": "CYCLE_TO_WORK",
    "startDate": "2020-01-01",
    "endDate": "2030-01-01",
    "target": 50,
    "unit": "km",
    "rewardPoints": 100
  }')
CH_ID=$(echo $CREATE_RESP | grep -o '"id":[0-9]*' | grep -o '[0-9]*' | head -1)
echo "Challenge ID: $CH_ID"

echo -e "\n4. Join Challenge"
curl -s -X POST $API_URL/challenges/$CH_ID/join -H "Authorization: Bearer $TOKEN" > /dev/null

echo -e "\n\n5. Add Partial Progress (30 km)"
curl -s -X POST $API_URL/carbon -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"category": "TRANSPORT", "activity": "rode my bike", "quantity": 30, "unit": "km"}' > /dev/null
curl -s -X GET $API_URL/challenges/$CH_ID/progress -H "Authorization: Bearer $TOKEN" > /dev/null

echo -e "\n\n6. Verify No New Notifications for Partial"
NEW_COUNT=$(curl -s -X GET $API_URL/notifications -H "Authorization: Bearer $TOKEN" | grep -o '"id":' | wc -l | tr -d ' ')
echo "Notifications: $NEW_COUNT (Expected: $INIT_COUNT)"

echo -e "\n\n7. Complete Challenge (+20 km)"
curl -s -X POST $API_URL/carbon -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"category": "TRANSPORT", "activity": "rode my bike", "quantity": 20, "unit": "km"}' > /dev/null
curl -s -X GET $API_URL/challenges/$CH_ID/progress -H "Authorization: Bearer $TOKEN" > /dev/null

echo -e "\n\n8. Verify New Notification Exists"
curl -s -X GET $API_URL/notifications -H "Authorization: Bearer $TOKEN" | grep -o 'Congratulations! You completed the '\\''Cycle To Work'\\'' challenge and earned 100 Eco Points'

echo -e "\n\n9. Repeat Progress Check 3 Times"
curl -s -X GET $API_URL/challenges/$CH_ID/progress -H "Authorization: Bearer $TOKEN" > /dev/null
curl -s -X GET $API_URL/challenges/$CH_ID/progress -H "Authorization: Bearer $TOKEN" > /dev/null
curl -s -X GET $API_URL/challenges/$CH_ID/progress -H "Authorization: Bearer $TOKEN" > /dev/null

echo -e "\n\n10. Verify Duplicate Notification Not Created"
FINAL_COUNT=$(curl -s -X GET $API_URL/notifications -H "Authorization: Bearer $TOKEN" | grep -o '"id":' | wc -l | tr -d ' ')
echo "Notifications: $FINAL_COUNT (Expected: $(($INIT_COUNT + 1)))"

echo -e "\n\n11. Verify Leaderboard (Ensure Read-Only)"
curl -s -X GET $API_URL/challenges/$CH_ID/leaderboard -H "Authorization: Bearer $TOKEN" > /dev/null
LEADERBOARD_COUNT=$(curl -s -X GET $API_URL/notifications -H "Authorization: Bearer $TOKEN" | grep -o '"id":' | wc -l | tr -d ' ')
echo "Notifications after leaderboard: $LEADERBOARD_COUNT (Expected: $FINAL_COUNT)"
