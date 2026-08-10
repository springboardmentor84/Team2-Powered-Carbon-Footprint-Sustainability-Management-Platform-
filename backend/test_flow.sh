#!/bin/bash
set -e

EMAIL="test_$(date +%s)@example.com"
curl -s -X POST http://localhost:8080/api/v1/auth/signup -H "Content-Type: application/json" -d "{\"email\": \"$EMAIL\", \"password\": \"password123\", \"fullName\": \"Test User\"}" > /dev/null
LOGIN_RESP=$(curl -s -X POST http://localhost:8080/api/v1/auth/login -H "Content-Type: application/json" -d "{\"email\": \"$EMAIL\", \"password\": \"password123\"}")
TOKEN=$(echo $LOGIN_RESP | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "Creating entry..."
ENTRY_RESP=$(curl -s -X POST http://localhost:8080/api/v1/carbon -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"category": "TRANSPORT", "activity": "walking", "quantity": 5, "unit": "km"}')
echo $ENTRY_RESP
ENTRY_ID=$(echo $ENTRY_RESP | grep -o '"id":[0-9]*' | cut -d':' -f2)

echo "Deleting entry $ENTRY_ID..."
curl -s -X DELETE http://localhost:8080/api/v1/carbon/$ENTRY_ID -H "Authorization: Bearer $TOKEN"
echo ""

echo "Final History:"
curl -s -X GET http://localhost:8080/api/v1/rewards -H "Authorization: Bearer $TOKEN"
