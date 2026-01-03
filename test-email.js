require('dotenv').config();
const nodemailer = require('nodemailer');

async function testGmail() {
    const user = (process.env.GMAIL_USER || '').replace(/['"]/g, '').trim();
    const pass = (process.env.GMAIL_APP_PASSWORD || '').replace(/['"]/g, '').trim();

    console.log('--- Debug Gmail Config ---');
    console.log('User:', user || 'MISSING');
    console.log('Pass Length:', pass.length);
    console.log('Pass has spaces:', pass.includes(' '));
    console.log('---------------------------');

    if (!user || !pass) {
        console.error('Missing credentials');
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass }
    });

    try {
        console.log('Attempting to verify transporter...');
        await transporter.verify();
        console.log('✅ Success! Credentials are correct.');
    } catch (error) {
        console.error('❌ Failed!');
        console.error(error.message);
        if (error.message.includes('534-5.7.9')) {
            console.log('\nCONSEJO: Google dice que NO es un App Password. Asegúrate de que copiaste el código de 16 letras del cuadro amarillo, NO tu clave de siempre.');
        }
    }
}

testGmail();
