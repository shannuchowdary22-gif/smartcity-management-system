package com.smartcity.service;

import com.smartcity.dto.AuthSessionResponse;
import com.smartcity.dto.CitizenRegistrationRequest;
import com.smartcity.dto.LoginRequest;
import com.smartcity.dto.OfficerBootstrapStatusResponse;
import com.smartcity.dto.OfficerRegistrationRequest;
import com.smartcity.entity.UserAccount;
import com.smartcity.repository.OfficerBootstrapLockRepository;
import com.smartcity.repository.UserAccountRepository;
import com.smartcity.security.AccountPrincipal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.net.InetAddress;
import java.net.UnknownHostException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthenticationService {
    private static final long SESSION_LIFETIME_SECONDS = 8 * 60 * 60;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserAccountRepository accounts;
    private final OfficerBootstrapLockRepository bootstrapLocks;
    private final PasswordEncoder passwordEncoder;
    private final boolean bootstrapEnabled;
    private final String municipalClearanceCode;
    private final Map<String, StoredSession> activeSessions = new ConcurrentHashMap<>();

    public AuthenticationService(
        UserAccountRepository accounts,
        OfficerBootstrapLockRepository bootstrapLocks,
        PasswordEncoder passwordEncoder,
        @Value("${app.municipal.bootstrap-enabled:false}") boolean bootstrapEnabled,
        @Value("${app.municipal.clearance-code:}") String municipalClearanceCode
    ) {
        this.accounts = accounts;
        this.bootstrapLocks = bootstrapLocks;
        this.passwordEncoder = passwordEncoder;
        this.bootstrapEnabled = bootstrapEnabled;
        this.municipalClearanceCode = municipalClearanceCode;
    }

    @Transactional
    public AuthSessionResponse registerCitizen(CitizenRegistrationRequest request) {
        String email = normalizeEmail(request.email());
        rejectExistingEmail(email);
        validatePasswordBytes(request.password());
        UserAccount account = accounts.save(new UserAccount(
            request.name().trim(),
            email,
            passwordEncoder.encode(request.password()),
            "CITIZEN",
            null,
            request.ward().trim(),
            blankToNull(request.phone())
        ));
        return issueSession(account);
    }

    @Transactional
    public AuthSessionResponse registerOfficer(
        OfficerRegistrationRequest request,
        AccountPrincipal commissionedBy,
        String remoteAddress
    ) {
        var bootstrapLock = bootstrapLocks.findByIdForUpdate(1L).orElseThrow(() ->
            new IllegalStateException("Municipal officer bootstrap lock has not been initialized.")
        );
        boolean administratorExists = accounts.existsByRole("ADMIN");
        if (administratorExists) bootstrapLock.completeBootstrap();

        if (bootstrapLock.isBootstrapCompleted() || administratorExists) {
            if (!administratorExists) {
                throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "First-officer commissioning has already been completed."
                );
            }
            if (commissionedBy == null) {
                throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "An authenticated municipal administrator must commission additional officers."
                );
            }
            if (!"ADMIN".equals(commissionedBy.role())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only municipal administrators may commission officers.");
            }
        } else {
            if (!bootstrapEnabled || municipalClearanceCode.isBlank() || !isLoopbackAddress(remoteAddress)) {
                throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "First-officer commissioning is unavailable from this connection."
                );
            }
            if (!matchesClearanceCode(request.clearanceCode())) {
                throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "The municipal clearance code is invalid."
                );
            }
            bootstrapLock.completeBootstrap();
        }

        String email = normalizeEmail(request.email());
        rejectExistingEmail(email);
        validatePasswordBytes(request.password());
        UserAccount account = accounts.save(new UserAccount(
            request.name().trim(),
            email,
            passwordEncoder.encode(request.password()),
            "ADMIN",
            request.department().trim(),
            null,
            null
        ));
        return issueSession(account);
    }

    @Transactional(readOnly = true)
    public OfficerBootstrapStatusResponse getOfficerBootstrapStatus(String remoteAddress) {
        String status;
        var bootstrapLock = bootstrapLocks.findById(1L).orElseThrow(() ->
            new IllegalStateException("Municipal officer bootstrap lock has not been initialized.")
        );
        if (bootstrapLock.isBootstrapCompleted() || accounts.existsByRole("ADMIN")) {
            status = "COMPLETED";
        } else if (bootstrapEnabled && !municipalClearanceCode.isBlank() && isLoopbackAddress(remoteAddress)) {
            status = "AVAILABLE";
        } else {
            status = "UNAVAILABLE";
        }
        return new OfficerBootstrapStatusResponse(status);
    }

    @Transactional
    public AuthSessionResponse login(LoginRequest request, String expectedRole) {
        String email = normalizeEmail(request.email());
        UserAccount account = accounts.findByEmail(email).orElse(null);
        if (account == null || !expectedRole.equals(account.getRole()) ||
            !passwordEncoder.matches(request.password(), account.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password for the selected portal.");
        }
        return issueSession(account);
    }

    public AccountPrincipal authenticate(String token) {
        AuthSessionResponse session = describeSession(token);
        if (session == null) return null;
        return new AccountPrincipal(
            session.account().id(),
            session.account().name(),
            session.account().email(),
            session.account().role(),
            session.account().department(),
            session.account().ward(),
            session.account().phone()
        );
    }

    public AuthSessionResponse describeSession(String token) {
        if (token == null || token.isBlank()) return null;
        String tokenHash = hash(token);
        StoredSession session = activeSessions.get(tokenHash);
        if (session == null) return null;
        if (!session.expiresAt().isAfter(Instant.now())) {
            activeSessions.remove(tokenHash, session);
            return null;
        }
        return new AuthSessionResponse(token, session.expiresAt(), session.principal().toResponse());
    }

    public void revoke(String token) {
        if (token != null && !token.isBlank()) activeSessions.remove(hash(token));
    }

    private AuthSessionResponse issueSession(UserAccount account) {
        byte[] tokenBytes = new byte[32];
        SECURE_RANDOM.nextBytes(tokenBytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
        Instant expiresAt = Instant.now().plusSeconds(SESSION_LIFETIME_SECONDS);
        AccountPrincipal principal = principalFor(account);
        activeSessions.put(hash(token), new StoredSession(principal, expiresAt));
        return new AuthSessionResponse(token, expiresAt, principal.toResponse());
    }

    private AccountPrincipal principalFor(UserAccount account) {
        return new AccountPrincipal(
            account.getId().toString(),
            account.getName(),
            account.getEmail(),
            account.getRole(),
            account.getDepartment(),
            account.getWard(),
            account.getPhone()
        );
    }

    private boolean isLoopbackAddress(String remoteAddress) {
        try {
            return remoteAddress != null && InetAddress.getByName(remoteAddress).isLoopbackAddress();
        } catch (UnknownHostException exception) {
            return false;
        }
    }

    private boolean matchesClearanceCode(String providedCode) {
        if (providedCode == null || municipalClearanceCode.isBlank()) return false;
        return MessageDigest.isEqual(
            hash(municipalClearanceCode).getBytes(StandardCharsets.US_ASCII),
            hash(providedCode).getBytes(StandardCharsets.US_ASCII)
        );
    }

    private void rejectExistingEmail(String email) {
        if (accounts.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists.");
        }
    }

    private void validatePasswordBytes(String password) {
        if (password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be no more than 72 UTF-8 bytes.");
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(java.util.Locale.ROOT);
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String hash(String token) {
        try {
            return Base64.getEncoder().encodeToString(
                MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8))
            );
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    private record StoredSession(AccountPrincipal principal, Instant expiresAt) {
    }
}
