package com.margdarshi.controller;

import com.margdarshi.dto.DriveDTOs.*;
import com.margdarshi.dto.DriveDTOs.DriveDetailResponse;
import com.margdarshi.dto.DriveDTOs.CreateDriveRequest;
import com.margdarshi.entity.*;
import com.margdarshi.repository.*;
import com.margdarshi.service.EligibilityService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/drives")
public class PlacementDriveController {

    private final PlacementDriveRepository driveRepository;
    private final EligibilityCriteriaRepository criteriaRepository;
    private final RecruitmentStageRepository stageRepository;
    private final ApplicationRepository applicationRepository;
    private final PlacementResultRepository resultRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final StageProgressRepository stageProgressRepository;
    private final EligibilityService eligibilityService;

    public PlacementDriveController(
            PlacementDriveRepository driveRepository,
            EligibilityCriteriaRepository criteriaRepository,
            RecruitmentStageRepository stageRepository,
            ApplicationRepository applicationRepository,
            PlacementResultRepository resultRepository,
            StudentRepository studentRepository,
            UserRepository userRepository,
            StageProgressRepository stageProgressRepository,
            EligibilityService eligibilityService) {
        this.driveRepository = driveRepository;
        this.criteriaRepository = criteriaRepository;
        this.stageRepository = stageRepository;
        this.applicationRepository = applicationRepository;
        this.resultRepository = resultRepository;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.stageProgressRepository = stageProgressRepository;
        this.eligibilityService = eligibilityService;
    }

