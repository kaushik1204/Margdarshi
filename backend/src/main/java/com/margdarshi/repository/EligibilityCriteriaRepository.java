package com.margdarshi.repository;

import com.margdarshi.entity.EligibilityCriteria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface EligibilityCriteriaRepository extends JpaRepository<EligibilityCriteria, String> {
    @Query("SELECT ec FROM EligibilityCriteria ec WHERE ec.drive.id = :driveId")
    Optional<EligibilityCriteria> findByDriveId(@Param("driveId") String driveId);
}
