#!/bin/bash

# ==============================================
# Send Sample Logs to Log Management System
# ==============================================

# Configuration
API_URL="${API_URL:-http://localhost:5004}"
ENDPOINT="$API_URL/api/ingest/http"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "=========================================="
echo "Sending Sample Logs"
echo "=========================================="
echo "API URL: $ENDPOINT"
echo ""

# Counter
SUCCESS=0
FAILED=0

# Function to send log
send_log() {
    local data="$1"
    local description="$2"
    
    echo -n "Sending: $description... "
    
    response=$(curl -s -w "\n%{http_code}" -X POST "$ENDPOINT" \
        -H "Content-Type: application/json" \
        -d "$data")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" = "201" ]; then
        echo -e "${GREEN}✓ Success${NC}"
        ((SUCCESS++))
    else
        echo -e "${RED}✗ Failed (HTTP $http_code)${NC}"
        echo "  Response: $body"
        ((FAILED++))
    fi
}

# Sample Logs

# 1. API Login Failed
send_log '{
  "tenant": "demo",
  "source": "api",
  "event_type": "login_failed",
  "user": "alice@demo.com",
  "ip": "203.0.113.7",
  "reason": "wrong password",
  "timestamp": "2024-12-05T10:20:00Z"
}' "API Login Failed"

# 2. API Login Success
send_log '{
  "tenant": "demo",
  "source": "api",
  "event_type": "login_success",
  "user": "bob@demo.com",
  "ip": "192.168.1.100",
  "timestamp": "2024-12-05T10:21:00Z"
}' "API Login Success"

# 3. Firewall Block
send_log '{
  "tenant": "demo",
  "source": "firewall",
  "event_type": "traffic_blocked",
  "action": "deny",
  "src_ip": "10.0.1.50",
  "dst_ip": "8.8.8.8",
  "protocol": "tcp",
  "dst_port": 443,
  "timestamp": "2024-12-05T10:22:00Z"
}' "Firewall Block"

# 4. CrowdStrike Malware Detection
send_log '{
  "tenant": "demo",
  "source": "crowdstrike",
  "event_type": "malware_detected",
  "host": "WIN10-01",
  "process": "powershell.exe",
  "severity": 8,
  "action": "quarantine",
  "timestamp": "2024-12-05T10:23:00Z"
}' "CrowdStrike Malware"

# 5. AWS CreateUser Event
send_log '{
  "tenant": "demo",
  "source": "aws",
  "event_type": "CreateUser",
  "user": "admin@aws.com",
  "cloud": {
    "service": "iam",
    "account_id": "123456789012",
    "region": "us-east-1"
  },
  "timestamp": "2024-12-05T10:24:00Z"
}' "AWS IAM Event"

# 6. M365 User Login
send_log '{
  "tenant": "demo",
  "source": "m365",
  "event_type": "UserLoggedIn",
  "user": "charlie@demo.com",
  "ip": "198.51.100.23",
  "status": "Success",
  "workload": "Exchange",
  "timestamp": "2024-12-05T10:25:00Z"
}' "M365 Login"

# 7. Active Directory Failed Login
send_log '{
  "tenant": "demo",
  "source": "ad",
  "event_id": 4625,
  "event_type": "login_failed",
  "user": "eve@demo.local",
  "host": "DC01",
  "ip": "203.0.113.77",
  "logon_type": 3,
  "timestamp": "2024-12-05T10:26:00Z"
}' "AD Failed Login"

# 8. Network Link Down
send_log '{
  "tenant": "demo",
  "source": "network",
  "event_type": "link_down",
  "host": "router-01",
  "interface": "ge-0/0/1",
  "reason": "carrier lost",
  "timestamp": "2024-12-05T10:27:00Z"
}' "Network Event"

# Multiple failed logins to trigger alert
echo ""
echo "Sending multiple failed logins to trigger alert..."

for i in {1..4}; do
    send_log '{
      "tenant": "demo",
      "source": "api",
      "event_type": "login_failed",
      "user": "test@demo.com",
      "ip": "192.168.1.99",
      "timestamp": "2024-12-05T10:30:00Z"
    }' "Failed Login #$i (Alert Trigger)"
    sleep 0.5
done

# Summary
echo ""
echo "=========================================="
echo "Summary"
echo "=========================================="
echo -e "${GREEN}Success: $SUCCESS${NC}"
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}Failed:  $FAILED${NC}"
else
    echo -e "${GREEN}Failed:  $FAILED${NC}"
fi
echo ""
echo "Check the dashboard at: http://localhost:5174"
echo "Check alerts page - should have 1 alert for multiple failed logins"
echo ""
