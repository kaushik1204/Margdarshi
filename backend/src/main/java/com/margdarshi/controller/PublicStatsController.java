package com.margdarshi.controller;

import com.margdarshi.repository.ApplicationRepository;
import com.margdarshi.repository.CompanyRepository;
import com.margdarshi.repository.PlacementDriveRepository;
import com.margdarshi.repository.PlacementResultRepository;
import com.margdarshi.repository.StudentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
public class PublicStatsController {

    private final StudentRepository studentRepository;
    private final CompanyRepository companyRepository;
    private final PlacementDriveRepository driveRepository;
    private final PlacementResultRepository resultRepository;
    private final ApplicationRepository applicationRepository;

    public PublicStatsController(
            StudentRepository studentRepository,
            CompanyRepository companyRepository,
            PlacementDriveRepository driveRepository,
            PlacementResultRepository resultRepository,
            ApplicationRepository applicationRepository) {
        this.studentRepository = studentRepository;
        this.companyRepository = companyRepository;
        this.driveRepository = driveRepository;
        this.resultRepository = resultRepository;
        this.applicationRepository = applicationRepository;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getPublicStats() {
        Map<String, Object> stats = new HashMap<>();
        long totalStudents = studentRepository.count();
        long placedStudents = resultRepository.countByResult("SELECTED");
        long totalCompanies = companyRepository.count();
        long activeDrives = driveRepository.countByStatus("Active");
        long totalApplications = applicationRepository.count();

        // Exact keys expected by frontend client.ts
        stats.put("activeDrivesCount", activeDrives);
        stats.put("totalStudentsCount", totalStudents);
        stats.put("placedStudentsCount", placedStudents);
        stats.put("totalApplicationsCount", totalApplications);
        stats.put("totalCompaniesCount", totalCompanies);
        stats.put("placementRate", totalStudents > 0 ? (placedStudents * 100.0 / totalStudents) : 0.0);
        stats.put("highestPackage", "₹44.0 LPA");
        stats.put("averagePackage", "₹7.8 LPA");

        // Backward compatibility
        stats.put("activeDrives", activeDrives);
        stats.put("totalStudents", totalStudents);
        stats.put("placedStudents", placedStudents);

        return ResponseEntity.ok(stats);
    }
}
