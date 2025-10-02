SET time_zone = '+00:00';

-- Timestamps base
SET @now = NOW(6);

-- ===========================
-- Departments
-- ===========================
INSERT INTO departments (active, created_at, updated_at, name, color_hex)
VALUES
  (b'1', @now, @now, 'Departamento de Salud Comunitaria',                 NULL),
  (b'1', @now, @now, 'Departamento de Desarrollo Productivo y Tecnológico', NULL),
  (b'1', @now, @now, 'Departamento de Planificación y Políticas Públicas',  NULL),
  (b'1', @now, @now, 'Departamento de Humanidades y Artes',               NULL),
  (b'1', @now, @now, 'Dirección de Gestión y Documentación Estudiantil',  NULL);

-- ===========================
-- Spaces (algunos de la referencia del mapa)
-- ===========================
INSERT INTO spaces (active, created_at, updated_at, name, capacity, notes, default_buffer_before_min, default_buffer_after_min, color_hex)
VALUES
  (b'1', @now, @now, 'Aula Magna Bicentenario',         400, 'Auditorio principal', 30, 30, NULL),
  (b'1', @now, @now, 'Cine Universitario Tita Merello', 250, 'Sala audiovisual',    20, 20, NULL),
  (b'1', @now, @now, 'Gimnasio Universitario Gatica',    300, 'Deportes/Actos',     30, 30, NULL),
  (b'1', @now, @now, 'Quincho Roberto Fontanarrosa',     120, 'Espacio abierto',    15, 15, NULL);

-- ===========================
-- Users (uno por rol)
-- priority/role: libres (strings de tus enums)
-- Para DEMO: password en texto plano; en prod usar hash (BCrypt).
-- admin123 (ejemplo hash BCrypt generado con strength=10)
-- ===========================
INSERT INTO users (
  active, created_at, updated_at,
  username, name, last_name, email, password, priority, role,
  must_change_password, failed_login_attempts, last_login_at
) VALUES
  (b'1', @now, @now, 'admin.full',       'Admin', 'Full',       'admin.full@unla.edu.ar',       '$2a$10$3bAiSZPZ3vFTQWiwIpZ7o.zo3dwYWhPBmQddRrAMpkEdJfaToutjy', 'HIGH', 'ADMIN_FULL',       b'0', 0, NULL),
  (b'1', @now, @now, 'admin.ceremonial', 'Admin', 'Ceremonial', 'admin.ceremonial@unla.edu.ar', '$2a$10$3bAiSZPZ3vFTQWiwIpZ7o.zo3dwYWhPBmQddRrAMpkEdJfaToutjy', 'LOW',   'ADMIN_CEREMONIAL', b'0', 0, NULL),
  (b'1', @now, @now, 'admin.tecnica',    'Admin', 'Tecnica',    'admin.tecnica@unla.edu.ar',    '$2a$10$3bAiSZPZ3vFTQWiwIpZ7o.zo3dwYWhPBmQddRrAMpkEdJfaToutjy', 'LOW',   'ADMIN_TECNICA',    b'0', 0, NULL),
  (b'1', @now, @now, 'viewer',           'User',  'Usuario',    'viewer@unla.edu.ar',           '$2a$10$3bAiSZPZ3vFTQWiwIpZ7o.zo3dwYWhPBmQddRrAMpkEdJfaToutjy','LOW',   'USUARIO',          b'0', 0, NULL);

-- Guardamos ids que usaremos
SET @u_full  = (SELECT id FROM users WHERE username='admin.full');
SET @u_cer   = (SELECT id FROM users WHERE username='admin.ceremonial');
SET @u_tec   = (SELECT id FROM users WHERE username='admin.tecnica');

SET @dept_salud = (SELECT id FROM departments WHERE name='Departamento de Salud Comunitaria');
SET @dept_plan  = (SELECT id FROM departments WHERE name='Departamento de Planificación y Políticas Públicas');

