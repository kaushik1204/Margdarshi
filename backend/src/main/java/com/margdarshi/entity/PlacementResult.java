package com.margdarshi.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "placement_results",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_result_student_drive", columnNames = {"student_id", "drive_id"})
    }
)
public class PlacementResult {

    @Id
    @Column(length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "drive_id", nullable = false)
    private PlacementDrive drive;

    @Column(nullable = false, length = 32)
    private String result; // "SELECTED" or "REJECTED"

    @Column(name = "ctc_package", nullable = false, length = 64)
    private String ctcPackage;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public PlacementResult() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public PlacementDrive getDrive() { return drive; }
    public void setDrive(PlacementDrive drive) { this.drive = drive; }

    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }

    public String getCtcPackage() { return ctcPackage; }
    public void setCtcPackage(String ctcPackage) { this.ctcPackage = ctcPackage; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
