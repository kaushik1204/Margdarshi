package com.margdarshi.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "recruitment_stages")
public class RecruitmentStage {

    @Id
    @Column(length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "drive_id", nullable = false)
    private PlacementDrive drive;

    @Column(nullable = false)
    private String name;

    @Column(name = "stage_order", nullable = false)
    private Integer stageOrder;

    @Column(name = "stage_date")
    private String stageDate;

    private String platform;

    @Column(columnDefinition = "TEXT")
    private String link;

    @Column(length = 32)
    private String status = "Active";

    public RecruitmentStage() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public PlacementDrive getDrive() { return drive; }
    public void setDrive(PlacementDrive drive) { this.drive = drive; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getStageOrder() { return stageOrder; }
    public void setStageOrder(Integer stageOrder) { this.stageOrder = stageOrder; }

    public String getStageDate() { return stageDate; }
    public void setStageDate(String stageDate) { this.stageDate = stageDate; }

    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }

    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
