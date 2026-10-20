package com.smartcity.config;

import com.smartcity.entity.OfficerBootstrapLock;
import com.smartcity.repository.OfficerBootstrapLockRepository;
import com.smartcity.repository.UserAccountRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Component;

@Component
public class OfficerBootstrapLockInitializer implements ApplicationRunner {
    private static final long LOCK_ID = 1L;

    private final OfficerBootstrapLockRepository locks;
    private final UserAccountRepository accounts;

    public OfficerBootstrapLockInitializer(
        OfficerBootstrapLockRepository locks,
        UserAccountRepository accounts
    ) {
        this.locks = locks;
        this.accounts = accounts;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!locks.existsById(LOCK_ID)) {
            try {
                locks.saveAndFlush(new OfficerBootstrapLock(LOCK_ID));
            } catch (DataIntegrityViolationException exception) {
                if (!locks.existsById(LOCK_ID)) throw exception;
            }
        }

        OfficerBootstrapLock state = locks.findById(LOCK_ID).orElseThrow(() ->
            new IllegalStateException("Municipal officer bootstrap lock could not be initialized.")
        );
        if (accounts.existsByRole("ADMIN") && !state.isBootstrapCompleted()) {
            state.completeBootstrap();
            locks.saveAndFlush(state);
        }
    }
}
