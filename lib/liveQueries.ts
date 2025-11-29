import Parse from '@/lib/parse';
import { Appointment } from '@/types/appointment';

/**
 * Convert Parse Object to Appointment interface
 */
const parseToAppointment = (parseObject: Parse.Object): Appointment => {
    return {
        id: parseObject.id || '',
        date: parseObject.get('date') || '',
        heure: parseObject.get('heure') || '',
        interlocuteur: parseObject.get('interlocuteur') || '',
        motif: parseObject.get('motif') || '',
        lieu: parseObject.get('lieu') || '',
        statut: parseObject.get('statut') || 'En attente',
        commentaires: parseObject.get('commentaires') || '',
        createdAt: parseObject.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: parseObject.updatedAt?.toISOString() || new Date().toISOString(),
        createdBy: parseObject.get('createdBy')?.id,
    };
};

/**
 * Subscribe to real-time appointment updates
 */
export const subscribeToAppointments = async (
    callback: (appointments: Appointment[]) => void
): Promise<any | null> => {
    try {
        const Appointment = Parse.Object.extend('Appointment');
        const query = new Parse.Query(Appointment);
        query.descending('createdAt');

        const subscription = await query.subscribe();

        // Initial fetch
        const results = await query.find();
        callback(results.map(parseToAppointment));

        // Listen for create events
        subscription.on('create', async () => {
            const results = await query.find();
            callback(results.map(parseToAppointment));
        });

        // Listen for update events
        subscription.on('update', async () => {
            const results = await query.find();
            callback(results.map(parseToAppointment));
        });

        // Listen for delete events
        subscription.on('delete', async () => {
            const results = await query.find();
            callback(results.map(parseToAppointment));
        });

        return subscription;
    } catch (error: any) {
        console.error('Error subscribing to appointments:', error);
        return null;
    }
};

/**
 * Unsubscribe from appointment updates
 */
export const unsubscribeFromAppointments = (
    subscription: any | null
): void => {
    if (subscription) {
        subscription.unsubscribe();
    }
};
