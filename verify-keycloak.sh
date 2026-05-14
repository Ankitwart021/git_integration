#!/bin/bash

# Keycloak Configuration Verification Script
# This script verifies your Keycloak setup and configuration

echo "🔍 Keycloak Configuration Verification"
echo "======================================="
echo ""

# Load environment variables
if [ -f .env ]; then
    source .env
else
    echo "❌ .env file not found!"
    exit 1
fi

echo "📋 Current Configuration:"
echo "  KEYCLOAK_URL: $KEYCLOAK_URL"
echo "  REALM: $REALM"
echo "  CLIENT_ID: $CLIENT_ID"
echo "  CLIENT_SECRET: ${CLIENT_SECRET:0:10}...${CLIENT_SECRET: -5}"
echo "  REDIRECT_URI: $REDIRECT_URI"
echo ""

# Check if Keycloak is accessible
echo "🌐 Checking Keycloak accessibility..."
if curl -s -o /dev/null -w "%{http_code}" "$KEYCLOAK_URL" | grep -q "200\|302\|303"; then
    echo "  ✅ Keycloak is accessible at $KEYCLOAK_URL"
else
    echo "  ❌ Cannot reach Keycloak at $KEYCLOAK_URL"
    echo "     Make sure Keycloak is running: docker ps | grep keycloak"
    exit 1
fi
echo ""

# Check if realm exists
echo "🏰 Checking if realm exists..."
REALM_CHECK=$(curl -s "$KEYCLOAK_URL/realms/$REALM/.well-known/openid-configuration")
if echo "$REALM_CHECK" | grep -q "token_endpoint"; then
    echo "  ✅ Realm '$REALM' exists"
else
    echo "  ❌ Realm '$REALM' not found"
    echo "     Create the realm in Keycloak admin console: $KEYCLOAK_URL"
    exit 1
fi
echo ""

# Try to get an admin token to check client
echo "🔐 Testing client credentials..."
echo "  (This will fail with 401 if CLIENT_SECRET is wrong)"

TOKEN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    "$KEYCLOAK_URL/realms/$REALM/protocol/openid-connect/token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "client_id=$CLIENT_ID" \
    -d "client_secret=$CLIENT_SECRET" \
    -d "grant_type=client_credentials")

HTTP_CODE=$(echo "$TOKEN_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$TOKEN_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "  ✅ Client credentials are VALID"
    echo "  ✅ CLIENT_SECRET matches Keycloak configuration"
    echo ""
    echo "🎉 All checks passed! Your Keycloak is properly configured."
else
    echo "  ❌ Client authentication FAILED (HTTP $HTTP_CODE)"
    echo ""
    echo "Response: $RESPONSE_BODY"
    echo ""
    echo "💡 Common fixes:"
    echo "  1. Get the correct CLIENT_SECRET from Keycloak:"
    echo "     - Go to: $KEYCLOAK_URL"
    echo "     - Login as admin"
    echo "     - Navigate to: Clients → $CLIENT_ID → Credentials"
    echo "     - Copy the Client Secret"
    echo "     - Update your .env file"
    echo ""
    echo "  2. Or create the client if it doesn't exist:"
    echo "     - See KEYCLOAK_SETUP.md for detailed instructions"
    echo ""
    exit 1
fi

echo ""
echo "✨ Next steps:"
echo "  1. Restart your backend: npm run dev"
echo "  2. Try logging in from the frontend"
echo "  3. Check for 'Error during authentication' in backend logs"
