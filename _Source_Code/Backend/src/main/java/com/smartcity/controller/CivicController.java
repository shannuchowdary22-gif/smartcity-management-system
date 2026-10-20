package com.smartcity.controller;

import com.smartcity.dto.ResourceRequest;
import com.smartcity.dto.ResourceResponse;
import com.smartcity.service.CityResourceService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/api")
public class CivicController {
    private final CityResourceService resources;

    public CivicController(CityResourceService resources) {
        this.resources = resources;
    }

    @GetMapping("/emergencies")
    public List<ResourceResponse> getEmergencies() {
        return resources.findAll("emergency");
    }

    @PostMapping("/emergencies")
    public ResponseEntity<ResourceResponse> createEmergency(@Valid @RequestBody ResourceRequest request) {
        ResourceResponse response = resources.create("emergency", request);
        return ResponseEntity.created(
            UriComponentsBuilder.fromPath("/api/emergencies/{id}").buildAndExpand(response.id()).toUri()
        ).body(response);
    }

    @PutMapping("/emergencies/{id}")
    public ResourceResponse updateEmergency(
        @PathVariable Long id,
        @Valid @RequestBody ResourceRequest request
    ) {
        return resources.update("emergency", id, request);
    }

    @GetMapping("/grievances")
    public List<ResourceResponse> getGrievances() {
        return resources.findAll("grievance");
    }

    @GetMapping("/grievances/{id}")
    public ResourceResponse getGrievance(@PathVariable Long id) {
        return resources.findById("grievance", id);
    }

    @PostMapping("/grievances")
    public ResponseEntity<ResourceResponse> createGrievance(
        @Valid @RequestBody ResourceRequest request
    ) {
        ResourceResponse response = resources.create("grievance", request);
        return ResponseEntity.created(
            UriComponentsBuilder.fromPath("/api/grievances/{id}").buildAndExpand(response.id()).toUri()
        ).body(response);
    }

    @PutMapping("/grievances/{id}")
    public ResourceResponse updateGrievance(
        @PathVariable Long id,
        @Valid @RequestBody ResourceRequest request
    ) {
        return resources.update("grievance", id, request);
    }

    @GetMapping("/sensors")
    public List<ResourceResponse> getSensors() {
        return resources.findAll("sensor");
    }

    @GetMapping("/sensors/{id}")
    public ResourceResponse getSensor(@PathVariable Long id) {
        return resources.findById("sensor", id);
    }

    @PostMapping("/sensors")
    public ResponseEntity<ResourceResponse> createSensor(@Valid @RequestBody ResourceRequest request) {
        ResourceResponse response = resources.create("sensor", request);
        return ResponseEntity.created(
            UriComponentsBuilder.fromPath("/api/sensors/{id}").buildAndExpand(response.id()).toUri()
        ).body(response);
    }

    @PutMapping("/sensors/{id}")
    public ResourceResponse updateSensor(
        @PathVariable Long id,
        @Valid @RequestBody ResourceRequest request
    ) {
        return resources.update("sensor", id, request);
    }

    @GetMapping("/buildings")
    public List<ResourceResponse> getBuildings() {
        return resources.findAll("building");
    }
}
