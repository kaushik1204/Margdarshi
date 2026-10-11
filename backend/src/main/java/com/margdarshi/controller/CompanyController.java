package com.margdarshi.controller;

import com.margdarshi.entity.Company;
import com.margdarshi.repository.CompanyRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyRepository companyRepository;

    public CompanyController(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    @GetMapping
    public ResponseEntity<List<Company>> getAllCompanies() {
        return ResponseEntity.ok(companyRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Company> getCompanyById(@PathVariable String id) {
        return companyRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<Company> createCompany(@Valid @RequestBody Company company) {
        if (company.getId() == null || company.getId().isBlank()) {
            company.setId(company.getName().toLowerCase().replaceAll("[^a-z0-9]", "-").substring(0, Math.min(20, company.getName().length())));
        }
        Optional<Company> existing = companyRepository.findById(company.getId());
        if (existing.isPresent()) {
            return ResponseEntity.ok(existing.get());
        }
        Company saved = companyRepository.save(company);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
