package com.smartcity.repository;

import com.smartcity.entity.CityResource;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CityResourceRepository extends JpaRepository<CityResource, Long> {
    List<CityResource> findByResourceTypeOrderByCreatedAtDesc(String resourceType);

    Optional<CityResource> findFirstByResourceTypeOrderByCreatedAtDesc(String resourceType);

    Optional<CityResource> findByIdAndResourceType(Long id, String resourceType);

    long countByResourceType(String resourceType);
}
