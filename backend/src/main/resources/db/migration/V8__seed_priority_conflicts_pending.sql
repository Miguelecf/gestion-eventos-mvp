SET NAMES utf8mb4;
SET time_zone = '+00:00';

SET @now = NOW(6);

-- Reutilizamos datos existentes
SET @u_full = (SELECT id FROM users WHERE username = 'admin.full');
SET @dept_plan = (SELECT id FROM departments WHERE name = 'Departamento de Planificaci¢n y Pol¡ticas P£blicas');
SET @space_aula = (SELECT id FROM spaces WHERE name = 'Aula Magna Bicentenario');

-- Fecha del conflicto (pr¢ximo slot cercano para pruebas)
SET @conflict_date = DATE_ADD(CURDATE(), INTERVAL 3 DAY);

-- Evento de alta prioridad (genera el desplazamiento)
INSERT INTO events (
  active, created_at, updated_at,
  date, technical_schedule, schedule_from, schedule_to, status,
  name, requesting_area,
  space_id, free_location, department_id,
  requirements, coverage, observations,
  priority, audience_type,
  internal, ceremonial_ok, technical_ok, requires_tech, requires_rebooking, tech_support_mode,
  buffer_before_min, buffer_after_min,
  contact_name, contact_email, contact_phone,
  created_by_user_id, last_modified_by_user_id
) VALUES (
  b'1', @now, @now,
  @conflict_date, NULL, '09:00:00', '11:00:00', 'RESERVADO',
  'Rectorado - Evento Alta Prioridad', 'Rectorado',
  @space_aula, NULL, @dept_plan,
  'Sonido y podio', NULL, 'Seed para conflicto pendiente',
  'HIGH', 'COMUNIDAD',
  b'0', b'0', b'0', b'1', b'0', 'SETUP_ONLY',
  30, 30,
  'Admin Rectorado', 'admin.full@unla.edu.ar', '+54 11 5555-0101',
  @u_full, NULL
);

-- Evento desplazado (menor prioridad) en el mismo espacio/horario
INSERT INTO events (
  active, created_at, updated_at,
  date, technical_schedule, schedule_from, schedule_to, status,
  name, requesting_area,
  space_id, free_location, department_id,
  requirements, coverage, observations,
  priority, audience_type,
  internal, ceremonial_ok, technical_ok, requires_tech, requires_rebooking, tech_support_mode,
  buffer_before_min, buffer_after_min,
  contact_name, contact_email, contact_phone,
  created_by_user_id, last_modified_by_user_id
) VALUES (
  b'1', @now, @now,
  @conflict_date, NULL, '09:30:00', '11:00:00', 'RESERVADO',
  'Jornada Estudiantil - Desplazable', 'Extensi¢n',
  @space_aula, NULL, @dept_plan,
  'Proyector y micr¢fono', NULL, 'Seed desplazado por prioridad',
  'LOW', 'ESTUDIANTES',
  b'0', b'0', b'0', b'0', b'1', 'SETUP_ONLY',
  20, 20,
  'User Demostraci¢n', 'viewer@unla.edu.ar', '+54 11 5555-0202',
  @u_full, NULL
);

SET @high_event_id = (SELECT id FROM events WHERE name = 'Rectorado - Evento Alta Prioridad' ORDER BY id DESC LIMIT 1);
SET @displaced_event_id = (SELECT id FROM events WHERE name = 'Jornada Estudiantil - Desplazable' ORDER BY id DESC LIMIT 1);

-- Conflicto pendiente (status OPEN) para probar el endpoint /api/priority/conflicts/pending
INSERT INTO priority_conflicts (
  conflict_code, high_event_id, displaced_event_id, space_id, date, from_time, to_time,
  status, created_by_user_id, created_at, closed_at, decision, decision_by_user_id, reason
) VALUES (
  'PRIO-SEED-00001', @high_event_id, @displaced_event_id, @space_aula, @conflict_date, '09:00:00', '11:00:00',
  'OPEN', @u_full, @now, NULL, NULL, NULL, 'Seed pendiente de reprogramacion'
);
