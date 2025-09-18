// src/interfaces/Event.ts
export interface Event {
  id: number;
  active: boolean;
  createdAt: string;   // viene como ISO string desde el backend
  updatedAt: string | null;
  deletedAt: string | null;

  name: string;
  requestingArea?: string;
  requirements?: string;
  coverage?: string;
  observations?: string;

  date: string;                // "2025-09-28"
  technicalSchedule?: string;  // "14:00:00"
  scheduleFrom?: string;       // "15:00:00"
  scheduleTo?: string;         // "18:00:00"
  status: "PENDING" | "APPROVED" | "REJECTED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  requestDate: string;         // ISO string "2025-09-18T14:28:10.001093Z"

  userId: number;
}
