package com.margdarshi.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "stage_progress",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_app_stage", columnNames = {"application_id", "stage_id"})
    }
)
public class StageProgress {

    @Id
    @Column(length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stage_id", nullable = false)
    private RecruitmentStage stage;

    @Column(nullable = false, length = 32)
    private String status = "PENDING"; // "PENDING", "COMPLETED", "FAILED"

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "reported_by", nullable = false, length = 32)
    private String reportedBy = "STUDENT"; // "STUDENT" or "COORDINATOR"

    public StageProgress() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    @JsonIgnore
    public Application getApplication() { return application; }
    public void setApplication(Application application) { this.application = application; }

    public RecruitmentStage getStage() { return stage; }
    public void setStage(RecruitmentStage stage) { this.stage = stage; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public String getReportedBy() { return reportedBy; }
    public void setReportedBy(String reportedBy) { this.reportedBy = reportedBy; }
}
