package com.sensesafe.service;

import com.sensesafe.model.Incident;
import com.sensesafe.model.User;
import com.sensesafe.model.VolunteerApplication;
import com.sensesafe.repository.IncidentRepository;
import com.sensesafe.repository.UserRepository;
import com.sensesafe.repository.VolunteerApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Set;

@Service
public class DataInitializationService implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private VolunteerApplicationRepository volunteerApplicationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            initializeData();
        }
    }

    private void initializeData() {
        // Create admin user
        User admin = new User();
        admin.setUsername("admin");
        admin.setEmail("admin@sensesafe.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setFirstName("System");
        admin.setLastName("Administrator");
        admin.setRole(User.Role.ADMIN);
        admin.setVerified(true);
        admin.setTrustScore(100.0);
        admin.setLatitude(40.7128);
        admin.setLongitude(-74.0060);
        admin.setAddress("New York, NY");
        admin.setPhoneNumber("+1-555-ADMIN");
        admin.setEmergencyContact1("admin-emergency@sensesafe.com");
        userRepository.save(admin);

        // Create sample users
        User user1 = new User();
        user1.setUsername("john_doe");
        user1.setEmail("john@example.com");
        user1.setPassword(passwordEncoder.encode("password123"));
        user1.setFirstName("John");
        user1.setLastName("Doe");
        user1.setRole(User.Role.USER);
        user1.setVerified(true);
        user1.setTrustScore(85.0);
        user1.setTotalReports(5);
        user1.setVerifiedReports(4);
        user1.setLatitude(40.7589);
        user1.setLongitude(-73.9851);
        user1.setAddress("Manhattan, NY");
        user1.setPhoneNumber("+1-555-0101");
        user1.setEmergencyContact1("jane@example.com");
        userRepository.save(user1);

        User user2 = new User();
        user2.setUsername("jane_smith");
        user2.setEmail("jane@example.com");
        user2.setPassword(passwordEncoder.encode("password123"));
        user2.setFirstName("Jane");
        user2.setLastName("Smith");
        user2.setRole(User.Role.USER);
        user2.setVerified(true);
        user2.setTrustScore(92.0);
        user2.setTotalReports(8);
        user2.setVerifiedReports(7);
        user2.setLatitude(40.7505);
        user2.setLongitude(-73.9934);
        user2.setAddress("Brooklyn, NY");
        user2.setPhoneNumber("+1-555-0102");
        user2.setEmergencyContact1("john@example.com");
        userRepository.save(user2);

        // Create volunteer user
        User volunteer = new User();
        volunteer.setUsername("volunteer1");
        volunteer.setEmail("volunteer@example.com");
        volunteer.setPassword(passwordEncoder.encode("password123"));
        volunteer.setFirstName("Mike");
        volunteer.setLastName("Wilson");
        volunteer.setRole(User.Role.VOLUNTEER);
        volunteer.setVerified(true);
        volunteer.setTrustScore(95.0);
        volunteer.setTotalReports(12);
        volunteer.setVerifiedReports(11);
        volunteer.setLatitude(40.7614);
        volunteer.setLongitude(-73.9776);
        volunteer.setAddress("Queens, NY");
        volunteer.setPhoneNumber("+1-555-0103");
        volunteer.setEmergencyContact1("volunteer-emergency@example.com");
        userRepository.save(volunteer);

        // Create sample incidents
        Incident incident1 = new Incident();
        incident1.setTitle("Fire at Downtown Building");
        incident1.setDescription("Large fire reported at the downtown office building. Multiple floors affected. Smoke visible from several blocks away.");
        incident1.setType(Incident.IncidentType.FIRE);
        incident1.setSeverity(Incident.Severity.CRITICAL);
        incident1.setStatus(Incident.Status.IN_PROGRESS);
        incident1.setLatitude(40.7128);
        incident1.setLongitude(-74.0060);
        incident1.setAddress("123 Main St, New York, NY");
        incident1.setReporter(user1);
        incident1.setUpvotes(15);
        incident1.setFlags(0);
        incident1.setVerificationCount(15);
        incident1.setInjuriesReported(3);
        incident1.setPeopleInvolved(50);
        incident1.setNearSensitiveLocation(true);
        incident1.setDistanceToResponder(2.5);
        incident1.setFraudProbability(0.05);
        incident1.setIsFraud(false);
        incident1.setRiskScore(95.0);
        incident1.setRiskLevel("critical");
        incident1.setSimilarityScore(0.2);
        incident1.setMediaUrls(Set.of("https://example.com/fire1.jpg", "https://example.com/fire2.jpg"));
        incident1.setCreatedAt(LocalDateTime.now().minusHours(2));
        incidentRepository.save(incident1);

        Incident incident2 = new Incident();
        incident2.setTitle("Traffic Accident on Highway");
        incident2.setDescription("Multi-vehicle accident on I-95. Traffic backed up for miles. Ambulances on scene.");
        incident2.setType(Incident.IncidentType.ROAD_ACCIDENT);
        incident2.setSeverity(Incident.Severity.HIGH);
        incident2.setStatus(Incident.Status.VERIFIED);
        incident2.setLatitude(40.7589);
        incident2.setLongitude(-73.9851);
        incident2.setAddress("I-95 North, Mile Marker 45");
        incident2.setReporter(user2);
        incident2.setUpvotes(8);
        incident2.setFlags(1);
        incident2.setVerificationCount(9);
        incident2.setInjuriesReported(2);
        incident2.setPeopleInvolved(6);
        incident2.setNearSensitiveLocation(false);
        incident2.setDistanceToResponder(5.2);
        incident2.setFraudProbability(0.15);
        incident2.setIsFraud(false);
        incident2.setRiskScore(75.0);
        incident2.setRiskLevel("high");
        incident2.setSimilarityScore(0.3);
        incident2.setMediaUrls(Set.of("https://example.com/accident1.jpg"));
        incident2.setCreatedAt(LocalDateTime.now().minusHours(4));
        incidentRepository.save(incident2);

        Incident incident3 = new Incident();
        incident3.setTitle("Gas Leak in Residential Area");
        incident3.setDescription("Strong gas smell reported in residential neighborhood. Several residents evacuated as precaution.");
        incident3.setType(Incident.IncidentType.GAS_LEAK);
        incident3.setSeverity(Incident.Severity.HIGH);
        incident3.setStatus(Incident.Status.NEW);
        incident3.setLatitude(40.7505);
        incident3.setLongitude(-73.9934);
        incident3.setAddress("456 Oak Street, Brooklyn, NY");
        incident3.setReporter(volunteer);
        incident3.setUpvotes(12);
        incident3.setFlags(0);
        incident3.setVerificationCount(12);
        incident3.setInjuriesReported(0);
        incident3.setPeopleInvolved(25);
        incident3.setNearSensitiveLocation(true);
        incident3.setDistanceToResponder(3.8);
        incident3.setFraudProbability(0.08);
        incident3.setIsFraud(false);
        incident3.setRiskScore(85.0);
        incident3.setRiskLevel("high");
        incident3.setSimilarityScore(0.1);
        incident3.setCreatedAt(LocalDateTime.now().minusMinutes(30));
        incidentRepository.save(incident3);

        // Create sample volunteer application
        VolunteerApplication application = new VolunteerApplication();
        application.setUser(user1);
        application.setMotivation("I want to help my community during emergencies and disasters. Having experienced a flood in my neighborhood last year, I understand how important community support is during crisis situations.");
        application.setSkills("First Aid Certified, CPR Certified, Emergency Response Training, Good communication skills, Physical fitness");
        application.setAvailability("Weekends and evenings, Available for emergency calls 24/7");
        application.setExperience("Volunteer firefighter for 2 years, Red Cross volunteer, Participated in hurricane relief efforts");
        application.setCertifications("First Aid/CPR Certification, Emergency Medical Technician (EMT) Basic, FEMA ICS-100 Certification");
        application.setEmergencyTraining("CERT (Community Emergency Response Team) Training, Disaster Response Training, Search and Rescue Basics");
        application.setVolunteerType(VolunteerApplication.VolunteerType.MEDICAL_AID);
        application.setStatus(VolunteerApplication.ApplicationStatus.PENDING);
        application.setPreferredLatitude(40.7589);
        application.setPreferredLongitude(-73.9851);
        application.setMaxDistanceKm(15.0);
        application.setAlternatePhone("+1-555-0104");
        application.setEmergencyContact("emergency-contact@example.com");
        application.setCreatedAt(LocalDateTime.now().minusDays(2));
        volunteerApplicationRepository.save(application);

        System.out.println("Sample data initialized successfully!");
        System.out.println("Admin credentials: admin / admin123");
        System.out.println("User credentials: john_doe / password123, jane_smith / password123");
        System.out.println("Volunteer credentials: volunteer1 / password123");
    }
}