import Parse from 'parse';

// Initialize Parse SDK with Back4App credentials
if (typeof window !== 'undefined') {
    Parse.initialize(
        process.env.NEXT_PUBLIC_BACK4APP_APP_ID!,
        process.env.NEXT_PUBLIC_BACK4APP_JS_KEY!
    );
    Parse.serverURL = process.env.NEXT_PUBLIC_BACK4APP_SERVER_URL!;
    // Construct LiveQuery URL from App ID (standard Back4App pattern)
    Parse.liveQueryServerURL = `wss://${process.env.NEXT_PUBLIC_BACK4APP_APP_ID}.back4app.io`;
}

export default Parse;
