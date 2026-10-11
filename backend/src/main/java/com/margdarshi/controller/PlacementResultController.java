package com.margdarshi.controller;

import com.margdarshi.entity.PlacementDrive;
import com.margdarshi.entity.PlacementResult;
import com.margdarshi.entity.Student;
import com.margdarshi.repository.PlacementDriveRepository;
import com.margdarshi.repository.PlacementResultRepository;
import com.margdarshi.repository.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/results")
public class PlacementResultController {

    private final PlacementResultRepository resultRepository;
    private final StudentRepository studentRepository;
    private final PlacementDriveRepository driveRepository;

    public PlacementResultController(
            PlacementResultRepository resultRepository,
            StudentRepository studentRepository,
            PlacementDriveRepository driveRepository) {
        this.resultRepository = resultRepository;
        this.studentRepository = studentRepository;
        this.driveRepository = driveRepository;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllResults() {
        List<PlacementResult> all = resultRepository.findAll();
        List<Map<String, Object>> response = all.stream().map(this::toMap).toList();
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<?> publishResult(@RequestBody Map<String, String> payload) {
        String studentId = payload.get("studentId");
        String driveId = payload.get("driveId");
        String result = payload.get("result");
        String ctcPackage = payload.get("ctcPackage");

        if (studentId == null || driveId == null || result == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "studentId, driveId, and result are required"));
        }

        Student student = studentRepository.findById(studentId).orElse(null);
        PlacementDrive drive = driveRepository.findById(driveId).orElse(null);
        if (student == null || drive == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Student or PlacementDrive not found"));
        }

        PlacementResult pr = resultRepository.findByStudentIdAndDriveId(studentId, driveId)
                .orElse(new PlacementResult());
        if (pr.getId() == null) {
            pr.setId("res-" + UUID.randomUUID().toString().substring(0, 8));
        }
        pr.setStudent(student);
        pr.setDrive(drive);
        pr.setResult(result);
        pr.setCtcPackage(ctcPackage != null ? ctcPackage : "₹10.0 LPA");
        pr.setUpdatedAt(LocalDateTime.now());

        PlacementResult saved = resultRepository.save(pr);
        return ResponseEntity.status(HttpStatus.CREATED).body(toMap(saved));
    }

    private Map<String, Object> toMap(PlacementResult r) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", r.getId());
        map.put("studentId", r.getStudent() != null ? r.getStudent().getId() : null);
        map.put("driveId", r.getDrive() != null ? r.getDrive().getId() : null);
        map.put("result", r.getResult());
        map.put("ctcPackage", r.getCtcPackage());
        map.put("updatedAt", r.getUpdatedAt() != null ? r.getUpdatedAt().toString() : null);
        return map;
    }
}
