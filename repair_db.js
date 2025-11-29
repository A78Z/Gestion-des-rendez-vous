const Parse = require('parse/node');

const appId = 'UbyWcLeLBxA1epUIaDcskv3PVNOo9xeJLeXCxiwA';
const jsKey = 'ZuL9GI5YOrkjxW3sZM0pze7GUs07fvTpoo2XDChn';
const masterKey = '2zHkPuVl9GBNFpNR8OPAVgohWGuAYch7cXinOGLS';
const serverURL = 'https://parseapi.back4app.com';

Parse.initialize(appId, jsKey, masterKey);
Parse.serverURL = serverURL;

async function repair() {
    console.log('Starting repair with Master Key...');
    try {
        // 1. Ensure Roles exist
        const roleNames = ['Director', 'Secretary'];
        for (const roleName of roleNames) {
            const roleQuery = new Parse.Query(Parse.Role);
            roleQuery.equalTo('name', roleName);
            let role = await roleQuery.first({ useMasterKey: true });

            if (!role) {
                const roleACL = new Parse.ACL();
                roleACL.setPublicReadAccess(true);
                roleACL.setPublicWriteAccess(false);

                role = new Parse.Role(roleName, roleACL);
                await role.save(null, { useMasterKey: true });
                console.log(`Created role: ${roleName}`);
            } else {
                console.log(`Role exists: ${roleName}`);
            }
        }

        // 2. Add Users to Roles
        const userQuery = new Parse.Query(Parse.User);
        userQuery.limit(1000);
        const users = await userQuery.find({ useMasterKey: true });
        console.log(`Found ${users.length} users.`);

        for (const user of users) {
            const userRole = user.get('role');
            console.log(`Processing user ${user.get('username')} (${userRole})`);

            if (userRole === 'Director' || userRole === 'Directeur' || userRole === 'Admin' || userRole === 'Administrateur') {
                const roleQuery = new Parse.Query(Parse.Role);
                roleQuery.equalTo('name', 'Director');
                const role = await roleQuery.first({ useMasterKey: true });
                if (role) {
                    role.getUsers().add(user);
                    await role.save(null, { useMasterKey: true });
                    console.log(`  -> Added to Director role`);
                }
            } else if (userRole === 'Secretary' || userRole === 'Secretaire') {
                const roleQuery = new Parse.Query(Parse.Role);
                roleQuery.equalTo('name', 'Secretary');
                const role = await roleQuery.first({ useMasterKey: true });
                if (role) {
                    role.getUsers().add(user);
                    await role.save(null, { useMasterKey: true });
                    console.log(`  -> Added to Secretary role`);
                }
            }
        }

        // 3. Fix ACLs on Appointments
        const Appointment = Parse.Object.extend('Appointment');
        const query = new Parse.Query(Appointment);
        query.limit(1000);
        const results = await query.find({ useMasterKey: true });
        console.log(`Found ${results.length} appointments.`);

        let count = 0;
        for (const appointment of results) {
            const acl = new Parse.ACL();
            acl.setPublicReadAccess(true);
            acl.setRoleWriteAccess('Director', true);
            acl.setRoleWriteAccess('Secretary', true);

            // Also add specific user write access if createdBy exists
            const createdBy = appointment.get('createdBy');
            if (createdBy && createdBy.id) {
                acl.setWriteAccess(createdBy.id, true);
            }

            appointment.setACL(acl);
            await appointment.save(null, { useMasterKey: true });
            count++;
        }
        console.log(`Fixed ACLs for ${count} appointments.`);
        console.log('Repair complete!');

    } catch (error) {
        console.error('Error during repair:', error);
    }
}

repair();
