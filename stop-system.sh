#!/bin/bash

# SenseSafe System Stop Script
# This script stops all components of the SenseSafe system

echo "🛑 Stopping SenseSafe Disaster Management System..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to stop process by PID
stop_process() {
    local pid=$1
    local name=$2
    
    if [ -n "$pid" ] && kill -0 $pid 2>/dev/null; then
        echo -e "${YELLOW}Stopping $name (PID: $pid)...${NC}"
        kill $pid
        
        # Wait for graceful shutdown
        local count=0
        while kill -0 $pid 2>/dev/null && [ $count -lt 10 ]; do
            sleep 1
            count=$((count + 1))
        done
        
        # Force kill if still running
        if kill -0 $pid 2>/dev/null; then
            echo -e "${YELLOW}Force stopping $name...${NC}"
            kill -9 $pid 2>/dev/null
        fi
        
        echo -e "${GREEN}✅ $name stopped${NC}"
    else
        echo -e "${BLUE}ℹ️  $name is not running${NC}"
    fi
}

# Function to stop process by port
stop_by_port() {
    local port=$1
    local name=$2
    
    local pid=$(lsof -ti:$port 2>/dev/null)
    if [ -n "$pid" ]; then
        echo -e "${YELLOW}Stopping $name on port $port (PID: $pid)...${NC}"
        kill $pid 2>/dev/null
        
        # Wait for graceful shutdown
        local count=0
        while lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 && [ $count -lt 10 ]; do
            sleep 1
            count=$((count + 1))
        done
        
        # Force kill if still running
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo -e "${YELLOW}Force stopping $name...${NC}"
            kill -9 $pid 2>/dev/null
        fi
        
        echo -e "${GREEN}✅ $name stopped${NC}"
    else
        echo -e "${BLUE}ℹ️  No process found on port $port${NC}"
    fi
}

# Read PIDs from file if it exists
if [ -f "logs/pids.txt" ]; then
    echo -e "${BLUE}📄 Reading process IDs from logs/pids.txt${NC}"
    
    # Extract PIDs
    ML_PID=$(grep "ML Service PID:" logs/pids.txt | cut -d' ' -f4)
    BACKEND_PID=$(grep "Backend PID:" logs/pids.txt | cut -d' ' -f3)
    FRONTEND_PID=$(grep "Frontend PID:" logs/pids.txt | cut -d' ' -f3)
    
    # Stop services by PID
    stop_process "$FRONTEND_PID" "Frontend"
    stop_process "$BACKEND_PID" "Backend"
    stop_process "$ML_PID" "ML Service"
    
    # Remove PID file
    rm -f logs/pids.txt
    echo -e "${GREEN}✅ PID file removed${NC}"
else
    echo -e "${YELLOW}⚠️  PID file not found, stopping by port...${NC}"
    
    # Stop services by port
    stop_by_port 3000 "Frontend"
    stop_by_port 8080 "Backend"
    stop_by_port 5001 "ML Service"
fi

# Additional cleanup - stop any remaining processes
echo -e "${BLUE}🧹 Performing additional cleanup...${NC}"

# Stop any remaining Java processes (Spring Boot)
JAVA_PIDS=$(pgrep -f "spring-boot:run")
if [ -n "$JAVA_PIDS" ]; then
    echo -e "${YELLOW}Stopping remaining Java processes...${NC}"
    echo $JAVA_PIDS | xargs kill 2>/dev/null
fi

# Stop any remaining Node processes (if running on specific ports)
NODE_PIDS=$(pgrep -f "vite.*3000")
if [ -n "$NODE_PIDS" ]; then
    echo -e "${YELLOW}Stopping remaining Node processes...${NC}"
    echo $NODE_PIDS | xargs kill 2>/dev/null
fi

# Stop any remaining Python processes (Flask)
PYTHON_PIDS=$(pgrep -f "app.py")
if [ -n "$PYTHON_PIDS" ]; then
    echo -e "${YELLOW}Stopping remaining Python processes...${NC}"
    echo $PYTHON_PIDS | xargs kill 2>/dev/null
fi

# Final port check
echo -e "${BLUE}🔍 Final port check...${NC}"

for port in 3000 8080 5001; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${RED}⚠️  Port $port is still in use${NC}"
        PID=$(lsof -ti:$port)
        echo "  Process: $(ps -p $PID -o comm= 2>/dev/null || echo 'Unknown')"
        echo "  To force stop: kill -9 $PID"
    else
        echo -e "${GREEN}✅ Port $port is free${NC}"
    fi
done

# Clean up log files (optional)
read -p "Do you want to clean up log files? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -d "logs" ]; then
        rm -rf logs/*
        echo -e "${GREEN}✅ Log files cleaned${NC}"
    fi
fi

echo ""
echo -e "${GREEN}🎉 SenseSafe system stopped successfully!${NC}"
echo "=================================================="
echo -e "${BLUE}📊 All services have been stopped:${NC}"
echo "  ✅ Frontend (port 3000)"
echo "  ✅ Backend (port 8080)"
echo "  ✅ ML Service (port 5001)"
echo ""
echo -e "${YELLOW}💡 To start the system again, run: ./start-system.sh${NC}"