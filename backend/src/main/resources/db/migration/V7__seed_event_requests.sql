SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- ===========================
-- Event Requests - Solicitudes públicas de eventos
-- ===========================
-- Estados: RECIBIDO, EN_REVISION, CONVERTIDO, RECHAZADO
-- Prioridades: LOW, MEDIUM, HIGH
-- AudienceType:     ESTUDIANTES, DOCENTES, AUTORIDADES, COMUNIDAD, TERCERA_EDAD
-- ===========================

-- Timestamp base
SET @now = NOW(6);

-- Obtener IDs de espacios y departamentos existentes
SET @space_aula    = (SELECT id FROM spaces WHERE name LIKE '%Aula Magna%' LIMIT 1);
SET @space_cine    = (SELECT id FROM spaces WHERE name LIKE '%Cine%' LIMIT 1);
SET @space_gym     = (SELECT id FROM spaces WHERE name LIKE '%Gimnasio%' LIMIT 1);
SET @space_quincho = (SELECT id FROM spaces WHERE name LIKE '%Quincho%' LIMIT 1);

SET @dept_salud = (SELECT id FROM departments WHERE name LIKE '%Salud%' LIMIT 1);
SET @dept_plan  = (SELECT id FROM departments WHERE name LIKE '%Planificación%' LIMIT 1);
SET @dept_human = (SELECT id FROM departments WHERE name LIKE '%Humanidades%' LIMIT 1);
SET @dept_prod  = (SELECT id FROM departments WHERE name LIKE '%Productivo%' LIMIT 1);

-- Insertar 12 solicitudes de eventos con diferentes estados y características
INSERT INTO event_requests (
  active, created_at, updated_at,
  tracking_uuid,
  date, technical_schedule, schedule_from, schedule_to,
  name,
  space_id, free_location,
  requesting_department_id,
  requirements, coverage, observations,
  priority, audience_type,
  contact_name, contact_email, contact_phone,
  buffer_before_min, buffer_after_min,
  status, request_date,
  converted_event_id
) VALUES

-- 1) Solicitud recibida - Taller de programación
(b'1', @now, @now,
 '550e8400-e29b-41d4-a716-446655440001',
 DATE_ADD(CURDATE(), INTERVAL 5 DAY), NULL, '14:00:00', '18:00:00',
 'Taller de Introducción a Python',
 @space_cine, NULL,
 @dept_prod,
 'Proyector y computadoras', NULL, 'Confirmar asistencia de 30 estudiantes',
 'LOW', 'ESTUDIANTES',
 'Carlos Martinez', 'carlos.martinez@estudiantes.unla.edu.ar', '+54 11 4567-8901',
 20, 20,
 'RECIBIDO', DATE_SUB(@now, INTERVAL 2 DAY),
 NULL),

-- 2) En revisión - Charla de salud mental
(b'1', @now, @now,
 '550e8400-e29b-41d4-a716-446655440002',
 DATE_ADD(CURDATE(), INTERVAL 8 DAY), NULL, '10:00:00', '12:00:00',
 'Charla sobre Salud Mental Estudiantil',
 @space_aula, NULL,
 @dept_salud,
 'Micrófono inalámbrico, proyector', 'Streaming en vivo', NULL,
 'MEDIUM', 'ESTUDIANTES',
 'Ana López', 'ana.lopez@unla.edu.ar', '+54 11 5678-9012',
 30, 30,
 'EN_REVISION', DATE_SUB(@now, INTERVAL 5 DAY),
 NULL),

-- 3) Solicitud recibida - Evento deportivo exterior
(b'1', @now, @now,
 '550e8400-e29b-41d4-a716-446655440003',
 DATE_ADD(CURDATE(), INTERVAL 12 DAY), NULL, '09:00:00', '17:00:00',
 'Maratón Solidaria UNLa',
 NULL, 'Campo de deportes principal',
 @dept_plan,
 'Hidratación, primeros auxilios, vallas', 'Fotografía y video', 'Coordinar con municipio',
 'HIGH', 'COMUNIDAD',
 'Roberto Fernández', 'roberto.fernandez@unla.edu.ar', '+54 11 6789-0123',
 60, 30,
 'RECIBIDO', DATE_SUB(@now, INTERVAL 1 DAY),
 NULL),

