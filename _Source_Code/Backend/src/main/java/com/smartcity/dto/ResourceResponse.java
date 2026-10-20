package com.smartcity.dto;

import java.time.Instant;
import java.util.Map;

public record ResourceResponse(Long id, Instant createdAt, Instant updatedAt, Map<String, Object> data) {
}
