package com.smartcity.dto;

import java.time.Instant;
import java.util.Map;

public record DashboardResponse(
    Map<String, Long> totals,
    Map<String, Object> latestTelemetry,
    Instant lastUpdated
) {
}
