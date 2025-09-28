package com.mvp.backend.feature.users.repository;

import com.mvp.backend.feature.users.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
    update User u
       set u.password = :password,
           u.mustChangePassword = false,
           u.failedLoginAttempts = 0,
           u.updatedAt = CURRENT_TIMESTAMP
     where u.id = :id
  """)
    int updatePassword(@Param("id") Long id, @Param("password") String passwordHash);
}
