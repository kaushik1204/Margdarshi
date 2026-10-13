package com.margdarshi.controller;

import com.margdarshi.dto.AuthDTOs;
import com.margdarshi.entity.Student;
import com.margdarshi.entity.User;
import com.margdarshi.repository.StudentRepository;
import com.margdarshi.repository.UserRepository;
import com.margdarshi.security.JwtTokenProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;

    public StudentController(
            StudentRepository studentRepository,
            UserRepository userRepository,
            JwtTokenProvider tokenProvider) {
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.tokenProvider = tokenProvider;
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
                .or(() -> studentRepository.findByRollNumber(id))
                .or(() -> studentRepository.findByUserId(id))
                .map(s -> ResponseEntity.ok(AuthDTOs.StudentDTO.fromEntity(s)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateStudent(
            @PathVariable String id,
            @RequestBody Map<String, Object> body,
            Authentication auth) {

        Optional<Student> studentOpt = studentRepository.findById(id);
        if (studentOpt.isEmpty()) {
            studentOpt = studentRepository.findByRollNumber(id);
        }
        if (studentOpt.isEmpty()) {
            studentOpt = studentRepository.findByUserId(id);
        }
        if (studentOpt.isEmpty() && auth != null && auth.getName() != null) {
            String email = auth.getName();
            User authUser = userRepository.findByEmail(email).orElse(null);
            if (authUser != null) {
                studentOpt = studentRepository.findByUserId(authUser.getId());
            }
        }

        if (studentOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Student student = studentOpt.get();

        // 1. Name
        if (body.containsKey("name") && body.get("name") != null) {
            String name = String.valueOf(body.get("name")).trim();
            student.setName(name);
            if (student.getUser() != null) {
                student.getUser().setName(name);
            }
        }

        // 2. University Roll Number
        if (body.containsKey("rollNumber") && body.get("rollNumber") != null) {
            String roll = String.valueOf(body.get("rollNumber")).trim().toUpperCase();
            if (!roll.equalsIgnoreCase(student.getRollNumber()) && studentRepository.existsByRollNumber(roll)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Roll number " + roll + " is already registered to another student profile."
                ));
            }
            student.setRollNumber(roll);
            if (student.getUser() != null) {
                student.getUser().setRollNumber(roll);
            }
        }

        // 3. Email Address
        if (body.containsKey("email") && body.get("email") != null) {
            String email = String.valueOf(body.get("email")).trim().toLowerCase();
            if (!email.equalsIgnoreCase(student.getEmail()) && userRepository.existsByEmail(email)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Email " + email + " is already associated with another account."
                ));
            }
            student.setEmail(email);
            if (student.getUser() != null) {
                student.getUser().setEmail(email);
            }
        }

        // 4. Branch
        if (body.containsKey("branch") && body.get("branch") != null) {
            student.setBranch(String.valueOf(body.get("branch")).trim().toUpperCase());
        }

        // 5. CGPA
        if (body.containsKey("cgpa") && body.get("cgpa") != null) {
            student.setCgpa(new BigDecimal(String.valueOf(body.get("cgpa"))));
        }

        // 6. Active Backlogs
        if (body.containsKey("backlogs") && body.get("backlogs") != null) {
            student.setBacklogs(Integer.valueOf(String.valueOf(body.get("backlogs"))));
        }

        // 7. 10th Board Percentage
        if (body.containsKey("tenthPercentage") && body.get("tenthPercentage") != null) {
            student.setTenthPercentage(new BigDecimal(String.valueOf(body.get("tenthPercentage"))));
        }

        // 8. 12th Board Percentage
        if (body.containsKey("twelfthPercentage") && body.get("twelfthPercentage") != null) {
            student.setTwelfthPercentage(new BigDecimal(String.valueOf(body.get("twelfthPercentage"))));
        }

        // 9. Graduation Year
        if (body.containsKey("graduationYear") && body.get("graduationYear") != null) {
            student.setGraduationYear(Integer.valueOf(String.valueOf(body.get("graduationYear"))));
        }

        // 10. Phone Contact
        if (body.containsKey("phone") && body.get("phone") != null) {
            student.setPhone(String.valueOf(body.get("phone")).trim());
        }

        // 11. Resume Path
        if (body.containsKey("resumePath") && body.get("resumePath") != null) {
            student.setResumePath(String.valueOf(body.get("resumePath")).trim());
        }

        // 12. Technical Proficiencies / Skills
        if (body.containsKey("skills") && body.get("skills") != null) {
            Object sk = body.get("skills");
            if (sk instanceof List) {
                List<?> list = (List<?>) sk;
                student.setSkills(list.stream().map(Object::toString).collect(Collectors.joining(",")));
            } else {
                student.setSkills(sk.toString());
            }
        }

        // Persist User entity if attached
        if (student.getUser() != null) {
            userRepository.save(student.getUser());
        }
        Student saved = studentRepository.save(student);

        // Generate refreshed token so authentication remains seamless with new email/roll
        String newToken = null;
        if (student.getUser() != null) {
            User u = student.getUser();
            newToken = tokenProvider.generateToken(u.getId(), u.getEmail(), u.getRole(), u.getRollNumber());
        }

        AuthDTOs.StudentDTO studentDTO = AuthDTOs.StudentDTO.fromEntity(saved);
        AuthDTOs.UserDTO userDTO = student.getUser() != null
                ? new AuthDTOs.UserDTO(
                        student.getUser().getId(),
                        student.getUser().getEmail(),
                        student.getUser().getName(),
                        student.getUser().getRole(),
                        student.getUser().getRollNumber()
                )
                : null;

        Map<String, Object> resp = new HashMap<>();
        resp.put("student", studentDTO);
        resp.put("user", userDTO);
        if (newToken != null) {
            resp.put("token", newToken);
        }

        // Top-level direct fields for backwards compatibility
        resp.put("id", studentDTO.getId());
        resp.put("rollNumber", studentDTO.getRollNumber());
        resp.put("name", studentDTO.getName());
        resp.put("branch", studentDTO.getBranch());
        resp.put("cgpa", studentDTO.getCgpa());
        resp.put("backlogs", studentDTO.getBacklogs());
        resp.put("tenthPercentage", studentDTO.getTenthPercentage());
        resp.put("twelfthPercentage", studentDTO.getTwelfthPercentage());
        resp.put("graduationYear", studentDTO.getGraduationYear());
        resp.put("skills", studentDTO.getSkills());
        resp.put("resumePath", studentDTO.getResumePath());
        resp.put("email", studentDTO.getEmail());
        resp.put("phone", studentDTO.getPhone());

        return ResponseEntity.ok(resp);
    }
}
