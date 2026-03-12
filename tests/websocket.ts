import * as dotenv from 'dotenv';
dotenv.config();

import BayseClient from '../src/index';

const bayse = new BayseClient({
    publicKey: process.env.BAYSE_PUBLIC_KEY ?? '',
    secretKey: process.env.BAYSE_SECRET_KEY ?? '',
});

async function runWebSocketTest() {
    console.log('\n🔌 Bayse SDK — WebSocket Test\n');

    // Step 1: Find a real event ID to subscribe to
    console.log('📡 Finding an open event to subscribe to...');
    const { events } = await bayse.events.getAll({ status: 'open', size: 5 });

    if (events.length === 0) throw new Error('No open events found');

    const event = events[0];
    const market = event.markets[0];

    console.log(`✅ Subscribing to: "${event.title}"`);
    console.log(`   Event ID: ${event.id}`);
    console.log(`   Market ID: ${market.id}\n`);

    // Step 2: Test markets stream
    console.log('📡 Connecting to markets stream...\n');
    const marketsStream = bayse.stream.markets();
    marketsStream.connect();

    // Subscribe to prices
    marketsStream.subscribePrices(event.id, (data) => {
        console.log('💰 Price update received:');
        console.log(JSON.stringify(data, null, 2));
    });

    // Subscribe to activity
    marketsStream.subscribeActivity(event.id, (data) => {
        console.log('🔔 Trade activity received:');
        console.log(JSON.stringify(data, null, 2));
    });

    // Step 3: Test realtime stream — USD/NGN rate
    console.log('📡 Connecting to realtime stream (USD/NGN rate)...\n');
    const realtimeStream = bayse.stream.realtime();
    realtimeStream.connect();

    realtimeStream.subscribeAssetPrices(['USDNGN'], (data) => {
        console.log('🇳🇬 USD/NGN rate update:');
        console.log(JSON.stringify(data, null, 2));
    });

    // Step 4: Listen for 30 seconds then clean up
    console.log('👂 Listening for 30 seconds...\n');

    await new Promise(resolve => setTimeout(resolve, 30000));

    console.log('\n🧹 Cleaning up...');
    marketsStream.disconnect();
    realtimeStream.disconnect();

    console.log('✅ WebSocket test complete.\n');
    process.exit(0);
}

runWebSocketTest().catch((error) => {
    console.error('❌ WebSocket test failed:', error);
    process.exit(1);
});