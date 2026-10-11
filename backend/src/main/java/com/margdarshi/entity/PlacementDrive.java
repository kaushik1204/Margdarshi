package com.margdarshi.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "placement_drives")
public class PlacementDrive {

    @Id
    @Column(length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "role_title", nullable = false)
    private String roleTitle;

    @Column(name = "job_type", nullable = false, length = 32)
    private String jobType = "Full Time";

    @Column(nullable = false, length = 64)
    private String ctc;

    @Column(name = "raw_ctc_number", nullable = false, precision = 6, scale = 2)
    private BigDecimal rawCtcNumber;

    @Column(nullable = false, length = 32)
    private String tier;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false, length = 64)
    private String deadline;

    @Column(name = "external_url", columnDefinition = "TEXT")
    private String externalUrl;

    @Column(name = "job_description", columnDefinition = "TEXT")
    private String jobDescription;

    @Column(nullable = false, length = 32)
    private String status = "Active";

    @Column(name = "current_stage", nullable = false, length = 128)
    private String currentStage;

    @Column(name = "current_stage_status", nullable = false, length = 32)
    private String currentStageStatus = "normal";

    @OneToOne(mappedBy = "drive", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private EligibilityCriteria criteria;

    @OneToMany(mappedBy = "drive", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<RecruitmentStage> stages = new ArrayList<>();

    public PlacementDrive() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    @JsonIgnore
    public Company getCompany() { return company; }
    public void setCompany(Company company) { this.company = company; }

    @Transient
    public String getCompanyId() {
        return company != null ? company.getId() : null;
    }

    public void setCompanyId(String companyId) {
        if (companyId != null) {
            if (this.company == null) {
                this.company = new Company();
            }
            this.company.setId(companyId);
        } else {
            this.company = null;
        }
    }

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

    @JsonIgnore
    public EligibilityCriteria getCriteria() { return criteria; }
    public void setCriteria(EligibilityCriteria criteria) { this.criteria = criteria; }

    @JsonIgnore
    public List<RecruitmentStage> getStages() { return stages; }
    public void setStages(List<RecruitmentStage> stages) { this.stages = stages; }
}
