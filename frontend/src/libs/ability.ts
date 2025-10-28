import { AbilityBuilder, createMongoAbility, type MongoAbility, type ForcedSubject } from '@casl/ability';

// Acciones
export type Action = 
  | 'manage' | 'read' | 'create' | 'update' | 'delete'
  | 'changeState' 
  | 'approveCeremonial' | 'approveTechnical'
  | 'resolvePriority'
  | 'viewTechCapacity'
  | 'manageCatalogs'
  | 'audit:view'
  | 'comment:create' | 'comment:update' | 'comment:delete'
  | 'request:create'
  | 'availability:check'
  | 'internal:toggle';

// Sujetos
export type Subject = 
  | 'Event' 
  | 'EventRequest' 
  | 'Comment' 
  | 'Space' 
  | 'Department' 
  | 'Priority' 
  | 'TechCapacity' 
  | 'AuditLog' 
  | 'Availability' 
  | 'all';

// Tipos para condiciones
export interface EventConditions {
  createdBy?: string;
  departmentId?: string;
  status?: string;
  internal?: boolean;
  requiresTech?: boolean;
}

export interface CommentConditions {
  authorId?: string;
  eventRequesterId?: string;
}

export interface AuditLogConditions {
  eventCreatedBy?: string;
  eventRequesterId?: string;
}

export type AppAbility = MongoAbility<[Action, Subject | ForcedSubject<Subject>]>;

export function defineAbilityFor(roles: string[], _userId: string): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  // ROLE_ADMIN_FULL 👑
  if (roles.includes('ROLE_ADMIN_FULL')) {
    can('manage', 'all');
    return build();
  }

  // ROLE_ADMIN_CEREMONIAL 🎪
  if (roles.includes('ROLE_ADMIN_CEREMONIAL')) {
    can(['read', 'create', 'update', 'delete'], 'Event');
    can('changeState', 'Event');
    can('approveCeremonial', 'Event');
    can('internal:toggle', 'Event');
    can('resolvePriority', 'Priority');
    can(['comment:create', 'comment:update', 'comment:delete'], 'Comment');
    can('manageCatalogs', ['Space', 'Department']);
    can('audit:view', 'AuditLog');
    can('availability:check', 'Availability');
    can('read', ['Space', 'Department']);
    
    // Bloqueado
    cannot('viewTechCapacity', 'TechCapacity');
  }

  // ROLE_ADMIN_TECNICA 🔧
  if (roles.includes('ROLE_ADMIN_TECNICA')) {
    can(['read', 'create', 'update', 'delete'], 'Event');
    can('changeState', 'Event');
    can('approveTechnical', 'Event');
    can('internal:toggle', 'Event');
    can('viewTechCapacity', 'TechCapacity');
    can(['comment:create', 'comment:update', 'comment:delete'], 'Comment');
    can('manageCatalogs', ['Space', 'Department']);
    can('audit:view', 'AuditLog');
    can('availability:check', 'Availability');
    can('read', ['Space', 'Department']);
    
    // Bloqueado
    cannot('resolvePriority', 'Priority');
  }

  // ROLE_USUARIO 👤
  if (roles.includes('ROLE_USUARIO')) {
    // Eventos: solo lectura
    can('read', 'Event');
    
    // Actualizar/eliminar solo si es creador (en validación manual en componentes)
    can('update', 'Event');
    can('delete', 'Event');
    
    // Solicitudes públicas
    can('request:create', 'EventRequest');
    
    // Comentarios
    can('comment:create', 'Comment');
    can('comment:update', 'Comment');
    can('comment:delete', 'Comment');
    
    // Auditoría
    can('audit:view', 'AuditLog');
    
    // Disponibilidad y catálogos (lectura)
    can('availability:check', 'Availability');
    can('read', ['Space', 'Department']);
    
    // Bloqueado
    cannot(['create', 'changeState', 'internal:toggle'], 'Event');
    cannot(['manageCatalogs', 'resolvePriority', 'viewTechCapacity'], 'all');
  }

  return build();
}

