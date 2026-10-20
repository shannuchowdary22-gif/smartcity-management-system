package com.smartcity.controller;

import com.smartcity.dto.ResourceRequest;
import com.smartcity.dto.ResourceResponse;
import com.smartcity.service.CityResourceService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/api")
public class TelemetryController {
    private final CityResourceService resources;

    public TelemetryController(CityResourceService resources) {
        this.resources = resources;
    }

    @GetMapping("/traffic")
    public List<ResourceResponse> getTraffic() {
        return resources.findAll("traffic");
    }

    @PostMapping("/traffic")
    public ResponseEntity<ResourceResponse> createTraffic(@Valid @RequestBody ResourceRequest request) {
        return created("traffic", resources.create("traffic", request));
    }

    @GetMapping("/waste")
    public List<ResourceResponse> getWaste() {
        return resources.findAll("waste");
    }

    @PostMapping("/waste")
    public ResponseEntity<ResourceResponse> createWaste(@Valid @RequestBody ResourceRequest request) {
        return created("waste", resources.create("waste", request));
    }

    @GetMapping("/water")
    public List<ResourceResponse> getWater() {
        return resources.findAll("water");
    }

    @PostMapping("/water")
    public ResponseEntity<ResourceResponse> createWater(@Valid @RequestBody ResourceRequest request) {
        return created("water", resources.create("water", request));
    }

    @GetMapping("/pollution")
    public List<ResourceResponse> getPollution() {
        return resources.findAll("pollution");
    }

    @PostMapping("/pollution")
    public ResponseEntity<ResourceResponse> createPollution(@Valid @RequestBody ResourceRequest request) {
        return created("pollution", resources.create("pollution", request));
    }

    @GetMapping("/iot")
    public List<ResourceResponse> getIot() {
        return resources.findAll("iot");
    }

    @PostMapping("/iot")
    public ResponseEntity<ResourceResponse> createIot(@Valid @RequestBody ResourceRequest request) {
        return created("iot", resources.create("iot", request));
    }

    private ResponseEntity<ResourceResponse> created(String path, ResourceResponse response) {
        return ResponseEntity.created(
            UriComponentsBuilder.fromPath("/api/{path}/{id}")
                .buildAndExpand(path, response.id())
                .toUri()
        ).body(response);
    }
}
