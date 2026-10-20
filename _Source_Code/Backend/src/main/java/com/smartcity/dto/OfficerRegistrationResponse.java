package com.smartcity.dto;

import java.time.Instant;

public record OfficerRegistrationResponse(
    String message,
    String accessToken,
    Instant expiresAt,
    AccountProfileResponse account
) {
    public OfficerRegistrationResponse(AuthSessionResponse session) {
        this("Officer commissioned.", session.accessToken(), session.expiresAt(), session.account());
    }
}
