package com.margdarshi.repository;

import com.margdarshi.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, String> {
    @Query("SELECT a FROM Application a WHERE a.student.id = :studentId")
    List<Application> findByStudentId(@Param("studentId") String studentId);

    @Query("SELECT a FROM Application a WHERE a.drive.id = :driveId")
    List<Application> findByDriveId(@Param("driveId") String driveId);

    @Query("SELECT a FROM Application a WHERE a.student.id = :studentId AND a.drive.id = :driveId")
    Optional<Application> findByStudentIdAndDriveId(@Param("studentId") String studentId, @Param("driveId") String driveId);

    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END FROM Application a WHERE a.student.id = :studentId AND a.drive.id = :driveId")
    boolean existsByStudentIdAndDriveId(@Param("studentId") String studentId, @Param("driveId") String driveId);

    @Query("SELECT COUNT(a) FROM Application a WHERE a.drive.id = :driveId")
    long countByDriveId(@Param("driveId") String driveId);
}
