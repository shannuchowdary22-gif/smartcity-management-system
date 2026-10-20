package com.smartcity.security;

import com.smartcity.dto.AccountProfileResponse;

public record AccountPrincipal(
    String id,
    String name,
    String email,
    String role,
    String department,
    String ward,
    String phone
) {
    public AccountProfileResponse toResponse() {
        return new AccountProfileResponse(id, name, email, role, department, ward, phone);
    }
}
