package com.margdarshi.repository;

import com.margdarshi.entity.StageProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface StageProgressRepository extends JpaRepository<StageProgress, String> {
    List<StageProgress> findByApplicationId(String applicationId);
    Optional<StageProgress> findByApplicationIdAndStageId(String applicationId, String stageId);

    @Query("SELECT COUNT(sp) FROM StageProgress sp WHERE sp.application.drive.id = :driveId AND sp.stage.id = :stageId AND sp.status != 'FAILED'")
    long countByDriveIdAndStageId(@Param("driveId") String driveId, @Param("stageId") String stageId);
}
