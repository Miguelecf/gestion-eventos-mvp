package com.mvp.backend.feature.events.repository;

import com.mvp.backend.feature.events.model.Event;
import com.mvp.backend.feature.events.model.Status;
import com.mvp.backend.shared.Priority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    //Devolver todos
    List<Event> findAll();

    //Buscar por fecha exacta
    List<Event> findByDate(LocalDate date);

    // Buscar entre fechas
    List<Event> findByDateBetween(LocalDate startDate, LocalDate endDate);

    //Buscar por prioridad
    List<Event> findByPriority(Priority priority);

    //Buscar por estado
    List<Event> findByStatus(Status status);

    //Buscar por user
    List<Event> findByUserId(Long userId);

    //Buscar activo

    List<Event> findByActiveTrue();
    List<Event> findByActiveFalse();
}
