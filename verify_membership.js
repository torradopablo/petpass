
const Plans = require('./backend/config/Plans');
const DolarService = require('./backend/services/DolarService');

async function verify() {
    console.log('--- Verifying Membership Management ---');

    console.log('\n1. Verifying Plans Config:');
    console.log('Gratis max pets:', Plans.GRATIS.maxPets);
    console.log('Básico monthly price USD:', Plans.BASICO.priceUSD.monthly);
    console.log('Premium annual price USD:', Plans.PREMIUM.priceUSD.annual);

    console.log('\n2. Verifying DolarService:');
    try {
        const rate = await DolarService.getExchangeRate();
        console.log('Current Exchange Rate (Blue):', rate);

        const basicMonthlyArs = await DolarService.convertUsdToArs(Plans.BASICO.priceUSD.monthly);
        console.log(`Basic Monthly ($5 USD) in ARS: ${basicMonthlyArs}`);
    } catch (e) {
        console.error('DolarService verification failed:', e.message);
    }

    console.log('\nVerification script finished.');
}

verify().catch(console.error);
