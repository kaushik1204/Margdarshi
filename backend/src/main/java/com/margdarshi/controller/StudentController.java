package com.margdarshi.controller;

import com.margdarshi.dto.AuthDTOs;
import com.margdarshi.entity.Student;
import com.margdarshi.repository.StudentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentRepository studentRepository;

    public StudentController(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @GetMapping
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<List<AuthDTOs.StudentDTO>> getAllStudents() {
        List<AuthDTOs.StudentDTO> list = studentRepository.findAll().stream()
                .map(AuthDTOs.StudentDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuthDTOs.StudentDTO> getStudentById(@PathVariable String id) {
        return studentRepository.findById(id)
                .map(s -> ResponseEntity.ok(AuthDTOs.StudentDTO.fromEntity(s)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<AuthDTOs.StudentDTO> updateStudent(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return studentRepository.findById(id).map(student -> {
            if (body.containsKey("name") && body.get("name") != null) {
                student.setName(String.valueOf(body.get("name")));
            }
            if (body.containsKey("branch") && body.get("branch") != null) {
                student.setBranch(String.valueOf(body.get("branch")));
            }
            if (body.containsKey("cgpa") && body.get("cgpa") != null) {
                student.setCgpa(new BigDecimal(String.valueOf(body.get("cgpa"))));
            }
            if (body.containsKey("backlogs") && body.get("backlogs") != null) {
                student.setBacklogs(Integer.valueOf(String.valueOf(body.get("backlogs"))));
            }
            if (body.containsKey("tenthPercentage") && body.get("tenthPercentage") != null) {
                student.setTenthPercentage(new BigDecimal(String.valueOf(body.get("tenthPercentage"))));
            }
            if (body.containsKey("twelfthPercentage") && body.get("twelfthPercentage") != null) {
                student.setTwelfthPercentage(new BigDecimal(String.valueOf(body.get("twelfthPercentage"))));
            }
            if (body.containsKey("graduationYear") && body.get("graduationYear") != null) {
                student.setGraduationYear(Integer.valueOf(String.valueOf(body.get("graduationYear"))));
            }
            if (body.containsKey("phone") && body.get("phone") != null) {
                student.setPhone(String.valueOf(body.get("phone")));
            }
            if (body.containsKey("resumePath") && body.get("resumePath") != null) {
                student.setResumePath(String.valueOf(body.get("resumePath")));
            }
            if (body.containsKey("skills") && body.get("skills") != null) {
                Object sk = body.get("skills");
                if (sk instanceof List) {
                    List<?> list = (List<?>) sk;
                    student.setSkills(list.stream().map(Object::toString).collect(Collectors.joining(",")));
                } else {
                    student.setSkills(sk.toString());
                }
            }
            Student saved = studentRepository.save(student);
            return ResponseEntity.ok(AuthDTOs.StudentDTO.fromEntity(saved));
        }).orElse(ResponseEntity.notFound().build());
    }
}
