package com.margdarshi;

import com.margdarshi.entity.*;
import com.margdarshi.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final CompanyRepository companyRepository;
    private final PlacementDriveRepository driveRepository;
    private final EligibilityCriteriaRepository criteriaRepository;
    private final RecruitmentStageRepository stageRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            StudentRepository studentRepository,
            CompanyRepository companyRepository,
            PlacementDriveRepository driveRepository,
            EligibilityCriteriaRepository criteriaRepository,
            RecruitmentStageRepository stageRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.companyRepository = companyRepository;
        this.driveRepository = driveRepository;
        this.criteriaRepository = criteriaRepository;
        this.stageRepository = stageRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // 1. Seed / Synchronize Placement Coordinator Account
        User coordinator = userRepository.findByEmail("coordinator@anurag.edu.in").orElse(null);
        if (coordinator == null) {
            coordinator = new User(
                    "coord-admin",
                    "coordinator@anurag.edu.in",
                    passwordEncoder.encode("Coordinator@2025"),
                    "Prof. R. Krishna",
                    "COORDINATOR",
                    null
            );
        } else {
            coordinator.setPasswordHash(passwordEncoder.encode("Coordinator@2025"));
        }
        userRepository.save(coordinator);

        // 2. Seed / Synchronize Default Enrolled Student Account (Kaushik Rekha - 24EG107B47)
        String roll = "24EG107B47";
        User studentUser = userRepository.findByEmail("kaushik@anurag.edu.in")
                .or(() -> userRepository.findByRollNumber(roll))
                .orElseGet(() -> userRepository.save(new User(
                        "std-24eg107b47",
                        "kaushik@anurag.edu.in",
                        passwordEncoder.encode("123123123"),
                        "Kaushik Rekha",
                        "STUDENT",
                        roll
                )));

        Student student = studentRepository.findByRollNumber(roll)
                .or(() -> studentRepository.findByUserId(studentUser.getId()))
                .or(() -> studentRepository.findByEmail("kaushik@anurag.edu.in"))
                .orElse(null);

        if (student == null) {
            student = new Student();
            student.setId("std-24eg107b47");
            student.setUser(studentUser);
            student.setRollNumber(roll);
            student.setName("Kaushik Rekha");
            student.setBranch("CSE");
            student.setCgpa(new BigDecimal("8.85"));
            student.setBacklogs(0);
            student.setTenthPercentage(new BigDecimal("91.0"));
            student.setTwelfthPercentage(new BigDecimal("88.5"));
            student.setGraduationYear(2028);
            student.setEmail("kaushik@anurag.edu.in");
            student.setPhone("+91 98765 43210");
            student.setSkills("Java,Python,React,Spring Boot,MySQL,Data Structures & Algorithms");
            student.setResumePath("resumes/24EG107B47_Kaushik_Resume.pdf");
            studentRepository.save(student);
        }

        // 3. Seed Initial Companies & Drives if empty
        if (companyRepository.count() == 0) {
            Company google = new Company();
            google.setId("comp-google");
            google.setName("Google India");
            google.setLogoLetter("G");
            google.setLogoColorClass("bg-blue-600");
            google.setIndustry("Technology & Cloud");
            google.setLocations("Hyderabad, Bengaluru");
            google.setTier("tier-1");
            google.setTierLabel("Tier 1 Super Dream");
            google.setStatus("Active");
            google.setDrivesRecordLabel("1 Active Drive");
            google.setTotalHiredCount(14);
            companyRepository.save(google);

            Company msft = new Company();
            msft.setId("comp-microsoft");
            msft.setName("Microsoft Corporation");
            msft.setLogoLetter("M");
            msft.setLogoColorClass("bg-emerald-600");
            msft.setIndustry("Cloud & Enterprise");
            msft.setLocations("Hyderabad, Bengaluru");
            msft.setTier("tier-1");
            msft.setTierLabel("Tier 1 Super Dream");
            msft.setStatus("Active");
            msft.setDrivesRecordLabel("1 Active Drive");
            msft.setTotalHiredCount(18);
            companyRepository.save(msft);

            Company amazon = new Company();
            amazon.setId("comp-amazon");
            amazon.setName("Amazon Web Services");
            amazon.setLogoLetter("A");
            amazon.setLogoColorClass("bg-amber-600");
            amazon.setIndustry("E-Commerce & Cloud Infrastructure");
            amazon.setLocations("Hyderabad, Chennai");
            amazon.setTier("tier-1");
            amazon.setTierLabel("Tier 1 Super Dream");
            amazon.setStatus("Active");
            amazon.setDrivesRecordLabel("1 Active Drive");
            amazon.setTotalHiredCount(22);
            companyRepository.save(amazon);

            // Drive 1: Google SDE
            PlacementDrive d1 = new PlacementDrive();
            d1.setId("drive-google-sde");
            d1.setCompany(google);
            d1.setCompanyName("Google India");
            d1.setRoleTitle("Software Development Engineer");
            d1.setJobType("Full Time");
            d1.setCtc("₹32.0 LPA");
            d1.setRawCtcNumber(new BigDecimal("32.0"));
            d1.setTier("tier-1");
            d1.setLocation("Hyderabad");
            d1.setDeadline("2026-11-30");
            d1.setStatus("Active");
            d1.setCurrentStage("Online Coding Assessment");
            d1.setCurrentStageStatus("normal");
            driveRepository.save(d1);

            EligibilityCriteria c1 = new EligibilityCriteria();
            c1.setId("crit-google-sde");
            c1.setDrive(d1);
            c1.setMinCgpa(new BigDecimal("8.0"));
            c1.setAllowedBranches("CSE,IT");
            c1.setMaxBacklogs(0);
            c1.setGraduationYear(2028);
            c1.setMin10thPercentage(new BigDecimal("75.0"));
            c1.setMin12thPercentage(new BigDecimal("75.0"));
            criteriaRepository.save(c1);

            RecruitmentStage s1_1 = new RecruitmentStage();
            s1_1.setId("stage-g-1");
            s1_1.setDrive(d1);
            s1_1.setName("Online Coding Assessment");
            s1_1.setStageOrder(1);
            s1_1.setStageDate("2026-11-20");
            s1_1.setPlatform("HackerRank");
            stageRepository.save(s1_1);

            RecruitmentStage s1_2 = new RecruitmentStage();
            s1_2.setId("stage-g-2");
            s1_2.setDrive(d1);
            s1_2.setName("Technical Problem Solving");
            s1_2.setStageOrder(2);
            s1_2.setStageDate("2026-11-25");
            s1_2.setPlatform("Google Meet");
            stageRepository.save(s1_2);

            RecruitmentStage s1_3 = new RecruitmentStage();
            s1_3.setId("stage-g-3");
            s1_3.setDrive(d1);
            s1_3.setName("Googleyness & Leadership");
            s1_3.setStageOrder(3);
            s1_3.setStageDate("2026-11-28");
            s1_3.setPlatform("Google Meet");
            stageRepository.save(s1_3);

            // Drive 2: Microsoft Cloud Architect
            PlacementDrive d2 = new PlacementDrive();
            d2.setId("drive-msft-cloud");
            d2.setCompany(msft);
            d2.setCompanyName("Microsoft Corporation");
            d2.setRoleTitle("Cloud Solutions Architect");
            d2.setJobType("Full Time");
            d2.setCtc("₹28.5 LPA");
            d2.setRawCtcNumber(new BigDecimal("28.5"));
            d2.setTier("tier-1");
            d2.setLocation("Bengaluru");
            d2.setDeadline("2026-12-15");
            d2.setStatus("Active");
            d2.setCurrentStage("Online Evaluation");
            d2.setCurrentStageStatus("normal");
            driveRepository.save(d2);

            EligibilityCriteria c2 = new EligibilityCriteria();
            c2.setId("crit-msft-cloud");
            c2.setDrive(d2);
            c2.setMinCgpa(new BigDecimal("7.5"));
            c2.setAllowedBranches("CSE,IT,ECE");
            c2.setMaxBacklogs(1);
            c2.setGraduationYear(2028);
            c2.setMin10thPercentage(new BigDecimal("70.0"));
            c2.setMin12thPercentage(new BigDecimal("70.0"));
            criteriaRepository.save(c2);

            RecruitmentStage s2_1 = new RecruitmentStage();
            s2_1.setId("stage-m-1");
            s2_1.setDrive(d2);
            s2_1.setName("Online Evaluation");
            s2_1.setStageOrder(1);
            s2_1.setStageDate("2026-12-01");
            s2_1.setPlatform("Codility");
            stageRepository.save(s2_1);

            RecruitmentStage s2_2 = new RecruitmentStage();
            s2_2.setId("stage-m-2");
            s2_2.setDrive(d2);
            s2_2.setName("System Architecture & Design");
            s2_2.setStageOrder(2);
            s2_2.setStageDate("2026-12-05");
            s2_2.setPlatform("Microsoft Teams");
            stageRepository.save(s2_2);
        }
    }
}