-- 4) En revisión - Proyección de documental
(b'1', @now, @now,
 '550e8400-e29b-41d4-a716-446655440004',
 DATE_ADD(CURDATE(), INTERVAL 15 DAY), '17:30:00', '18:00:00', '20:00:00',
 'Ciclo de Cine Debate - Memoria Histórica',
 @space_cine, NULL,
 @dept_human,
 'Sistema de sonido 5.1, micrófono para panel', NULL, 'Invitados externos confirmados',
 'LOW', 'COMUNIDAD',
 'María Gonzalez', 'maria.gonzalez@unla.edu.ar', '+54 11 7890-1234',
 30, 20,
 'EN_REVISION', DATE_SUB(@now, INTERVAL 3 DAY),
 NULL),

-- 5) Solicitud recibida - Feria de ciencias
(b'1', @now, @now,
 '550e8400-e29b-41d4-a716-446655440005',
 DATE_ADD(CURDATE(), INTERVAL 18 DAY), NULL, '08:00:00', '14:00:00',
 'Feria de Ciencias y Tecnología',
 @space_gym, NULL,
 @dept_prod,
 'Mesas, sillas, electricidad 220V', 'Cobertura periodística', 'Confirmar limpieza previa',
 'MEDIUM', 'ESTUDIANTES',
 'Pedro Ramirez', 'pedro.ramirez@estudiantes.unla.edu.ar', '+54 11 8901-2345',
 30, 30,
 'RECIBIDO', DATE_SUB(@now, INTERVAL 4 DAY),
 NULL),

-- 6) Rechazada - Conflicto de horarios
(b'1', @now, @now,
 '550e8400-e29b-41d4-a716-446655440006',
 DATE_ADD(CURDATE(), INTERVAL 7 DAY), NULL, '10:00:00', '12:00:00',
 'Presentación de Proyecto Final',
 @space_aula, NULL,
 @dept_prod,
 'Proyector, puntero láser', NULL, NULL,
 'LOW', 'DOCENTES',
 'Laura Silva', 'laura.silva@unla.edu.ar', '+54 11 9012-3456',
 15, 15,
 'RECHAZADO', DATE_SUB(@now, INTERVAL 6 DAY),
 NULL),

-- 7) En revisión - Taller artístico
(b'1', @now, @now,
 '550e8400-e29b-41d4-a716-446655440007',
 DATE_ADD(CURDATE(), INTERVAL 20 DAY), NULL, '15:00:00', '19:00:00',
 'Taller de Muralismo Comunitario',
 NULL, 'Patio del edificio B',
 @dept_human,
 'Caballetes, pinturas, pinceles', NULL, 'Coordinar con mantenimiento',
 'LOW', 'COMUNIDAD',
 'Sofía Torres', 'sofia.torres@unla.edu.ar', '+54 11 2345-6789',
 15, 15,
 'EN_REVISION', DATE_SUB(@now, INTERVAL 2 DAY),
 NULL),

-- 8) Solicitud recibida - Capacitación docente
(b'1', @now, @now,
 '550e8400-e29b-41d4-a716-446655440008',
 DATE_ADD(CURDATE(), INTERVAL 25 DAY), NULL, '09:00:00', '13:00:00',
 'Capacitación en Nuevas Metodologías Educativas',
 @space_quincho, NULL,
 @dept_plan,
 'Proyector, pizarra, café para 40 personas', NULL, NULL,
 'MEDIUM', 'DOCENTES',
 'Jorge Medina', 'jorge.medina@unla.edu.ar', '+54 11 3456-7890',
 30, 30,
 'RECIBIDO', @now,
 NULL),

-- 9) En revisión - Jornada de salud comunitaria
(b'1', @now, @now,
 '550e8400-e29b-41d4-a716-446655440009',
 DATE_ADD(CURDATE(), INTERVAL 30 DAY), '07:00:00', '08:00:00', '16:00:00',
 'Jornada de Salud y Prevención',
 NULL, 'Plaza central de la universidad',
 @dept_salud,
 'Carpas, mesas, sillas, electricidad', 'Cobertura fotográfica', 'Coordinar con centros de salud',
 'HIGH', 'COMUNIDAD',
 'Daniela Castro', 'daniela.castro@unla.edu.ar', '+54 11 4567-8902',
 60, 30,
 'EN_REVISION', DATE_SUB(@now, INTERVAL 7 DAY),
 NULL),