    private Student getCurrentAuthenticatedStudent() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                String email = auth.getName();
                Optional<User> uOpt = userRepository.findByEmail(email);
                if (uOpt.isPresent() && "STUDENT".equals(uOpt.get().getRole())) {
                    return studentRepository.findByUserId(uOpt.get().getId()).orElse(null);
                }
            }
        } catch (Exception ignored) {}
        return null;
    }

    private DriveDetailResponse buildDriveDetail(PlacementDrive d, List<Student> allStudents, Student currentStudent) {
        Optional<EligibilityCriteria> critOpt = criteriaRepository.findByDriveId(d.getId());
        List<RecruitmentStage> stages = stageRepository.findByDriveIdOrderByStageOrderAsc(d.getId());
        long appCount = applicationRepository.countByDriveId(d.getId());

        // Sanity check: later stage candidates must never exceed previous stage, scoped strictly to current drive
        long runningLimit = appCount;
        List<StageDTO> stageDtos = new ArrayList<>();
        for (RecruitmentStage s : stages) {
            long rawCount = stageProgressRepository.countByDriveIdAndStageId(d.getId(), s.getId());
            long verifiedCount = Math.min(rawCount, runningLimit);
            runningLimit = verifiedCount;

            StageDTO sd = new StageDTO();
            sd.setId(s.getId());
            sd.setDriveId(d.getId());
            sd.setName(s.getName());
            sd.setStageOrder(s.getStageOrder());
            sd.setDate(s.getStageDate());
            sd.setPlatform(s.getPlatform());
            sd.setLink(s.getLink());
            sd.setCandidateCount(verifiedCount);
            double passRate = appCount > 0 ? (verifiedCount * 100.0 / appCount) : 0.0;
            sd.setPassingRate(passRate);
            stageDtos.add(sd);
        }

        long rawSelected = resultRepository.countByDriveIdAndResult(d.getId(), "SELECTED");
        // Selected count cannot exceed the candidates who cleared the final stage
        long selectedCount = Math.min(rawSelected, runningLimit);

        long eligibleCount = 0;
        Boolean isEligibleForCaller = null;
        if (critOpt.isPresent()) {
            EligibilityCriteria crit = critOpt.get();
            eligibleCount = allStudents.stream()
                    .filter(s -> eligibilityService.evaluate(s, crit).isEligible())
                    .count();
            if (currentStudent != null) {
                isEligibleForCaller = eligibilityService.evaluate(currentStudent, crit).isEligible();
            }
        }

        DriveDetailResponse resp = new DriveDetailResponse(d, critOpt.orElse(null), stageDtos, appCount, selectedCount, eligibleCount);
        resp.setEligible(isEligibleForCaller);
        return resp;
    }

    @GetMapping
    public ResponseEntity<List<DriveDetailResponse>> getAllDrives() {
        List<PlacementDrive> drives = driveRepository.findAll();
        List<Student> allStudents = studentRepository.findAll();
        Student currentStudent = getCurrentAuthenticatedStudent();
        List<DriveDetailResponse> response = drives.stream()
                .map(d -> buildDriveDetail(d, allStudents, currentStudent))
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DriveDetailResponse> getDriveById(@PathVariable String id) {
        Optional<PlacementDrive> driveOpt = driveRepository.findById(id);
        if (driveOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        List<Student> allStudents = studentRepository.findAll();
        Student currentStudent = getCurrentAuthenticatedStudent();
        return ResponseEntity.ok(buildDriveDetail(driveOpt.get(), allStudents, currentStudent));
    }

    @PostMapping
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<?> createDrive(@Valid @RequestBody CreateDriveRequest request) {
        String driveId = "drive-" + UUID.randomUUID().toString().substring(0, 8);

        PlacementDrive drive = new PlacementDrive();
        drive.setId(driveId);
        drive.setCompanyId(request.getCompanyId());
        drive.setCompanyName(request.getCompanyName() != null ? request.getCompanyName() : "Partner Recruiter");
        drive.setRoleTitle(request.getRoleTitle());
        drive.setJobType(request.getJobType() != null ? request.getJobType() : "Full Time");
        drive.setCtc(request.getCtc());
        drive.setRawCtcNumber(request.getRawCtcNumber() != null ? request.getRawCtcNumber() : BigDecimal.valueOf(10.0));
        drive.setTier(request.getTier() != null ? request.getTier() : "tier-2");
        drive.setLocation(request.getLocation() != null ? request.getLocation() : "Hyderabad");
        drive.setDeadline(request.getDeadline());
        drive.setExternalUrl(request.getExternalUrl());
        drive.setJobDescription(request.getJobDescription());
        drive.setStatus("Active");
        drive.setCurrentStage("Registration Open");
        drive.setCurrentStageStatus("normal");

        PlacementDrive savedDrive = driveRepository.save(drive);

        if (request.getCriteria() != null) {
            EligibilityCriteria crit = new EligibilityCriteria();
            crit.setId("crit-" + UUID.randomUUID().toString().substring(0, 8));
            crit.setDrive(savedDrive);
            crit.setMinCgpa(request.getCriteria().getMinCgpa() != null ? request.getCriteria().getMinCgpa() : BigDecimal.valueOf(7.0));
            crit.setAllowedBranches(request.getCriteria().getAllowedBranches() != null ? String.join(",", request.getCriteria().getAllowedBranches()) : "CSE,IT");
            crit.setMaxBacklogs(request.getCriteria().getMaxBacklogs() != null ? request.getCriteria().getMaxBacklogs() : 0);
            crit.setGraduationYear(request.getCriteria().getGraduationYear() != null ? request.getCriteria().getGraduationYear() : 2026);
            crit.setMin10thPercentage(request.getCriteria().getMin10thPercentage() != null ? request.getCriteria().getMin10thPercentage() : BigDecimal.valueOf(60.0));
            crit.setMin12thPercentage(request.getCriteria().getMin12thPercentage() != null ? request.getCriteria().getMin12thPercentage() : BigDecimal.valueOf(60.0));
            criteriaRepository.save(crit);
        }

        if (request.getStages() != null && !request.getStages().isEmpty()) {
            int order = 1;
            for (StageDTO s : request.getStages()) {
                RecruitmentStage stage = new RecruitmentStage();
                stage.setId(s.getId() != null ? s.getId() : "stage-" + UUID.randomUUID().toString().substring(0, 8));
                stage.setDrive(savedDrive);
                stage.setName(s.getName());
                stage.setStageOrder(s.getStageOrder() != null ? s.getStageOrder() : order++);
                stage.setStageDate(s.getDate());
                stage.setPlatform(s.getPlatform());
                stage.setLink(s.getLink());
                stage.setStatus("Active");
                stageRepository.save(stage);
            }
        }

        List<Student> allStudents = studentRepository.findAll();
        return ResponseEntity.status(HttpStatus.CREATED).body(buildDriveDetail(savedDrive, allStudents, null));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<?> updateDrive(@PathVariable String id, @RequestBody Map<String, Object> payload) {
        Optional<PlacementDrive> opt = driveRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        PlacementDrive d = opt.get();

        if (payload.containsKey("roleTitle") && payload.get("roleTitle") != null) d.setRoleTitle(payload.get("roleTitle").toString());
        if (payload.containsKey("jobType") && payload.get("jobType") != null) d.setJobType(payload.get("jobType").toString());
        if (payload.containsKey("ctc") && payload.get("ctc") != null) d.setCtc(payload.get("ctc").toString());
        if (payload.containsKey("rawCtcNumber") && payload.get("rawCtcNumber") != null) {
            d.setRawCtcNumber(new BigDecimal(payload.get("rawCtcNumber").toString()));
        }
        if (payload.containsKey("tier") && payload.get("tier") != null) d.setTier(payload.get("tier").toString());
        if (payload.containsKey("location") && payload.get("location") != null) d.setLocation(payload.get("location").toString());
        if (payload.containsKey("deadline") && payload.get("deadline") != null) d.setDeadline(payload.get("deadline").toString());
        if (payload.containsKey("externalUrl")) d.setExternalUrl((String) payload.get("externalUrl"));
        if (payload.containsKey("jobDescription")) d.setJobDescription((String) payload.get("jobDescription"));
        if (payload.containsKey("status") && payload.get("status") != null) d.setStatus(payload.get("status").toString());
        if (payload.containsKey("currentStage") && payload.get("currentStage") != null) d.setCurrentStage(payload.get("currentStage").toString());
        if (payload.containsKey("currentStageStatus") && payload.get("currentStageStatus") != null) d.setCurrentStageStatus(payload.get("currentStageStatus").toString());

        // Update or add stages/levels if provided
        if (payload.containsKey("stages") && payload.get("stages") instanceof List) {
            List<?> stageList = (List<?>) payload.get("stages");
            List<RecruitmentStage> oldStages = stageRepository.findByDriveIdOrderByStageOrderAsc(d.getId());
            stageRepository.deleteAll(oldStages);

            int order = 1;
            for (Object obj : stageList) {
                if (obj instanceof Map) {
                    Map<?, ?> sm = (Map<?, ?>) obj;
                    RecruitmentStage stage = new RecruitmentStage();
                    String sId = sm.get("id") != null ? sm.get("id").toString() : "stage-" + UUID.randomUUID().toString().substring(0, 8);
                    stage.setId(sId);
                    stage.setDrive(d);
                    stage.setName(sm.get("name") != null ? sm.get("name").toString() : "Round " + order);
                    stage.setStageOrder(sm.get("stageOrder") != null ? Integer.parseInt(sm.get("stageOrder").toString()) : order);
                    if (sm.get("date") != null) stage.setStageDate(sm.get("date").toString());
                    if (sm.get("platform") != null) stage.setPlatform(sm.get("platform").toString());
                    if (sm.get("link") != null) stage.setLink(sm.get("link").toString());
                    stage.setStatus("Active");
                    stageRepository.save(stage);
                    order++;
                }
            }
        }

        PlacementDrive saved = driveRepository.save(d);
        List<Student> allStudents = studentRepository.findAll();
        return ResponseEntity.ok(buildDriveDetail(saved, allStudents, null));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<?> deleteDrive(@PathVariable String id) {
        if (!driveRepository.existsById(id)) return ResponseEntity.notFound().build();
        driveRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Drive deleted successfully"));
    }

    @PutMapping("/{id}/criteria")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<?> updateCriteria(@PathVariable String id, @RequestBody CriteriaDTO dto) {
        PlacementDrive drive = driveRepository.findById(id).orElse(null);
        if (drive == null) return ResponseEntity.notFound().build();

        EligibilityCriteria crit = criteriaRepository.findByDriveId(id).orElse(new EligibilityCriteria());
        if (crit.getId() == null) {
            crit.setId("crit-" + UUID.randomUUID().toString().substring(0, 8));
            crit.setDrive(drive);
        }
        if (dto.getMinCgpa() != null) crit.setMinCgpa(dto.getMinCgpa());
        if (dto.getAllowedBranches() != null) crit.setAllowedBranches(String.join(",", dto.getAllowedBranches()));
        if (dto.getMaxBacklogs() != null) crit.setMaxBacklogs(dto.getMaxBacklogs());
        if (dto.getGraduationYear() != null) crit.setGraduationYear(dto.getGraduationYear());
        if (dto.getMin10thPercentage() != null) crit.setMin10thPercentage(dto.getMin10thPercentage());
        if (dto.getMin12thPercentage() != null) crit.setMin12thPercentage(dto.getMin12thPercentage());

        criteriaRepository.save(crit);
        return ResponseEntity.ok(Map.of("message", "Criteria updated successfully", "criteria", dto));
    }
}
