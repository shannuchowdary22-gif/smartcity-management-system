package com.smartcity.repository;

import com.smartcity.entity.OfficerBootstrapLock;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

public interface OfficerBootstrapLockRepository extends JpaRepository<OfficerBootstrapLock, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select state from OfficerBootstrapLock state where state.id = :id")
    Optional<OfficerBootstrapLock> findByIdForUpdate(@Param("id") long id);
}