-- 10) Solicitud recibida - Conferencia académica
(b'1', @now, @now,
 '550e8400-e29b-41d4-a716-446655440010',
 DATE_ADD(CURDATE(), INTERVAL 35 DAY), NULL, '16:00:00', '18:30:00',
 'Conferencia Internacional de Políticas Públicas',
 @space_aula, NULL,
 @dept_plan,
 'Sistema de traducción simultánea, 2 micrófonos', 'Streaming YouTube', 'Confirmar invitados internacionales',
 'HIGH', 'AUTORIDADES',
 'Miguel Vargas', 'miguel.vargas@unla.edu.ar', '+54 11 5678-9013',
 45, 30,
 'RECIBIDO', DATE_SUB(@now, INTERVAL 10 DAY),
 NULL),

-- 11) Rechazada - Espacio no disponible
(b'1', @now, @now,
 '550e8400-e29b-41d4-a716-446655440011',
 DATE_ADD(CURDATE(), INTERVAL 9 DAY), NULL, '19:00:00', '22:00:00',
 'Noche de Talentos Estudiantiles',
 @space_gym, NULL,
 @dept_human,
 'Equipo de sonido profesional, iluminación', NULL, NULL,
 'LOW', 'ESTUDIANTES',
 'Lucía Benítez', 'lucia.benitez@estudiantes.unla.edu.ar', '+54 11 6789-0124',
 30, 30,
 'RECHAZADO', DATE_SUB(@now, INTERVAL 8 DAY),
 NULL),

-- 12) En revisión - Encuentro de extensión
(b'1', @now, @now,
 '550e8400-e29b-41d4-a716-446655440012',
 DATE_ADD(CURDATE(), INTERVAL 40 DAY), NULL, '10:00:00', '18:00:00',
 'Encuentro de Proyectos de Extensión Universitaria',
 @space_quincho, NULL,
 @dept_plan,
 'Mesas redondas, sillas, sistema de audio', 'Cobertura institucional', 'Catering para 80 personas',
 'MEDIUM', 'ESTUDIANTES',
 'Fernando Paz', 'fernando.paz@unla.edu.ar', '+54 11 7890-1235',
 30, 30,
 'EN_REVISION', DATE_SUB(@now, INTERVAL 4 DAY),
 NULL);

-- ===========================
-- Historial de solicitudes (event_request_history)
-- Registrar cambios de estado de algunas solicitudes
-- ===========================

-- Obtener IDs de las solicitudes insertadas
SET @req1 = (SELECT id FROM event_requests WHERE tracking_uuid = '550e8400-e29b-41d4-a716-446655440001');
SET @req2 = (SELECT id FROM event_requests WHERE tracking_uuid = '550e8400-e29b-41d4-a716-446655440002');
SET @req6 = (SELECT id FROM event_requests WHERE tracking_uuid = '550e8400-e29b-41d4-a716-446655440006');
SET @req9 = (SELECT id FROM event_requests WHERE tracking_uuid = '550e8400-e29b-41d4-a716-446655440009');

-- Historial para solicitud #1 (RECIBIDO)
INSERT INTO event_request_history (request_id, at, type, from_value, to_value)
VALUES
  (@req1, DATE_SUB(@now, INTERVAL 2 DAY), 'STATUS', NULL, 'RECIBIDO');

-- Historial para solicitud #2 (RECIBIDO → EN_REVISION)
INSERT INTO event_request_history (request_id, at, type, from_value, to_value)
VALUES
  (@req2, DATE_SUB(@now, INTERVAL 5 DAY), 'STATUS', NULL, 'RECIBIDO'),
  (@req2, DATE_SUB(@now, INTERVAL 3 DAY), 'STATUS', 'RECIBIDO', 'EN_REVISION');

-- Historial para solicitud #6 (RECIBIDO → RECHAZADO)
INSERT INTO event_request_history (request_id, at, type, from_value, to_value)
VALUES
  (@req6, DATE_SUB(@now, INTERVAL 6 DAY), 'STATUS', NULL, 'RECIBIDO'),
  (@req6, DATE_SUB(@now, INTERVAL 4 DAY), 'STATUS', 'RECIBIDO', 'RECHAZADO');

-- Historial para solicitud #9 (RECIBIDO → EN_REVISION con varios cambios)
INSERT INTO event_request_history (request_id, at, type, from_value, to_value)
VALUES
  (@req9, DATE_SUB(@now, INTERVAL 7 DAY), 'STATUS', NULL, 'RECIBIDO'),
  (@req9, DATE_SUB(@now, INTERVAL 5 DAY), 'STATUS', 'RECIBIDO', 'EN_REVISION'),
  (@req9, DATE_SUB(@now, INTERVAL 3 DAY), 'FIELD_UPDATE', 'Carpas', 'Carpas, mesas, sillas, electricidad');
