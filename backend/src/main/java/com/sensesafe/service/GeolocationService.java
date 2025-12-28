package com.sensesafe.service;

import com.sensesafe.model.EmergencyResponse;
import com.sensesafe.model.Incident;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class GeolocationService {

    @Value("${geolocation.api-key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    // Mock emergency service locations (in a real app, this would be from a database)
    private final Map<EmergencyResponse.ResponseType, Map<String, Double>> emergencyServiceLocations = Map.of(
        EmergencyResponse.ResponseType.FIRE_BRIGADE, Map.of("lat", 40.7128, "lng", -74.0060),
        EmergencyResponse.ResponseType.POLICE, Map.of("lat", 40.7589, "lng", -73.9851),
        EmergencyResponse.ResponseType.AMBULANCE, Map.of("lat", 40.7505, "lng", -73.9934),
        EmergencyResponse.ResponseType.HOSPITAL, Map.of("lat", 40.7614, "lng", -73.9776),
        EmergencyResponse.ResponseType.GAS_EMERGENCY, Map.of("lat", 40.7282, "lng", -74.0776)
    );

    // Mock sensitive locations (schools, hospitals, government buildings)
    private final double[][] sensitiveLocations = {
        {40.7589, -73.9851}, // Example: City Hall
        {40.7614, -73.9776}, // Example: Hospital
        {40.7505, -73.9934}, // Example: School
        {40.7282, -74.0776}  // Example: Government Building
    };

    @Cacheable("geocoding")
    public String reverseGeocode(Double latitude, Double longitude) {
        try {
            // In a real implementation, you would call a geocoding API like Google Maps
            // For now, return a mock address
            return String.format("Address near %.4f, %.4f", latitude, longitude);
        } catch (Exception e) {
            return "Address unavailable";
        }
    }

    @Cacheable("forward-geocoding")
    public Map<String, Double> geocodeAddress(String address) {
        try {
            // In a real implementation, you would call a geocoding API
            // For now, return mock coordinates
            Map<String, Double> coordinates = new HashMap<>();
            coordinates.put("latitude", 40.7128 + (Math.random() - 0.5) * 0.1);
            coordinates.put("longitude", -74.0060 + (Math.random() - 0.5) * 0.1);
            return coordinates;
        } catch (Exception e) {
            return Map.of("latitude", 0.0, "longitude", 0.0);
        }
    }

    public Double calculateDistance(Double lat1, Double lng1, Double lat2, Double lng2) {
        // Haversine formula to calculate distance between two points
        final int R = 6371; // Radius of the earth in km

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lng2 - lng1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distance = R * c; // Distance in km

        return distance;
    }

    public Double calculateDistanceToNearestResponder(Double latitude, Double longitude, 
                                                    Incident.IncidentType incidentType) {
        EmergencyResponse.ResponseType primaryService = getPrimaryServiceForIncident(incidentType);
        
        Map<String, Double> serviceLocation = emergencyServiceLocations.get(primaryService);
        if (serviceLocation == null) {
            // Default to police location
            serviceLocation = emergencyServiceLocations.get(EmergencyResponse.ResponseType.POLICE);
        }

        return calculateDistance(latitude, longitude, 
                               serviceLocation.get("lat"), serviceLocation.get("lng"));
    }

    public Integer calculateEstimatedArrival(Double latitude, Double longitude, 
                                           EmergencyResponse.ResponseType serviceType) {
        Map<String, Double> serviceLocation = emergencyServiceLocations.get(serviceType);
        if (serviceLocation == null) {
            return 15; // Default 15 minutes
        }

        Double distance = calculateDistance(latitude, longitude, 
                                          serviceLocation.get("lat"), serviceLocation.get("lng"));
        
        // Estimate based on distance (assuming average speed of 40 km/h in emergency)
        double estimatedMinutes = (distance / 40.0) * 60;
        
        // Add base response time
        int baseResponseTime = switch (serviceType) {
            case FIRE_BRIGADE -> 8;
            case AMBULANCE -> 6;
            case POLICE -> 5;
            case HOSPITAL -> 10;
            case GAS_EMERGENCY -> 12;
            default -> 10;
        };

        return (int) Math.ceil(estimatedMinutes) + baseResponseTime;
    }

    public boolean isNearSensitiveLocation(Double latitude, Double longitude) {
        final double SENSITIVE_RADIUS_KM = 0.5; // 500 meters

        for (double[] location : sensitiveLocations) {
            double distance = calculateDistance(latitude, longitude, location[0], location[1]);
            if (distance <= SENSITIVE_RADIUS_KM) {
                return true;
            }
        }
        return false;
    }

    public Map<String, Object> getLocationInfo(Double latitude, Double longitude) {
        Map<String, Object> info = new HashMap<>();
        
        info.put("address", reverseGeocode(latitude, longitude));
        info.put("nearSensitiveLocation", isNearSensitiveLocation(latitude, longitude));
        
        // Calculate distances to all emergency services
        Map<String, Double> serviceDistances = new HashMap<>();
        for (Map.Entry<EmergencyResponse.ResponseType, Map<String, Double>> entry : 
             emergencyServiceLocations.entrySet()) {
            
            Double distance = calculateDistance(latitude, longitude, 
                                              entry.getValue().get("lat"), 
                                              entry.getValue().get("lng"));
            serviceDistances.put(entry.getKey().name(), distance);
        }
        info.put("emergencyServiceDistances", serviceDistances);
        
        return info;
    }

    private EmergencyResponse.ResponseType getPrimaryServiceForIncident(Incident.IncidentType incidentType) {
        return switch (incidentType) {
            case FIRE -> EmergencyResponse.ResponseType.FIRE_BRIGADE;
            case MEDICAL_EMERGENCY -> EmergencyResponse.ResponseType.AMBULANCE;
            case VIOLENCE -> EmergencyResponse.ResponseType.POLICE;
            case ROAD_ACCIDENT -> EmergencyResponse.ResponseType.POLICE;
            case GAS_LEAK -> EmergencyResponse.ResponseType.GAS_EMERGENCY;
            default -> EmergencyResponse.ResponseType.POLICE;
        };
    }

    // Utility method to validate coordinates
    public boolean isValidCoordinates(Double latitude, Double longitude) {
        return latitude != null && longitude != null &&
               latitude >= -90 && latitude <= 90 &&
               longitude >= -180 && longitude <= 180;
    }

    // Get nearby incidents for map display
    public Map<String, Object> getNearbyIncidents(Double latitude, Double longitude, Double radiusKm) {
        Map<String, Object> result = new HashMap<>();
        
        // This would typically query the database for nearby incidents
        // For now, return mock data structure
        result.put("center", Map.of("lat", latitude, "lng", longitude));
        result.put("radius", radiusKm);
        result.put("incidents", new Object[0]); // Would be populated from database
        
        return result;
    }
}