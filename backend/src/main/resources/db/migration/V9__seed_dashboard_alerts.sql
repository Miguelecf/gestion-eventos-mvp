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
   'Acto de Apertura Academica - Prueba Tecnica', 'Rectorado',
   @space_aula, NULL, @dept_plan,
   'Prueba de sonido, proyector y streaming', 'Cobertura fotografica', 'Ceremonial confirmado; falta ok tecnica',
   'HIGH', 'COMUNIDAD',
   b'0', b'1', b'0', b'1', b'1', 'SETUP_ONLY',
   20, 20,
   'Maria Perez', 'maria.perez@unla.edu.ar', '+54 11 6000-0101',
   @u_tecnica, NULL),
  (b'1', @now, @now, @today, NULL, @start_time, @end_time, 'RESERVADO',
   'Cine Debate Latinoamericano - Ensayo Técnico', 'Cultura',
   @space_aula, NULL, @dept_plan,
   'Microfonía inalámbrica y proyector 4K', NULL, 'Moderador a confirmar; sin conformidades todavía',
   'MEDIUM', 'ESTUDIANTES',
   b'0', b'0', b'0', b'1', b'0', 'SETUP_ONLY',
   20, 20,
   'Juan Gómez', 'juan.gomez@unla.edu.ar', '+54 11 6000-0102',
   @u_tecnica, NULL),
  (b'1', @now, @now, @today, NULL, @start_time, @end_time, 'RESERVADO',
   'Jornada de Salud Comunitaria - Montaje', 'Extensión',
   @space_aula, NULL, @dept_plan,
   'Gazebos, audio ambiente y sillas', NULL, 'Pedir autorización de tránsito',
   'LOW', 'COMUNIDAD',
   b'0', b'1', b'0', b'1', b'1', 'SETUP_ONLY',
   20, 20,
   'Laura Ruiz', 'laura.ruiz@unla.edu.ar', '+54 11 6000-0103',
   @u_tecnica, NULL),
  (b'1', @now, @now, @today, NULL, @start_time, @end_time, 'RESERVADO',
   'Torneo Interfacultades - Chequeo de Cancha', 'Deportes',
   @space_aula, NULL, @dept_plan,
   'Marcadores electrónicos y audio de cancha', NULL, 'Faltan técnicos asignados',
   'MEDIUM', 'COMUNIDAD',
   b'1', b'0', b'0', b'1', b'0', 'SETUP_ONLY',
   20, 20,
   'Sofía Díaz', 'sofia.diaz@unla.edu.ar', '+54 11 6000-0104',
   @u_full, NULL),
  (b'1', @now, @now, @today, NULL, @start_time, @end_time, 'RESERVADO',
   'Feria de Innovación Universitaria - Streaming', 'Bienestar Universitario',
   @space_aula, NULL, @dept_plan,
   'Streaming HD, iluminación y retorno de audio', NULL, 'Sin conformidad técnica',
   'LOW', 'ESTUDIANTES',
   b'0', b'0', b'0', b'1', b'1', 'SETUP_ONLY',
   20, 20,
   'Diego Álvarez', 'diego.alvarez@unla.edu.ar', '+54 11 6000-0105',
   @u_tecnica, NULL);
