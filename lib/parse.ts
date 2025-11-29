import Parse from 'parse';

// Initialize Parse SDK with Back4App credentials
if (typeof window !== 'undefined') {
    const appId = process.env.NEXT_PUBLIC_BACK4APP_APP_ID;
    const jsKey = process.env.NEXT_PUBLIC_BACK4APP_JS_KEY;
    const serverUrl = process.env.NEXT_PUBLIC_BACK4APP_SERVER_URL;

    if (!appId || !jsKey || !serverUrl) {
        console.error('Missing Back4App environment variables. Please check your .env.local or Vercel settings.');
    } else {
        Parse.initialize(appId, jsKey);
        Parse.serverURL = serverUrl;
        // Construct LiveQuery URL from App ID (standard Back4App pattern)
        Parse.liveQueryServerURL = `wss://${appId}.back4app.io`;
    }
}

export default Parse;
