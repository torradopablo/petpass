const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars
const envPath = path.resolve(__dirname, '../.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('Error loading .env file:', result.error);
} else {
    console.log('Loaded .env from:', envPath);
}

console.log('DEBUG: SUPABASE_URL is', process.env.SUPABASE_URL ? 'PRESENT' : 'MISSING');

const envContent = `window.env = {
    SUPABASE_URL: '${process.env.SUPABASE_URL || ""}',
    SUPABASE_ANON_KEY: '${process.env.SUPABASE_ANON_KEY || ""}',
    STRIPE_PUBLIC_KEY: '${process.env.STRIPE_PUBLIC_KEY || ""}'
};`;

const outputPath = path.join(__dirname, '../frontend/js/env.js');

fs.writeFileSync(outputPath, envContent);
console.log('Generated frontend/js/env.js');
