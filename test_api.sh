#!/bin/bash
# Login
RESPONSE=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"fahad@gmail.com","password":"password123"}')

TOKEN=$(echo $RESPONSE | jq -r .token)

echo "Token: $TOKEN"

echo "Overview:"
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/v1/admin/analytics/overview | jq .

echo "Categories:"
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/v1/admin/analytics/categories | jq .

echo "Users:"
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/v1/admin/analytics/users | jq .

echo "Activities:"
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/v1/admin/analytics/activities | jq .

