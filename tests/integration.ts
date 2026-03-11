import * as dotenv from 'dotenv';
dotenv.config();

import BayseClient from '../src/index';

const bayse = new BayseClient({
    publicKey: process.env.BAYSE_PUBLIC_KEY ?? '',
    secretKey: process.env.BAYSE_SECRET_KEY ?? '',
});

async function runIntegrationTest() {
    console.log('\n🚀 Bayse SDK — Integration Test\n');

    try {
        // Step 1: Find an open AMM market
        console.log('📡 Step 1: Finding an open AMM market...');
        const { events } = await bayse.events.getAll({ status: 'open', size: 20 });

        // Find the first event that uses AMM engine
        const ammEvent = events.find(e => e.engine === 'AMM');
        if (!ammEvent) throw new Error('No open AMM markets found');



        // Each event has markets inside it — grab the first one
        const market = ammEvent.markets[1];
        console.log(`✅ Found: "${ammEvent.title}"`);
        console.log(`   Event ID: ${ammEvent.id}`);
        console.log(`   Market ID: ${market.id}`);
        console.log(`   YES price: ${market.outcome1Price} | NO price: ${market.outcome2Price}\n`);

        // Step 2: Get a quote
        console.log('📡 Step 2: Getting a quote...')
        const quote = await bayse.markets.getQuote(
            ammEvent.id,    // ← from Step 1
            market.id,      // ← from Step 1
            { side: 'BUY', outcome: 'YES', amount: 100, currency: 'NGN' }
        );
        console.log(`✅ Quote received:`);
        console.log(`   Shares you'll get: ${quote.quantity}`);
        console.log(`   Price per share:   ₦${quote.price}`);
        console.log(`   Total cost:        ₦${quote.costOfShares}`);
        console.log(`   Potential profit:  ${quote.profitPercentage.toFixed(2)}%\n`);


        // Step 3: Place order
        console.log('📡 Step 3: Placing order...')
        const order = await bayse.orders.place(
            ammEvent.id,    // ← from Step 1
            market.id,      // ← from Step 1
            { side: 'BUY', outcome: 'YES', amount: 100, currency: 'NGN' }
        )
        console.log(`✅ Order placed: ${order.ammOrder?.id}`)
        // Step 4: Check portfolio
        console.log('Checking your Portfolio')
        const port = await bayse.portfolio.getPositions()
        console.log(`Your Current Portfolio positions:`)
        console.log(JSON.stringify(port, null, 2))

        // Step 5: Check wallet
        console.log('📡 Step 5: Checking wallet...');
        const { assets } = await bayse.wallet.getAssets();
        console.log(`✅ Balances (${assets.length} assets):`);
        assets.forEach(asset => {
            console.log(`   ${asset.symbol}: ${asset.availableBalance} available / ${asset.pendingBalance} pending`);
        });
    } catch (error: unknown) {
        console.error('❌  Integration test failed:\n');
        console.error(error);
        console.log('\n💡  Check that your .env keys are correct and you have internet access.\n');
        process.exit(1);
    }

}

runIntegrationTest();