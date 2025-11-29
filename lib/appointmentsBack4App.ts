import Parse from '@/lib/parse';
import { Appointment, AppointmentFormData, AppointmentStatus } from '@/types/appointment';

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
 * Get all appointments
 */
export const getAppointments = async (): Promise<Appointment[]> => {
    try {
        const Appointment = Parse.Object.extend('Appointment');
        const query = new Parse.Query(Appointment);
        query.descending('createdAt');
        query.limit(1000);

        const results = await query.find();
        return results.map(parseToAppointment);
    } catch (error: any) {
        console.error('Error fetching appointments:', error);
        throw new Error(error.message || 'Failed to fetch appointments');
    }
};

/**
 * Add new appointment (Secretary only)
 */
export const addAppointment = async (formData: AppointmentFormData): Promise<Appointment> => {
    try {
        const Appointment = Parse.Object.extend('Appointment');
        const appointment = new Appointment();

        appointment.set('date', formData.date);
        appointment.set('heure', formData.heure);
        appointment.set('interlocuteur', formData.interlocuteur);
        appointment.set('motif', formData.motif);
        appointment.set('lieu', formData.lieu);
        appointment.set('statut', formData.statut);
        appointment.set('commentaires', formData.commentaires);

        const currentUser = Parse.User.current();
        if (currentUser) {
            appointment.set('createdBy', currentUser);
        }

        // Set ACL - Public read, Secretary and Director roles can write
        const acl = new Parse.ACL();
        acl.setPublicReadAccess(true);
        acl.setRoleWriteAccess('Secretary', true);
        acl.setRoleWriteAccess('Secretaire', true); // Try French spelling
        acl.setRoleWriteAccess('Director', true);
        acl.setRoleWriteAccess('Directeur', true); // Try French spelling
        acl.setRoleWriteAccess('Admin', true);
        acl.setRoleWriteAccess('Administrateur', true);

        if (currentUser && currentUser.id) {
            acl.setWriteAccess(currentUser.id, true);
        }
        appointment.setACL(acl);

        const saved = await appointment.save();
        return parseToAppointment(saved);
    } catch (error: any) {
        console.error('Error adding appointment:', error);
        throw new Error(error.message || 'Failed to add appointment');
    }
};

/**
 * Update appointment (Secretary only)
 */
export const updateAppointment = async (
    id: string,
    formData: AppointmentFormData
): Promise<Appointment> => {
    try {
        const Appointment = Parse.Object.extend('Appointment');
        const query = new Parse.Query(Appointment);
        const appointment = await query.get(id);

        appointment.set('date', formData.date);
        appointment.set('heure', formData.heure);
        appointment.set('interlocuteur', formData.interlocuteur);
        appointment.set('motif', formData.motif);
        appointment.set('lieu', formData.lieu);
        appointment.set('statut', formData.statut);
        appointment.set('commentaires', formData.commentaires);

        const saved = await appointment.save();
        return parseToAppointment(saved);
    } catch (error: any) {
        console.error('Error updating appointment:', error);
        throw new Error(error.message || 'Failed to update appointment');
    }
};

/**
 * Update appointment status (Director can do this)
 */
export const updateAppointmentStatus = async (
    id: string,
    status: AppointmentStatus
): Promise<Appointment> => {
    try {
        const Appointment = Parse.Object.extend('Appointment');
        const query = new Parse.Query(Appointment);
        const appointment = await query.get(id);

        appointment.set('statut', status);

        const saved = await appointment.save();
        return parseToAppointment(saved);
    } catch (error: any) {
        console.error('Error updating appointment status:', error);
        // Throw detailed error
        throw new Error(`Failed to update status: ${error.message} (Code: ${error.code})`);
    }
};

/**
 * Delete appointment (Secretary only)
 */
export const deleteAppointment = async (id: string): Promise<boolean> => {
    try {
        const Appointment = Parse.Object.extend('Appointment');
        const query = new Parse.Query(Appointment);
        const appointment = await query.get(id);

        await appointment.destroy();
        return true;
    } catch (error: any) {
        console.error('Error deleting appointment:', error);
        throw new Error(error.message || 'Failed to delete appointment');
    }
};

