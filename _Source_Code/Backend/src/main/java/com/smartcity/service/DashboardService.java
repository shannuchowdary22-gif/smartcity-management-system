package com.smartcity.service;

import com.smartcity.dto.DashboardResponse;
import com.smartcity.dto.ResourceResponse;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {
    private final CityResourceService resources;

    public DashboardService(CityResourceService resources) {
        this.resources = resources;
    }

    public DashboardResponse getDashboard() {
        Map<String, Long> totals = new LinkedHashMap<>();
        totals.put("traffic", resources.count("traffic"));
        totals.put("waste", resources.count("waste"));
        totals.put("water", resources.count("water"));
        totals.put("pollution", resources.count("pollution"));
        totals.put("emergencies", resources.count("emergency"));
        totals.put("grievances", resources.count("grievance"));
        totals.put("sensors", resources.count("sensor"));
        totals.put("buildings", resources.count("building"));
        totals.put("iot", resources.count("iot"));

        ResourceResponse latestIot = resources.findLatest("iot");
        ResourceResponse latestTraffic = resources.findLatest("traffic");
        ResourceResponse latestWaste = resources.findLatest("waste");
        ResourceResponse latestWater = resources.findLatest("water");
        ResourceResponse latestPollution = resources.findLatest("pollution");
        Map<String, Object> latestTelemetry = new LinkedHashMap<>();
        addData(latestTelemetry, latestTraffic);
        addData(latestTelemetry, latestWaste);
        addData(latestTelemetry, latestWater);
        addData(latestTelemetry, latestPollution);
        addData(latestTelemetry, latestIot);
        Instant lastUpdated = latestIot == null ? null : latestIot.updatedAt();
        return new DashboardResponse(totals, latestTelemetry, lastUpdated);
    }

    private void addData(Map<String, Object> telemetry, ResourceResponse resource) {
        if (resource != null) {
            telemetry.putAll(resource.data());
        }
    }
}
