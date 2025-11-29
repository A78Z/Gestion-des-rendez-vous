const Parse = require('parse/node');

const APP_ID = 'UbyWcLeLBxA1epUIaDcskv3PVNOo9xeJLeXCxiwA';
const JS_KEY = 'ZuL9GI5YOrkjxW3sZM0pze7GUs07fvTpoo2XDChn';
const SERVER_URL = 'https://parseapi.back4app.com';

Parse.initialize(APP_ID, JS_KEY);
Parse.serverURL = SERVER_URL;

async function fixACLs() {
    console.log('Starting ACL fix...');

    try {
        // Log in as Secretary to have some permissions (if CLP allows)
        // Note: Ideally this should be done with Master Key, but we use what we have.
        // If this fails, the user needs to set CLP in Dashboard.
        await Parse.User.logIn('secretaire', 'Secret@123');
        console.log('Logged in as secretaire');

        const Appointment = Parse.Object.extend('Appointment');
        const query = new Parse.Query(Appointment);
        query.limit(1000);
        const appointments = await query.find();

        console.log(`Found ${appointments.length} appointments.`);

        let updatedCount = 0;
        let errorCount = 0;

        for (const apt of appointments) {
            const acl = apt.getACL() || new Parse.ACL();

            // Check if Secretary role already has write access
            if (!acl.getRoleWriteAccess('Secretary')) {
                acl.setPublicReadAccess(true);
                acl.setRoleWriteAccess('Secretary', true);
                apt.setACL(acl);

                try {
                    await apt.save();
                    process.stdout.write('.');
                    updatedCount++;
                } catch (err) {
                    process.stdout.write('x');
                    errorCount++;
                    // console.error(`Failed to update ${apt.id}: ${err.message}`);
                }
            }
        }

        console.log('\n---');
        console.log(`ACL Fix Complete.`);
        console.log(`Updated: ${updatedCount}`);
        console.log(`Errors: ${errorCount}`);

        if (errorCount > 0) {
            console.log('NOTE: Some updates failed. This is likely because the current user does not have permission to modify these specific records.');
            console.log('Please go to Back4App Dashboard > Core > Security > Class Level Permissions for "Appointment" and ensure "Write" is enabled for "Secretary" role or Public.');
        }

    } catch (error) {
        console.error('Script error:', error);
    }
}

fixACLs();
