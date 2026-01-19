package com.company.core.repository;

import com.company.core.entity.ServiceResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceResourceRepository extends JpaRepository<ServiceResource, Long> {
    List<ServiceResource> findByServiceType(String serviceType);
}
