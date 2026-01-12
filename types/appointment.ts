export type AppointmentStatus = 'À valider' | 'Validé' | 'Confirmé' | 'En attente' | 'Annulé' | 'Reporté';

export type UserRole = 'Secretary' | 'Director';

export interface User {
    id: string;
    username: string;
    role: UserRole;
    fullName: string;
}

export interface Appointment {
    id: string;
    date: string;
    heure: string;
    duree?: string;
    interlocuteur: string;
    motif: string;
    lieu: string;
    statut: AppointmentStatus;
    commentaires: string;
    createdAt: string;
    updatedAt: string;
    createdBy?: string; // User ID who created the appointment
}

export interface AppointmentFormData {
    date: string;
    heure: string;
    duree?: string;
    interlocuteur: string;
    motif: string;
    lieu: string;
    statut: AppointmentStatus;
    commentaires: string;
}
