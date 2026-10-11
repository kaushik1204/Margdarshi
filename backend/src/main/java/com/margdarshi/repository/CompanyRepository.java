package com.margdarshi.repository;

import com.margdarshi.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
public interface CompanyRepository extends JpaRepository<Company, String> {
}
