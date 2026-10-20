package com.smartcity.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.Map;

public record ResourceRequest(
    @NotNull @NotEmpty Map<String, Object> data
) {
}
