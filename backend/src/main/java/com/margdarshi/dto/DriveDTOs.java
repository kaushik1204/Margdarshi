package com.margdarshi.dto;

import com.margdarshi.entity.EligibilityCriteria;
import com.margdarshi.entity.PlacementDrive;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class DriveDTOs {

    public static class DriveResponse {
        private String id;
        private String companyId;
        private String companyName;
        private String roleTitle;
        private String jobType;
        private String ctc;
        private BigDecimal rawCtcNumber;
        private String tier;
        private String location;
        private String deadline;
        private String externalUrl;
        private String jobDescription;
        private String status;
        private String currentStage;
        private String currentStageStatus;
        private CriteriaDTO criteria;
        private List<StageDTO> stages;
        private long applicationsCount;
        private long selectedCount;
        private long eligibleCount;
        private Boolean eligible;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getCompanyId() { return companyId; }
        public void setCompanyId(String companyId) { this.companyId = companyId; }
        public String getCompanyName() { return companyName; }
        public void setCompanyName(String companyName) { this.companyName = companyName; }
        public String getRoleTitle() { return roleTitle; }
        public void setRoleTitle(String roleTitle) { this.roleTitle = roleTitle; }
        public String getJobType() { return jobType; }
        public void setJobType(String jobType) { this.jobType = jobType; }
        public String getCtc() { return ctc; }
        public void setCtc(String ctc) { this.ctc = ctc; }
        public BigDecimal getRawCtcNumber() { return rawCtcNumber; }
        public void setRawCtcNumber(BigDecimal rawCtcNumber) { this.rawCtcNumber = rawCtcNumber; }
        public String getTier() { return tier; }
        public void setTier(String tier) { this.tier = tier; }
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        public String getDeadline() { return deadline; }
        public void setDeadline(String deadline) { this.deadline = deadline; }
        public String getExternalUrl() { return externalUrl; }
        public void setExternalUrl(String externalUrl) { this.externalUrl = externalUrl; }
        public String getJobDescription() { return jobDescription; }
        public void setJobDescription(String jobDescription) { this.jobDescription = jobDescription; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getCurrentStage() { return currentStage; }
        public void setCurrentStage(String currentStage) { this.currentStage = currentStage; }
        public String getCurrentStageStatus() { return currentStageStatus; }
        public void setCurrentStageStatus(String currentStageStatus) { this.currentStageStatus = currentStageStatus; }
        public CriteriaDTO getCriteria() { return criteria; }
        public void setCriteria(CriteriaDTO criteria) { this.criteria = criteria; }
        public List<StageDTO> getStages() { return stages; }
        public void setStages(List<StageDTO> stages) { this.stages = stages; }
        public long getApplicationsCount() { return applicationsCount; }
        public void setApplicationsCount(long applicationsCount) { this.applicationsCount = applicationsCount; }
        public long getSelectedCount() { return selectedCount; }
        public void setSelectedCount(long selectedCount) { this.selectedCount = selectedCount; }
        public long getEligibleCount() { return eligibleCount; }
        public void setEligibleCount(long eligibleCount) { this.eligibleCount = eligibleCount; }
        public Boolean getEligible() { return eligible; }
        public void setEligible(Boolean eligible) { this.eligible = eligible; }
    }

    public static class DriveDetailResponse extends DriveResponse {
        public DriveDetailResponse() {
            super();
        }

        public DriveDetailResponse(
                PlacementDrive drive,
                EligibilityCriteria criteria,
                List<StageDTO> stageDtos,
                long applicationsCount,
                long selectedCount,
                long eligibleCount) {
            super();
            populateCommon(drive, criteria);
            setStages(stageDtos != null ? stageDtos : Collections.emptyList());
            setApplicationsCount(applicationsCount);
            setSelectedCount(selectedCount);
            setEligibleCount(eligibleCount);
        }

        private void populateCommon(PlacementDrive drive, EligibilityCriteria criteria) {
            if (drive != null) {
                setId(drive.getId());
                setCompanyId(drive.getCompanyId());
                setCompanyName(drive.getCompanyName());
                setRoleTitle(drive.getRoleTitle());
                setJobType(drive.getJobType());
                setCtc(drive.getCtc());
                setRawCtcNumber(drive.getRawCtcNumber());
                setTier(drive.getTier());
                setLocation(drive.getLocation());
                setDeadline(drive.getDeadline());
                setExternalUrl(drive.getExternalUrl());
                setJobDescription(drive.getJobDescription());
                setStatus(drive.getStatus());
                setCurrentStage(drive.getCurrentStage());
                setCurrentStageStatus(drive.getCurrentStageStatus());
            }
            if (criteria != null) {
                CriteriaDTO cDto = new CriteriaDTO();
                cDto.setId(criteria.getId());
                cDto.setMinCgpa(criteria.getMinCgpa());
                if (criteria.getAllowedBranches() != null) {
                    cDto.setAllowedBranches(Arrays.stream(criteria.getAllowedBranches().split(","))
                            .map(String::trim)
                            .filter(s -> !s.isEmpty())
                            .toList());
                } else {
                    cDto.setAllowedBranches(Collections.emptyList());
                }
                cDto.setMaxBacklogs(criteria.getMaxBacklogs());
                cDto.setGraduationYear(criteria.getGraduationYear());
                cDto.setMin10thPercentage(criteria.getMin10thPercentage());
                cDto.setMin12thPercentage(criteria.getMin12thPercentage());
                setCriteria(cDto);
            }
        }
    }

    public static class CriteriaDTO {
        private String id;
        private BigDecimal minCgpa;
        private List<String> allowedBranches;
        private Integer maxBacklogs;
        private Integer graduationYear;
        private BigDecimal min10thPercentage;
        private BigDecimal min12thPercentage;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public BigDecimal getMinCgpa() { return minCgpa; }
        public void setMinCgpa(BigDecimal minCgpa) { this.minCgpa = minCgpa; }
        public List<String> getAllowedBranches() { return allowedBranches; }
        public void setAllowedBranches(List<String> allowedBranches) { this.allowedBranches = allowedBranches; }
        public Integer getMaxBacklogs() { return maxBacklogs; }
        public void setMaxBacklogs(Integer maxBacklogs) { this.maxBacklogs = maxBacklogs; }
        public Integer getGraduationYear() { return graduationYear; }
        public void setGraduationYear(Integer graduationYear) { this.graduationYear = graduationYear; }
        public BigDecimal getMin10thPercentage() { return min10thPercentage; }
        public void setMin10thPercentage(BigDecimal min10thPercentage) { this.min10thPercentage = min10thPercentage; }
        public BigDecimal getMin12thPercentage() { return min12thPercentage; }
        public void setMin12thPercentage(BigDecimal min12thPercentage) { this.min12thPercentage = min12thPercentage; }
    }

    public static class StageDTO {
        private String id;
        private String driveId;
        private String name;
        private Integer stageOrder;
        private String date;
        private String platform;
        private String link;
        private Long candidateCount;
        private Double passingRate;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getDriveId() { return driveId; }
        public void setDriveId(String driveId) { this.driveId = driveId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public Integer getStageOrder() { return stageOrder; }
        public void setStageOrder(Integer stageOrder) { this.stageOrder = stageOrder; }
        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public String getPlatform() { return platform; }
        public void setPlatform(String platform) { this.platform = platform; }
        public String getLink() { return link; }
        public void setLink(String link) { this.link = link; }
        public Long getCandidateCount() { return candidateCount; }
        public void setCandidateCount(Long candidateCount) { this.candidateCount = candidateCount; }
        public Double getPassingRate() { return passingRate; }
        public void setPassingRate(Double passingRate) { this.passingRate = passingRate; }
    }

    public static class CreateDriveRequest {
        private String companyId;
        private String companyName;
        private String roleTitle;
        private String jobType;
        private String ctc;
        private BigDecimal rawCtcNumber;
        private String tier;
        private String location;
        private String deadline;
        private String externalUrl;
        private String jobDescription;
        private CriteriaDTO criteria;
        private List<StageDTO> stages;

        public String getCompanyId() { return companyId; }
        public void setCompanyId(String companyId) { this.companyId = companyId; }
        public String getCompanyName() { return companyName; }
        public void setCompanyName(String companyName) { this.companyName = companyName; }
        public String getRoleTitle() { return roleTitle; }
        public void setRoleTitle(String roleTitle) { this.roleTitle = roleTitle; }
        public String getJobType() { return jobType; }
        public void setJobType(String jobType) { this.jobType = jobType; }
        public String getCtc() { return ctc; }
        public void setCtc(String ctc) { this.ctc = ctc; }
        public BigDecimal getRawCtcNumber() { return rawCtcNumber; }
        public void setRawCtcNumber(BigDecimal rawCtcNumber) { this.rawCtcNumber = rawCtcNumber; }
        public String getTier() { return tier; }
        public void setTier(String tier) { this.tier = tier; }
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        public String getDeadline() { return deadline; }
        public void setDeadline(String deadline) { this.deadline = deadline; }
        public String getExternalUrl() { return externalUrl; }
        public void setExternalUrl(String externalUrl) { this.externalUrl = externalUrl; }
        public String getJobDescription() { return jobDescription; }
        public void setJobDescription(String jobDescription) { this.jobDescription = jobDescription; }
        public CriteriaDTO getCriteria() { return criteria; }
        public void setCriteria(CriteriaDTO criteria) { this.criteria = criteria; }
        public List<StageDTO> getStages() { return stages; }
        public void setStages(List<StageDTO> stages) { this.stages = stages; }
    }
}
