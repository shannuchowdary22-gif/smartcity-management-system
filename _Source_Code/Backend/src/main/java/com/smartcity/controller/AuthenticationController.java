package com.smartcity.controller;

import com.smartcity.dto.AuthSessionResponse;
import com.smartcity.dto.CitizenRegistrationRequest;
import com.smartcity.dto.LoginRequest;
import com.smartcity.dto.OfficerBootstrapStatusResponse;
import com.smartcity.dto.OfficerRegistrationRequest;
import com.smartcity.dto.OfficerRegistrationResponse;
import com.smartcity.security.AccountPrincipal;
import com.smartcity.service.AuthenticationService;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthenticationController {
    private final AuthenticationService authentication;

    public AuthenticationController(AuthenticationService authentication) {
        this.authentication = authentication;
    }

    @PostMapping("/citizens")
    public ResponseEntity<AuthSessionResponse> registerCitizen(
        @Valid @RequestBody CitizenRegistrationRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authentication.registerCitizen(request));
    }

    @PostMapping("/officers")
    public ResponseEntity<OfficerRegistrationResponse> registerOfficer(
        @Valid @RequestBody OfficerRegistrationRequest request,
        @AuthenticationPrincipal AccountPrincipal principal,
        HttpServletRequest servletRequest
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(new OfficerRegistrationResponse(
            authentication.registerOfficer(request, principal, servletRequest.getRemoteAddr())
        ));
    }

    @GetMapping("/officers/bootstrap-status")
    public OfficerBootstrapStatusResponse getOfficerBootstrapStatus(HttpServletRequest servletRequest) {
        return authentication.getOfficerBootstrapStatus(servletRequest.getRemoteAddr());
    }

    @PostMapping("/citizen-session")
    public AuthSessionResponse loginCitizen(@Valid @RequestBody LoginRequest request) {
        return authentication.login(request, "CITIZEN");
    }

    @PostMapping("/admin-session")
    public AuthSessionResponse loginAdmin(@Valid @RequestBody LoginRequest request) {
        return authentication.login(request, "ADMIN");
    }

    @GetMapping("/session")
    public AuthSessionResponse validateSession(
        @RequestHeader(name = "Authorization", required = false) String authorization
    ) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "A valid account session is required.");
        }
        AuthSessionResponse session = authentication.describeSession(
            authorization.substring("Bearer ".length()).trim()
        );
        if (session == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Your account session has expired.");
        return session;
    }

    @GetMapping("/admin-session")
    public AuthSessionResponse validateAdminSession(
        @AuthenticationPrincipal AccountPrincipal principal,
        @RequestHeader(name = "Authorization", required = false) String authorization
    ) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "A valid account session is required.");
        }
        if (!"ADMIN".equals(principal.role())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "A municipal administrator session is required.");
        }
        return validateSession(authorization);
    }

    @DeleteMapping({"/session", "/admin-session"})
    public ResponseEntity<Void> revokeSession(
        @RequestHeader(name = "Authorization", required = false) String authorization
    ) {
        if (authorization != null && authorization.startsWith("Bearer ")) {
            authentication.revoke(authorization.substring("Bearer ".length()).trim());
        }
        return ResponseEntity.noContent().build();
    }
}