SET @space_aula    = (SELECT id FROM spaces WHERE name='Aula Magna Bicentenario');
SET @space_cine    = (SELECT id FROM spaces WHERE name='Cine Universitario Tita Merello');
SET @space_gym     = (SELECT id FROM spaces WHERE name='Gimnasio Universitario Gatica');
SET @space_quincho = (SELECT id FROM spaces WHERE name='Quincho Roberto Fontanarrosa');

-- ===========================
-- Events (4 eventos de ejemplo)
-- Estados válidos esperados por tu enum: SOLICITADO, EN_REVISION, RESERVADO, APROBADO, RECHAZADO
-- ===========================
INSERT INTO events (
  active, created_at, updated_at,
  date, technical_schedule, schedule_from, schedule_to, status,
  name, requesting_area,
  space_id, free_location, department_id,
  requirements, coverage, observations,
  priority, audience_type,
  internal, ceremonial_ok, technical_ok, requires_tech,
  buffer_before_min, buffer_after_min,
  contact_name, contact_email, contact_phone,
  created_by_user_id, last_modified_by_user_id
) VALUES
-- 1) Acto institucional (Rectorado) reservado en Aula Magna
  (b'1', @now, @now,
   DATE_ADD(CURDATE(), INTERVAL 7 DAY), NULL, '10:00:00', '12:00:00', 'RESERVADO',
   'Acto de Apertura Académica', 'Rectorado',
   @space_aula, NULL, @dept_plan,
   'Escenario + sonido', 'Cobertura fotográfica', 'Ingreso 9:30',
   'HIGH', 'COMUNIDAD',
   b'0', b'1', b'0', b'1',
   30, 30,
   'María Pérez', 'maria.perez@unla.edu.ar', '+54 11 5555-0001',
   @u_full, NULL),
-- 2) Proyección en el Cine (en revisión)
  (b'1', @now, @now,
   DATE_ADD(CURDATE(), INTERVAL 10 DAY), '18:00:00', '19:00:00', '21:00:00', 'EN_REVISION',
   'Ciclo de Cine Latinoamericano', 'Cultura',
   @space_cine, NULL, @dept_plan,
   'Proyector 4K, micrófono', NULL, 'Confirmar moderador',
   'LOW', 'ESTUDIANTES',
   b'0', b'0', b'0', b'0',
   20, 20,
   'Juan Gómez', 'juan.gomez@unla.edu.ar', '+54 11 5555-0002',
   @u_cer, NULL),
-- 3) Jornada de salud (lugar libre) aprobada e interna=false (pública)
  (b'1', @now, @now,
   DATE_ADD(CURDATE(), INTERVAL 14 DAY), NULL, '09:00:00', '13:00:00', 'APROBADO',
   'Jornada de Salud Comunitaria', 'Extensión',
   NULL, 'Patio central', @dept_salud,
   'Gazebos y sillas', NULL, 'Coordinar limpieza',
   'LOW', 'COMUNIDAD',
   b'0', b'1', b'1', b'0',
   15, 15,
   'Laura Ruiz', 'laura.ruiz@unla.edu.ar', '+54 11 5555-0003',
   @u_full, @u_tec),
-- 4) Torneo interfacultades (reservado en Gimnasio, interno=true)
  (b'1', @now, @now,
   DATE_ADD(CURDATE(), INTERVAL 21 DAY), NULL, '14:00:00', '18:00:00', 'RESERVADO',
   'Torneo Interfacultades', 'Deportes',
   @space_gym, NULL, @dept_plan,
   'Marcadores y vallas', NULL, 'Revisar seguros',
   'LOW', 'COMUNIDAD',
   b'1', b'0', b'1', b'1',
   30, 30,
   'Sofía Díaz', 'sofia.diaz@unla.edu.ar', '+54 11 5555-0004',
   @u_tec, NULL);
