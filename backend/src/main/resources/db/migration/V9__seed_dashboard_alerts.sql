SET NAMES utf8mb4;
SET time_zone = '+00:00';

SET @now = NOW(6);
SET @today = CURDATE();
SET @start_time = ADDTIME(CURTIME(), '01:00:00'); -- arranca en ~1h para disparar alerta de proximidad
SET @end_time = ADDTIME(@start_time, '01:30:00');

-- Reutilizamos datos existentes
SET @u_full = (SELECT id FROM users WHERE username = 'admin.full');
SET @u_tecnica = (SELECT id FROM users WHERE username = 'admin.tecnica');
SET @dept_plan = (SELECT id FROM departments WHERE name = 'Departamento de Planificaci¢n y Pol¡ticas P£blicas');
SET @space_aula = (SELECT id FROM spaces WHERE name = 'Aula Magna Bicentenario');

-- Cinco eventos técnicos superpuestos para saturar franja y mostrar alertas
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
) VALUES
  (b'1', @now, @now, @today, NULL, @start_time, @end_time, 'RESERVADO',
   'Alerta Tech 1', 'Rectorado',
   @space_aula, NULL, @dept_plan,
   'Sonido y proyector', NULL, 'Solo ceremonial ok',
   'HIGH', 'COMUNIDAD',
   b'0', b'1', b'0', b'1', b'1', 'SETUP_ONLY',
   20, 20,
   'Contacto 1', 'contacto1@unla.edu.ar', '+54 11 6000-0001',
   @u_tecnica, NULL),
  (b'1', @now, @now, @today, NULL, @start_time, @end_time, 'RESERVADO',
   'Alerta Tech 2', 'Extensión',
   @space_aula, NULL, @dept_plan,
   'Microfonía', NULL, 'Sin conformidades',
   'MEDIUM', 'ESTUDIANTES',
   b'0', b'0', b'0', b'1', b'0', 'SETUP_ONLY',
   20, 20,
   'Contacto 2', 'contacto2@unla.edu.ar', '+54 11 6000-0002',
   @u_tecnica, NULL),
  (b'1', @now, @now, @today, NULL, @start_time, @end_time, 'RESERVADO',
   'Alerta Tech 3', 'Cultura',
   @space_aula, NULL, @dept_plan,
   'Escenario', NULL, 'Reprogramar',
   'LOW', 'COMUNIDAD',
   b'0', b'1', b'0', b'1', b'1', 'SETUP_ONLY',
   20, 20,
   'Contacto 3', 'contacto3@unla.edu.ar', '+54 11 6000-0003',
   @u_tecnica, NULL),
  (b'1', @now, @now, @today, NULL, @start_time, @end_time, 'RESERVADO',
   'Alerta Tech 4', 'Deportes',
   @space_aula, NULL, @dept_plan,
   'Marcadores', NULL, 'Sin tecnicos',
   'MEDIUM', 'COMUNIDAD',
   b'1', b'0', b'0', b'1', b'0', 'SETUP_ONLY',
   20, 20,
   'Contacto 4', 'contacto4@unla.edu.ar', '+54 11 6000-0004',
   @u_full, NULL),
  (b'1', @now, @now, @today, NULL, @start_time, @end_time, 'RESERVADO',
   'Alerta Tech 5', 'Bienestar',
   @space_aula, NULL, @dept_plan,
   'Streaming', NULL, 'Sin conformidad tecnica',
   'LOW', 'ESTUDIANTES',
   b'0', b'0', b'0', b'1', b'1', 'SETUP_ONLY',
   20, 20,
   'Contacto 5', 'contacto5@unla.edu.ar', '+54 11 6000-0005',
   @u_tecnica, NULL);