/**
 * Get appointment by ID
 */
export const getAppointmentById = async (id: string): Promise<Appointment | null> => {
    try {
        const Appointment = Parse.Object.extend('Appointment');
        const query = new Parse.Query(Appointment);
        const result = await query.get(id);

        return parseToAppointment(result);
    } catch (error: any) {
        console.error('Error fetching appointment:', error);
        return null;
    }
};

/**
 * Fix ACLs for all appointments (Migration tool)
 * Grants write access to Director role for all existing appointments
 */
export const fixAllACLs = async (): Promise<number> => {
    try {
        const Appointment = Parse.Object.extend('Appointment');
        const query = new Parse.Query(Appointment);
        query.limit(1000);
        const results = await query.find();

        let count = 0;
        for (const appointment of results) {
            const acl = appointment.getACL() || new Parse.ACL();
            let changed = false;

            // Add all potential roles
            const roles = ['Director', 'Directeur', 'Secretary', 'Secretaire', 'Admin', 'Administrateur'];

            for (const role of roles) {
                if (!acl.getRoleWriteAccess(role)) {
                    acl.setRoleWriteAccess(role, true);
                    changed = true;
                }
            }

            if (!acl.getPublicReadAccess()) {
                acl.setPublicReadAccess(true);
                changed = true;
            }

            if (changed) {
                appointment.setACL(acl);
                await appointment.save();
                count++;
            }
        }
        return count;
    } catch (error: any) {
        console.error('Error fixing ACLs:', error);
        throw new Error(error.message || 'Failed to fix ACLs');
    }
};

/**
 * Fix Roles and Permissions (Comprehensive Fix)
 * 1. Ensures Roles exist (Director, Secretary)
 * 2. Adds users to their respective Roles
 * 3. Fixes ACLs on all appointments
 */
export const fixRolesAndPermissions = async (): Promise<string> => {
    try {
        let log = '';

        // 1. Ensure Roles exist
        const roleNames = ['Director', 'Secretary'];
        for (const roleName of roleNames) {
            const roleQuery = new Parse.Query(Parse.Role);
            roleQuery.equalTo('name', roleName);
            let role = await roleQuery.first();

            if (!role) {
                const roleACL = new Parse.ACL();
                roleACL.setPublicReadAccess(true);
                roleACL.setPublicWriteAccess(false); // Only admins should write roles, but we'll leave it restricted

                role = new Parse.Role(roleName, roleACL);
                await role.save();
                log += `Created role: ${roleName}\n`;
            }
        }

        // 2. Add Users to Roles
        const userQuery = new Parse.Query(Parse.User);
        userQuery.limit(1000);
        const users = await userQuery.find();

        for (const user of users) {
            const userRole = user.get('role'); // 'Director' or 'Secretary' string field

            if (userRole === 'Director' || userRole === 'Directeur') {
                const roleQuery = new Parse.Query(Parse.Role);
                roleQuery.equalTo('name', 'Director');
                const role = await roleQuery.first();
                if (role) {
                    role.getUsers().add(user);
                    await role.save();
                    log += `Added user ${user.get('username')} to Director role\n`;
                }
            } else if (userRole === 'Secretary' || userRole === 'Secretaire') {
                const roleQuery = new Parse.Query(Parse.Role);
                roleQuery.equalTo('name', 'Secretary');
                const role = await roleQuery.first();
                if (role) {
                    role.getUsers().add(user);
                    await role.save();
                    log += `Added user ${user.get('username')} to Secretary role\n`;
                }
            }
        }

        // 3. Fix ACLs
        const aclCount = await fixAllACLs();
        log += `Fixed ACLs for ${aclCount} appointments.\n`;

        return log;
    } catch (error: any) {
        console.error('Error fixing roles and permissions:', error);
        throw new Error(error.message || 'Failed to fix roles and permissions');
    }
};
