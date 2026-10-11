package com.margdarshi.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "eligibility_criteria")
public class EligibilityCriteria {

    @Id
    @Column(length = 64)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "drive_id", nullable = false, unique = true)
    private PlacementDrive drive;

    @Column(name = "min_cgpa", nullable = false, precision = 4, scale = 2)
    private BigDecimal minCgpa;

    @Column(name = "allowed_branches", nullable = false)
    private String allowedBranches; // comma separated: "CSE,IT,AIML"

    @Column(name = "max_backlogs", nullable = false)
    private Integer maxBacklogs = 0;

    @Column(name = "graduation_year")
    private Integer graduationYear = 2026;

    @Column(name = "min_10th_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal min10thPercentage;

    @Column(name = "min_12th_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal min12thPercentage;

    public EligibilityCriteria() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public PlacementDrive getDrive() { return drive; }
    public void setDrive(PlacementDrive drive) { this.drive = drive; }

    public BigDecimal getMinCgpa() { return minCgpa; }
    public void setMinCgpa(BigDecimal minCgpa) { this.minCgpa = minCgpa; }

    public String getAllowedBranches() { return allowedBranches; }
    public void setAllowedBranches(String allowedBranches) { this.allowedBranches = allowedBranches; }

    public Integer getMaxBacklogs() { return maxBacklogs; }
    public void setMaxBacklogs(Integer maxBacklogs) { this.maxBacklogs = maxBacklogs; }

    public Integer getGraduationYear() { return graduationYear; }
    public void setGraduationYear(Integer graduationYear) { this.graduationYear = graduationYear; }

    public BigDecimal getMin10thPercentage() { return min10thPercentage; }
    public void setMin10thPercentage(BigDecimal min10thPercentage) { this.min10thPercentage = min10thPercentage; }

    public BigDecimal getMin12thPercentage() { return min12thPercentage; }
    public void setMin12thPercentage(BigDecimal min12thPercentage) { this.min12thPercentage = min12thPercentage; }
}
