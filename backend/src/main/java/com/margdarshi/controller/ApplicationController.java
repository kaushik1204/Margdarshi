package com.margdarshi.controller;

import com.margdarshi.entity.*;
import com.margdarshi.repository.*;
import com.margdarshi.service.EligibilityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationRepository applicationRepository;
    private final StudentRepository studentRepository;
    private final PlacementDriveRepository driveRepository;
    private final EligibilityCriteriaRepository criteriaRepository;
    private final RecruitmentStageRepository stageRepository;
    private final StageProgressRepository stageProgressRepository;
    private final EligibilityService eligibilityService;
    private final UserRepository userRepository;

    public ApplicationController(ApplicationRepository applicationRepository,
                                 StudentRepository studentRepository,
                                 PlacementDriveRepository driveRepository,
                                 EligibilityCriteriaRepository criteriaRepository,
                                 RecruitmentStageRepository stageRepository,
                                 StageProgressRepository stageProgressRepository,
                                 EligibilityService eligibilityService,
                                 UserRepository userRepository) {
        this.applicationRepository = applicationRepository;
        this.studentRepository = studentRepository;
        this.driveRepository = driveRepository;
        this.criteriaRepository = criteriaRepository;
        this.stageRepository = stageRepository;
        this.stageProgressRepository = stageProgressRepository;
        this.eligibilityService = eligibilityService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<?> getApplications(Authentication auth,
                                            @RequestParam(required = false) String driveId,
                                            @RequestParam(required = false) String studentId) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        List<Application> apps;
        if ("STUDENT".equals(user.getRole())) {
            Student student = studentRepository.findByUserId(user.getId()).orElse(null);
            if (student == null) return ResponseEntity.ok(Collections.emptyList());
            apps = applicationRepository.findByStudentId(student.getId());
        } else if (studentId != null) {
            apps = applicationRepository.findByStudentId(studentId);
        } else if (driveId != null) {
            apps = applicationRepository.findByDriveId(driveId);
        } else {
            apps = applicationRepository.findAll();
        }

        List<Map<String, Object>> response = apps.stream().map(a -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", a.getId());
            map.put("studentId", a.getStudent().getId());
            map.put("studentName", a.getStudent().getName());
            map.put("studentRoll", a.getStudent().getRollNumber());
            map.put("studentBranch", a.getStudent().getBranch());
            map.put("studentCgpa", a.getStudent().getCgpa());
            map.put("studentEmail", a.getStudent().getEmail());
            map.put("studentPhone", a.getStudent().getPhone());
            map.put("studentResumePath", a.getStudent().getResumePath());
            map.put("driveId", a.getDrive().getId());
            map.put("driveName", a.getDrive().getRoleTitle());
            map.put("companyName", a.getDrive().getCompanyName());
            map.put("companyApplicationId", a.getCompanyApplicationId());
            map.put("selfReportStatus", a.getSelfReportStatus());
            map.put("eligibleAtApplication", a.getEligibleAtApplication());
            map.put("createdAt", a.getCreatedAt());

            List<StageProgress> spList = stageProgressRepository.findByApplicationId(a.getId());
            List<Map<String, Object>> spMaps = spList.stream().map(sp -> {
                Map<String, Object> spMap = new HashMap<>();
                spMap.put("id", sp.getId());
                spMap.put("stageId", sp.getStage() != null ? sp.getStage().getId() : null);
                spMap.put("stageName", sp.getStage() != null ? sp.getStage().getName() : null);
                spMap.put("status", sp.getStatus());
                spMap.put("reportedBy", sp.getReportedBy());
                spMap.put("completedAt", sp.getCompletedAt());
                return spMap;
            }).toList();
            map.put("stageProgress", spMaps);
            return map;
        }).toList();

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> apply(Authentication auth, @RequestBody Map<String, String> payload) {
        String driveId = payload.get("driveId");
        String companyAppId = payload.get("companyApplicationId");

        if (driveId == null || companyAppId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "driveId and companyApplicationId are required"));
        }

        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        Student student = studentRepository.findByUserId(user.getId()).orElse(null);
        if (student == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Student profile not found"));
        }

        PlacementDrive drive = driveRepository.findById(driveId).orElse(null);
        if (drive == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Drive not found"));
        }

        // 1. Authoritative Server-side Eligibility Verification
        EligibilityCriteria criteria = criteriaRepository.findByDriveId(driveId).orElse(null);
        if (criteria != null) {
            EligibilityService.EvaluationResult eval = eligibilityService.evaluate(student, criteria);
            if (!eval.isEligible()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Ineligible for this recruitment drive.",
                        "reasons", eval.getReasons()
                ));
            }
        }

        // 2. Composite Uniqueness constraint check (student_id, drive_id)
        if (applicationRepository.existsByStudentIdAndDriveId(student.getId(), driveId)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "error", "You have already submitted an application for this drive. Duplicate applications are not allowed."
            ));
        }

        String appId = "app-" + System.currentTimeMillis();
        Application app = new Application();
        app.setId(appId);
        app.setStudent(student);
        app.setDrive(drive);
        app.setCompanyApplicationId(companyAppId.trim());
        app.setSelfReportStatus("SELF_REPORTED");
        app.setEligibleAtApplication(true);
        app.setCreatedAt(LocalDateTime.now());
        app.setUpdatedAt(LocalDateTime.now());
        applicationRepository.save(app);

        // Auto-seed first stage progress
        List<RecruitmentStage> stages = stageRepository.findByDriveIdOrderByStageOrderAsc(driveId);
        if (!stages.isEmpty()) {
            StageProgress sp = new StageProgress();
            sp.setId("sp-" + System.currentTimeMillis());
            sp.setApplication(app);
            sp.setStage(stages.get(0));
            sp.setStatus("PENDING");
            sp.setReportedBy("STUDENT");
            stageProgressRepository.save(sp);
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("id", app.getId());
        resp.put("studentId", student.getId());
        resp.put("studentName", student.getName());
        resp.put("studentRoll", student.getRollNumber());
        resp.put("studentBranch", student.getBranch());
        resp.put("studentCgpa", student.getCgpa());
        resp.put("studentEmail", student.getEmail());
        resp.put("studentPhone", student.getPhone());
        resp.put("studentResumePath", student.getResumePath());
        resp.put("driveId", drive.getId());
        resp.put("companyApplicationId", app.getCompanyApplicationId());
        resp.put("selfReportStatus", app.getSelfReportStatus());
        resp.put("eligibleAtApplication", app.getEligibleAtApplication());
        resp.put("createdAt", app.getCreatedAt());
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    @PatchMapping("/{id}/self-report")
    public ResponseEntity<?> updateSelfReport(@PathVariable String id, @RequestBody Map<String, String> payload) {
        Application app = applicationRepository.findById(id).orElse(null);
        if (app == null) return ResponseEntity.notFound().build();
        if (payload.containsKey("selfReportStatus") && payload.get("selfReportStatus") != null) {
            app.setSelfReportStatus(payload.get("selfReportStatus"));
        }
        if (payload.containsKey("companyApplicationId") && payload.get("companyApplicationId") != null) {
            app.setCompanyApplicationId(payload.get("companyApplicationId").trim());
        }
        app.setUpdatedAt(LocalDateTime.now());
        Application saved = applicationRepository.save(app);

        Map<String, Object> map = new HashMap<>();
        map.put("id", saved.getId());
        map.put("companyApplicationId", saved.getCompanyApplicationId());
        map.put("selfReportStatus", saved.getSelfReportStatus());
        map.put("updatedAt", saved.getUpdatedAt());
        return ResponseEntity.ok(map);
    }

    @PostMapping("/{applicationId}/stages")
    public ResponseEntity<?> updateStageProgress(
            @PathVariable String applicationId,
            @RequestBody Map<String, String> payload,
            Authentication auth) {
        Application app = applicationRepository.findById(applicationId).orElse(null);
        if (app == null) return ResponseEntity.notFound().build();
        String stageId = payload.get("stageId");
        String status = payload.getOrDefault("status", "COMPLETED");

        RecruitmentStage stage = stageRepository.findById(stageId).orElse(null);
        if (stage == null) return ResponseEntity.badRequest().body(Map.of("error", "Stage not found"));

        StageProgress sp = stageProgressRepository.findByApplicationIdAndStageId(applicationId, stageId)
                .orElse(new StageProgress());
        if (sp.getId() == null) {
            sp.setId("sp-" + System.currentTimeMillis());
            sp.setApplication(app);
            sp.setStage(stage);
        }
        sp.setStatus(status);

        boolean isCoordinator = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_COORDINATOR".equals(a.getAuthority()));
        sp.setReportedBy(isCoordinator ? "COORDINATOR" : "STUDENT");

        if ("COMPLETED".equalsIgnoreCase(status)) {
            sp.setCompletedAt(LocalDateTime.now());
        }
        StageProgress saved = stageProgressRepository.save(sp);

        Map<String, Object> map = new HashMap<>();
        map.put("id", saved.getId());
        map.put("applicationId", applicationId);
        map.put("stageId", stageId);
        map.put("stageName", stage.getName());
        map.put("status", saved.getStatus());
        map.put("reportedBy", saved.getReportedBy());
        map.put("completedAt", saved.getCompletedAt());
        return ResponseEntity.ok(map);
    }
}
