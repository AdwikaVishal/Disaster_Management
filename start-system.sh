#!/bin/bash

# SenseSafe System Startup Script
# This script starts all components of the SenseSafe system

echo "🚀 Starting SenseSafe Disaster Management System..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}❌ Port $port is already in use${NC}"
        echo "Please stop the service using port $port or use: kill -9 \$(lsof -ti:$port)"
        return 1
    else
        echo -e "${GREEN}✅ Port $port is available${NC}"
        return 0
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    echo -e "${YELLOW}⏳ Waiting for $service_name to be ready...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s $url > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name is ready!${NC}"
            return 0
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ $service_name failed to start within timeout${NC}"
    return 1
}

# Check prerequisites
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js: $(node --version)${NC}"

# Check Java
if ! command -v java &> /dev/null; then
    echo -e "${RED}❌ Java is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Java: $(java --version | head -n1)${NC}"

# Check Maven
if ! command -v mvn &> /dev/null; then
    echo -e "${RED}❌ Maven is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Maven: $(mvn --version | head -n1)${NC}"

# Check Python
if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python is not installed${NC}"
    exit 1
fi

PYTHON_CMD="python"
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
fi
echo -e "${GREEN}✅ Python: $($PYTHON_CMD --version)${NC}"

# Check required ports
echo -e "${BLUE}🔍 Checking ports...${NC}"
check_port 3000 || exit 1  # Frontend
check_port 8080 || exit 1  # Backend
check_port 5001 || exit 1  # ML Service

echo ""
echo -e "${BLUE}📦 Installing dependencies...${NC}"

# Install frontend dependencies
echo -e "${YELLOW}Installing frontend dependencies...${NC}"
if npm install; then
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
    exit 1
fi

# Install backend dependencies
echo -e "${YELLOW}Installing backend dependencies...${NC}"
cd backend
if mvn clean install -q; then
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install backend dependencies${NC}"
    exit 1
fi
cd ..

# Install ML service dependencies
echo -e "${YELLOW}Installing ML service dependencies...${NC}"
cd backend/ml-service
if $PYTHON_CMD -m pip install -r requirements.txt; then
    echo -e "${GREEN}✅ ML service dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install ML service dependencies${NC}"
    exit 1
fi
cd ../..

echo ""
echo -e "${BLUE}🚀 Starting services...${NC}"

# Create logs directory
mkdir -p logs

# Start ML Service
echo -e "${YELLOW}🧠 Starting ML Service on port 5001...${NC}"
cd backend/ml-service
PORT=5001 $PYTHON_CMD app.py > ../../logs/ml-service.log 2>&1 &
ML_PID=$!
echo "ML Service PID: $ML_PID" > ../../logs/pids.txt
cd ../..

# Wait for ML service
if wait_for_service "http://localhost:5001/health" "ML Service"; then
    echo -e "${GREEN}✅ ML Service started successfully${NC}"
else
    echo -e "${RED}❌ ML Service failed to start${NC}"
    kill $ML_PID 2>/dev/null
    exit 1
fi

# Start Backend
echo -e "${YELLOW}🔧 Starting Backend on port 8080...${NC}"
cd backend
mvn spring-boot:run > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID" >> ../logs/pids.txt
cd ..

# Wait for backend
if wait_for_service "http://localhost:8080/api/incidents/ml-health" "Backend"; then
    echo -e "${GREEN}✅ Backend started successfully${NC}"
else
    echo -e "${RED}❌ Backend failed to start${NC}"
    kill $ML_PID $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start Frontend
echo -e "${YELLOW}🎨 Starting Frontend on port 3000...${NC}"
npm run dev > logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID" >> logs/pids.txt

# Wait for frontend
if wait_for_service "http://localhost:3000" "Frontend"; then
    echo -e "${GREEN}✅ Frontend started successfully${NC}"
else
    echo -e "${RED}❌ Frontend failed to start${NC}"
    kill $ML_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 All services started successfully!${NC}"
echo "=================================================="
echo -e "${BLUE}📊 Service URLs:${NC}"
echo "  Frontend:    http://localhost:3000"
echo "  Backend:     http://localhost:8080/api"
echo "  ML Service:  http://localhost:5001"
echo "  H2 Console:  http://localhost:8080/api/h2-console"
echo ""
echo -e "${BLUE}📋 Default Credentials:${NC}"
echo "  Admin Email: admin@sensesafe.com"
echo "  H2 Database: sa / password"
echo ""
echo -e "${BLUE}📝 Process IDs:${NC}"
echo "  ML Service:  $ML_PID"
echo "  Backend:     $BACKEND_PID"
echo "  Frontend:    $FRONTEND_PID"
echo ""
echo -e "${YELLOW}📄 Logs are available in the 'logs' directory${NC}"
echo -e "${YELLOW}🛑 To stop all services, run: ./stop-system.sh${NC}"
echo ""
echo -e "${GREEN}✨ SenseSafe is ready for use!${NC}"

# Keep the script running and monitor services
echo -e "${BLUE}🔍 Monitoring services... (Press Ctrl+C to stop)${NC}"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping all services...${NC}"
    kill $ML_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ All services stopped${NC}"
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

# Monitor services
while true; do
    sleep 10
    
    # Check if services are still running
    if ! kill -0 $ML_PID 2>/dev/null; then
        echo -e "${RED}❌ ML Service stopped unexpectedly${NC}"
        break
    fi
    
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo -e "${RED}❌ Backend stopped unexpectedly${NC}"
        break
    fi
    
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo -e "${RED}❌ Frontend stopped unexpectedly${NC}"
        break
    fi
done

cleanup