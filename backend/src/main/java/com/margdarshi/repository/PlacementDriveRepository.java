package com.margdarshi.repository;

import com.margdarshi.entity.PlacementDrive;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface PlacementDriveRepository extends JpaRepository<PlacementDrive, String> {
    @Query("SELECT d FROM PlacementDrive d WHERE d.company.id = :companyId")
    List<PlacementDrive> findByCompanyId(@Param("companyId") String companyId);

    List<PlacementDrive> findByStatus(String status);
    long countByStatus(String status);
}
