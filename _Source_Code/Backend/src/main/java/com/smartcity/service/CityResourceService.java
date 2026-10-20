package com.smartcity.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcity.dto.ResourceRequest;
import com.smartcity.dto.ResourceResponse;
import com.smartcity.entity.CityResource;
import com.smartcity.repository.CityResourceRepository;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CityResourceService {
    private static final TypeReference<Map<String, Object>> DATA_TYPE = new TypeReference<>() { };

    private final CityResourceRepository repository;
    private final ObjectMapper objectMapper;

    public CityResourceService(CityResourceRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public List<ResourceResponse> findAll(String type) {
        return repository.findByResourceTypeOrderByCreatedAtDesc(type).stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public ResourceResponse findById(String type, Long id) {
        return repository.findByIdAndResourceType(id, type)
            .map(this::toResponse)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));
    }

    @Transactional
    public ResourceResponse create(String type, ResourceRequest request) {
        CityResource saved = repository.save(new CityResource(type, serialize(request.data())));
        return toResponse(saved);
    }

    @Transactional
    public ResourceResponse update(String type, Long id, ResourceRequest request) {
        CityResource resource = repository.findByIdAndResourceType(id, type)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));
        resource.updatePayload(serialize(request.data()));
        return toResponse(repository.save(resource));
    }

    @Transactional(readOnly = true)
    public long count(String type) {
        return repository.countByResourceType(type);
    }

    @Transactional(readOnly = true)
    public ResourceResponse findLatest(String type) {
        return repository.findFirstByResourceTypeOrderByCreatedAtDesc(type)
            .map(this::toResponse)
            .orElse(null);
    }

    private String serialize(Map<String, Object> data) {
        try {
            return objectMapper.writeValueAsString(data);
        } catch (JsonProcessingException exception) {
            throw new IllegalArgumentException("Resource data could not be serialized", exception);
        }
    }

    private ResourceResponse toResponse(CityResource resource) {
        try {
            return new ResourceResponse(
                resource.getId(),
                resource.getCreatedAt(),
                resource.getUpdatedAt(),
                objectMapper.readValue(resource.getPayload(), DATA_TYPE)
            );
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Stored resource data could not be read", exception);
        }
    }
}
