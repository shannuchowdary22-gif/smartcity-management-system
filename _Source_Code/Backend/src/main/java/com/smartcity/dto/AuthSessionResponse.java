package com.smartcity.dto;

import java.time.Instant;

public record AuthSessionResponse(
    String accessToken,
    Instant expiresAt,
    AccountProfileResponse account
) {
}
