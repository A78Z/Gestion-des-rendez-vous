import { Appointment, AppointmentFormData } from '@/types/appointment';

const STORAGE_KEY = 'fdcuic_appointments';

export const getAppointments = (): Appointment[] => {
    if (typeof window === 'undefined') return [];

    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error reading appointments:', error);
        return [];
    }
};

export const saveAppointments = (appointments: Appointment[]): void => {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
        // Dispatch custom event for real-time sync
        window.dispatchEvent(new Event('appointmentsUpdated'));
    } catch (error) {
        console.error('Error saving appointments:', error);
    }
};

export const addAppointment = (formData: AppointmentFormData): Appointment => {
    const newAppointment: Appointment = {
        id: crypto.randomUUID(),
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    const appointments = getAppointments();
    appointments.push(newAppointment);
    saveAppointments(appointments);

    return newAppointment;
};

export const updateAppointment = (id: string, formData: AppointmentFormData): Appointment | null => {
    const appointments = getAppointments();
    const index = appointments.findIndex(apt => apt.id === id);

    if (index === -1) return null;

    const updatedAppointment: Appointment = {
        ...appointments[index],
        ...formData,
        updatedAt: new Date().toISOString(),
    };

    appointments[index] = updatedAppointment;
    saveAppointments(appointments);

    return updatedAppointment;
};

export const deleteAppointment = (id: string): boolean => {
    const appointments = getAppointments();
    const filtered = appointments.filter(apt => apt.id !== id);

    if (filtered.length === appointments.length) return false;

    saveAppointments(filtered);
    return true;
};

export const getAppointmentById = (id: string): Appointment | null => {
    const appointments = getAppointments();
    return appointments.find(apt => apt.id === id) || null;
};
