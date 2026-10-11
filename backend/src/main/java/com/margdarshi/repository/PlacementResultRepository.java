package com.margdarshi.repository;

import com.margdarshi.entity.PlacementResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface PlacementResultRepository extends JpaRepository<PlacementResult, String> {
    @Query("SELECT r FROM PlacementResult r WHERE r.student.id = :studentId")
    List<PlacementResult> findByStudentId(@Param("studentId") String studentId);

    @Query("SELECT r FROM PlacementResult r WHERE r.drive.id = :driveId")
    List<PlacementResult> findByDriveId(@Param("driveId") String driveId);

    @Query("SELECT r FROM PlacementResult r WHERE r.student.id = :studentId AND r.drive.id = :driveId")
    Optional<PlacementResult> findByStudentIdAndDriveId(@Param("studentId") String studentId, @Param("driveId") String driveId);

    @Query("SELECT COUNT(r) FROM PlacementResult r WHERE r.drive.id = :driveId AND r.result = :result")
    long countByDriveIdAndResult(@Param("driveId") String driveId, @Param("result") String result);

    long countByResult(String result);
}
