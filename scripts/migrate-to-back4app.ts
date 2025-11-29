import Parse from 'parse';

// Initialize Parse
// Replace with your actual keys if they are different
const APP_ID = 'UbyWcLeLBxA1epUIaDcskv3PVNOo9xeJLeXCxiwA';
const JS_KEY = 'ZuL9GI5YOrkjxW3sZM0pze7GUs07fvTpoo2XDChn';
const SERVER_URL = 'https://parseapi.back4app.com';

Parse.initialize(APP_ID, JS_KEY);
Parse.serverURL = SERVER_URL;

async function migrate() {
    console.log('Starting migration...');

    // Get data from localStorage
    // Note: This script needs to be run in the browser console where localStorage is accessible
    const data = localStorage.getItem('fdcuic_appointments');

    if (!data) {
        console.log('No data found in localStorage (fdcuic_appointments)');
        return;
    }

    let appointments;
    try {
        appointments = JSON.parse(data);
    } catch (e) {
        console.error('Error parsing localStorage data:', e);
        return;
    }

    console.log(`Found ${appointments.length} appointments to migrate`);

    let successCount = 0;
    let errorCount = 0;

    // Migrate each appointment
    for (const apt of appointments) {
        const Appointment = Parse.Object.extend('Appointment');
        const appointment = new Appointment();

        // Map fields
        appointment.set('date', apt.date);
        appointment.set('heure', apt.heure);
        appointment.set('interlocuteur', apt.interlocuteur);
        appointment.set('motif', apt.motif);
        appointment.set('lieu', apt.lieu);
        appointment.set('statut', apt.statut);
        appointment.set('commentaires', apt.commentaires || '');

        // Set createdBy if available (optional)
        // appointment.set('createdBy', currentUser);

        // Set ACL - Public read
        const acl = new Parse.ACL();
        acl.setPublicReadAccess(true);
        // acl.setWriteAccess(userId, true); // If you want to restrict write access
        appointment.setACL(acl);

        try {
            await appointment.save();
            console.log(`✅ Migrated: ${apt.interlocuteur} - ${apt.date}`);
            successCount++;
        } catch (error: any) {
            console.error(`❌ Error migrating appointment (${apt.interlocuteur}):`, error.message);
            errorCount++;
        }
    }

    console.log('-------------------');
    console.log(`Migration complete!`);
    console.log(`Success: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
}

// Expose migrate function to window so it can be called from console
(window as any).migrateToBack4App = migrate;

console.log('Migration script loaded. Run "migrateToBack4App()" to start migration.');
