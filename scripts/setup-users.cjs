const Parse = require('parse/node');

const APP_ID = 'UbyWcLeLBxA1epUIaDcskv3PVNOo9xeJLeXCxiwA';
const JS_KEY = 'ZuL9GI5YOrkjxW3sZM0pze7GUs07fvTpoo2XDChn';
const SERVER_URL = 'https://parseapi.back4app.com';

Parse.initialize(APP_ID, JS_KEY);
Parse.serverURL = SERVER_URL;

async function ensureUser(username, password, role, fullName) {
    console.log(`Checking user: ${username}...`);

    try {
        // Try to log in first
        const user = await Parse.User.logIn(username, password);
        console.log(`✅ User '${username}' logged in successfully.`);

        // Check if details need update
        if (user.get('role') !== role || user.get('fullName') !== fullName) {
            console.log(`Updating details for '${username}'...`);
            user.set('role', role);
            user.set('fullName', fullName);
            await user.save();
            console.log(`✅ User '${username}' updated.`);
        } else {
            console.log(`User '${username}' details are correct.`);
        }

        // Logout to clear session for next user
        await Parse.User.logOut();

    } catch (error) {
        // Error 101: Invalid username/password
        if (error.code === 101) {
            console.log(`Login failed for '${username}'. Attempting to create...`);

            try {
                const user = new Parse.User();
                user.set('username', username);
                user.set('password', password);
                user.set('role', role);
                user.set('fullName', fullName);

                await user.signUp();
                console.log(`✅ User '${username}' created successfully.`);

            } catch (createError) {
                // Error 202: Username already taken
                if (createError.code === 202) {
                    console.error(`❌ Error: User '${username}' exists but password does not match.`);
                    console.error(`   Please delete the user '${username}' from Back4App Dashboard manually so I can recreate it with the correct password.`);
                } else {
                    console.error(`❌ Error creating user '${username}':`, createError.message);
                }
            }
        } else {
            console.error(`❌ Error checking user '${username}':`, error.message);
        }
    }
}

async function main() {
    await ensureUser('secretaire', 'Secret@123', 'Secretary', 'Secrétaire FDCUIC');
    console.log('---');
    await ensureUser('directeur', 'Director@123', 'Director', 'Directeur Général');
}

main();
