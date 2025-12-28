# System Overrides Implementation Plan

## Objective
Implement real-time system overrides functionality in the admin dashboard emergency section to control automated response protocols.

## Current Issues
- EmergencyControl.tsx has static UI toggles that don't connect to backend
- No persistence or real-time control of system override settings
- Missing backend infrastructure for system configuration management

## Required Overrides
1. **Auto-Dispatch Volunteers**: Automatically assign tasks based on proximity
2. **AI Risk Scoring**: Use ML model for incident triage  
3. **Lockdown Mode**: Restrict user movements suggestions

## Implementation Phases

### Phase 1: Backend Infrastructure
1. Create SystemConfig model and repository
2. Create SystemConfigService for management
3. Add admin endpoints for system configuration
4. Implement audit logging for configuration changes

### Phase 2: Frontend Integration
5. Update EmergencyControl.tsx to make toggles functional
6. Connect UI to backend API with real-time updates
7. Add loading states and error handling
8. Update admin dashboard to display current system status

### Phase 3: System Integration
9. Modify IncidentService to respect auto-dispatch override
10. Modify MLAnalysisService to respect AI risk scoring override
11. Implement lockdown mode logic in relevant services
12. Add real-time WebSocket updates for configuration changes

### Phase 4: Testing & Validation
13. Test real-time functionality across all components
14. Validate audit logging and system behavior
15. Ensure proper error handling and fallback states

## Technical Architecture

### Backend Components
- SystemConfig entity with override settings
- RESTful API endpoints for configuration management
- Service layer integration with existing services
- Audit trail for all configuration changes

### Frontend Components  
- Functional toggle switches with backend integration
- Real-time state synchronization
- Visual feedback for system status
- Error handling and loading states

### Integration Points
- IncidentService: Check auto-dispatch configuration
- MLAnalysisService: Check AI risk scoring configuration  
- NotificationService: Respect lockdown mode restrictions
- WebSocketService: Broadcast real-time configuration updates

## Success Criteria
- System overrides work in real-time
- Configuration changes persist and affect system behavior
- All override actions are logged for audit purposes
- Admin dashboard shows current system status
- Proper error handling and fallback states
