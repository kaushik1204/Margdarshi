package com.margdarshi.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "applications",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_student_drive", columnNames = {"student_id", "drive_id"})
    }
)
public class Application {

    @Id
    @Column(length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "drive_id", nullable = false)
    private PlacementDrive drive;

    @Column(name = "company_application_id", nullable = false, length = 128)
    private String companyApplicationId;

    @Column(name = "self_report_status", nullable = false, length = 32)
    private String selfReportStatus = "SELF_REPORTED";

    @Column(name = "eligible_at_application", nullable = false)
    private Boolean eligibleAtApplication = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "application", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<StageProgress> stageProgresses = new ArrayList<>();

    public Application() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public PlacementDrive getDrive() { return drive; }
    public void setDrive(PlacementDrive drive) { this.drive = drive; }

    public String getCompanyApplicationId() { return companyApplicationId; }
    public void setCompanyApplicationId(String companyApplicationId) { this.companyApplicationId = companyApplicationId; }

    public String getSelfReportStatus() { return selfReportStatus; }
    public void setSelfReportStatus(String selfReportStatus) { this.selfReportStatus = selfReportStatus; }

    public Boolean getEligibleAtApplication() { return eligibleAtApplication; }
    public void setEligibleAtApplication(Boolean eligibleAtApplication) { this.eligibleAtApplication = eligibleAtApplication; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<StageProgress> getStageProgresses() { return stageProgresses; }
    public void setStageProgresses(List<StageProgress> stageProgresses) { this.stageProgresses = stageProgresses; }
}
