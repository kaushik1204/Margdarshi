package com.margdarshi.repository;

import com.margdarshi.entity.RecruitmentStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface RecruitmentStageRepository extends JpaRepository<RecruitmentStage, String> {
    @Query("SELECT rs FROM RecruitmentStage rs WHERE rs.drive.id = :driveId ORDER BY rs.stageOrder ASC")
    List<RecruitmentStage> findByDriveIdOrderByStageOrderAsc(@Param("driveId") String driveId);
}
