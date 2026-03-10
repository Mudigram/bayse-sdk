// ============================================================
// Bayse SDK — Smoke Test
//
// Run this to confirm your SDK is working:
//   npx ts-node tests/smoke.ts
//
// Before running:
//   1. Open .env and paste in your real API keys
//   2. Make sure you're logged into Bayse and have generated
//      API keys from your account settings
// ============================================================

import * as dotenv from 'dotenv';
dotenv.config();

import BayseClient from '../src/index';

async function runSmokeTest() {
    console.log('\n🔑  Bayse SDK Smoke Test\n');

    // --- Step 1: Initialize the client -------------------------
    const bayse = new BayseClient({
        publicKey: process.env.BAYSE_PUBLIC_KEY ?? '',
        secretKey: process.env.BAYSE_SECRET_KEY ?? '',
    });

    console.log('✅  Client initialized');

    // --- Step 2: Fetch all open events -------------------------
    console.log('\n📡  Fetching open events...\n');

    try {
        const result = await bayse.events.getAll({
            status: 'open',
            size: 5,
        });

        console.log(`✅  Got ${result.events.length} events (${result.pagination.totalCount} total)\n`);

        // Print a summary of each event
        result.events.forEach((event, idx) => {
            console.log(`  ${idx + 1}. ${event.title}`);
            console.log(`     Category: ${event.category} | Engine: ${event.engine} | Markets: ${event.markets.length}`);

            // Show YES/NO prices for the first market
            if (event.markets.length > 0) {
                const m = event.markets[0];
                console.log(`     Prices → YES: ${m.outcome1Price} | NO: ${m.outcome2Price}`);
            }
            console.log();
        });

        // --- Step 3: Fetch a single event by ID ------------------
        if (result.events.length > 0) {
            const firstEventId = result.events[0].id;
            console.log(`📡  Fetching single event: ${firstEventId}...\n`);

            const singleEvent = await bayse.events.getById(firstEventId);
            console.log(`✅  Single event fetched: "${singleEvent.title}"`);
            console.log(`    Status: ${singleEvent.status} | Closing: ${singleEvent.closingDate}\n`);
        }

        console.log('🎉  Smoke test passed! Your SDK is working.\n');
        console.log('👉  Next step: paste the market IDs above into Day 6 tasks for the full module tests.\n');

    } catch (error: unknown) {
        console.error('❌  Smoke test failed:\n');
        console.error(error);
        console.log('\n💡  Check that your .env keys are correct and you have internet access.\n');
        process.exit(1);
    }
}

runSmokeTest();