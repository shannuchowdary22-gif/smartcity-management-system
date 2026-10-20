package com.smartcity.repository;

import com.smartcity.entity.UserAccount;
import java.util.Optional;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAccountRepository extends JpaRepository<UserAccount, UUID> {
    boolean existsByEmail(String email);
    boolean existsByRole(String role);
    Optional<UserAccount> findByEmail(String email);
    @Transactional
    void deleteAllByRole(String role);
}
