#!/bin/bash

echo "=== Testing System Overrides Integration ==="
echo ""

# Function to test API endpoint
test_api() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo "Testing: $description"
    echo "Endpoint: $method $endpoint"
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            "http://localhost:8080/api$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $ADMIN_TOKEN" \
            -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            "http://localhost:8080/api$endpoint" \
            -H "Authorization: Bearer $ADMIN_TOKEN")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    echo "Response Code: $http_code"
    echo "Response Body: $body"
    echo ""
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo "✅ Success"
    else
        echo "❌ Failed"
    fi
    echo "---"
}

# 1. First, let's get an admin token using the OTP flow
echo "1. Getting admin authentication..."
OTP_RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/login-admin-otp \
    -H "Content-Type: application/json" \
    -d '{"email": "admin@sensesafe.com"}')

if echo "$OTP_RESPONSE" | grep -q "success"; then
    echo "✅ OTP request successful"
    echo "OTP Response: $OTP_RESPONSE"
    echo ""
    echo "📧 For testing purposes, please check the backend logs for the OTP code"
    echo "The OTP should be visible in the backend logs (usually 123456 for test scenarios)"
    echo ""
    
    # Try common test OTP values
    for otp in "123456" "000000" "999999" "123123"; do
        echo "Trying OTP: $otp"
        TOKEN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/verify-otp \
            -H "Content-Type: application/json" \
            -d "{\"email\": \"admin@sensesafe.com\", \"otp\": \"$otp\"}")
        
        if echo "$TOKEN_RESPONSE" | grep -q "success"; then
            ADMIN_TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
            if [ -n "$ADMIN_TOKEN" ]; then
                echo "✅ Authentication successful with OTP: $otp"
                echo "Admin Token: ${ADMIN_TOKEN:0:20}..."
                break
            fi
        fi
    done
else
    echo "❌ OTP request failed"
    echo "Response: $OTP_RESPONSE"
    exit 1
fi

if [ -z "$ADMIN_TOKEN" ]; then
    echo "❌ Failed to obtain admin token"
    echo "Please check the backend logs for the actual OTP value"
    exit 1
fi

echo ""
echo "2. Testing System Configuration Endpoints..."
echo ""

# 3. Initialize system configurations
test_api "POST" "/admin/system-config/initialize" "" "Initialize System Configurations"

# 4. Get current system configuration
test_api "GET" "/admin/system-config" "" "Get System Configuration"

# 5. Test updating system configurations
echo "5. Testing System Configuration Updates..."

# Enable Auto-Dispatch Volunteers
test_api "PUT" "/admin/system-config/AUTO_DISPATCH_VOLUNTEERS" '{"enabled": true}' "Enable Auto-Dispatch Volunteers"

# Enable AI Risk Scoring
test_api "PUT" "/admin/system-config/AI_RISK_SCORING" '{"enabled": true}' "Enable AI Risk Scoring"

# Enable Lockdown Mode
test_api "PUT" "/admin/system-config/LOCKDOWN_MODE" '{"enabled": true}' "Enable Lockdown Mode"

# 6. Verify the updates
test_api "GET" "/admin/system-config" "" "Verify System Configuration Updates"

echo ""
echo "=== System Overrides Test Complete ==="
echo ""
echo "Frontend URL: http://localhost:5173"
echo "Backend URL: http://localhost:8080/api"
echo ""
echo "To test the frontend:"
echo "1. Open http://localhost:5173 in your browser"
echo "2. Login as admin using the OTP flow"
echo "3. Navigate to Admin > Emergency Control"
echo "4. Test the system override switches"
echo "5. Verify the changes are persisted and respected by the backend"
