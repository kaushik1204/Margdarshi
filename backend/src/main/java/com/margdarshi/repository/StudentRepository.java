package com.margdarshi.repository;

import com.margdarshi.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, String> {
    Optional<Student> findByRollNumber(String rollNumber);
    Optional<Student> findByEmail(String email);
    Optional<Student> findByUserId(String userId);
    boolean existsByRollNumber(String rollNumber);
    boolean existsByEmail(String email);
}
