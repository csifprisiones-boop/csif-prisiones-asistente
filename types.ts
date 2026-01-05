export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  attachments?: Attachment[];
  isError?: boolean;
}

export interface Attachment {
  type: 'image' | 'video';
  url: string; // Object URL for preview
  base64?: string; // For API transmission
  mimeType: string;
}

export type ShiftType = 'M' | 'T' | 'N' | 'M/T' | 'M/N' | 'L' | 'GL' | 'GF';
export type OccasionType = 'birthday' | 'meeting' | 'medical' | 'workshop' | 'party' | 'sport' | 'shopping';

export interface ShiftRecord {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  shift_type: ShiftType;
  notes?: string;
  alarm_enabled?: boolean;
  alarm_minutes_before?: number;
  alarm_time?: string; // HH:mm
  occasion?: OccasionType;
}

export interface ShiftExchange {
  id: string;
  user_id: string;
  offering_date: string;
  offering_shift_type: ShiftType;
  requesting_date?: string;
  description?: string;
  status: 'open' | 'fulfilled' | 'cancelled';
  created_at: string;
}

export enum UserStatus {
  Online = 'En línea',
  Offline = 'Desconectado',
  Busy = 'Ocupado'
}