const nodemailer = require('nodemailer');

module.exports = {
    async sendEmail(to, subject, html) {
        try {
            // Clean and validate variables
            const user = (process.env.GMAIL_USER || '').replace(/['"]/g, '').trim();
            const pass = (process.env.GMAIL_APP_PASSWORD || '').replace(/['"]/g, '').trim();

            if (!user || !pass) {
                console.log('⚠️ GMAIL credentials not configured correctly.');
                return { success: false, message: 'Credentials not configured' };
            }

            // Create transporter on-demand to ensure fresh env variables
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user, pass }
            });

            const mailOptions = {
                from: `"PetPass" <${user}>`,
                to: to,
                subject: subject,
                html: html
            };

            const info = await transporter.sendMail(mailOptions);
            console.log('✅ Email sent successfully via Gmail:', info.messageId);
            return info;
        } catch (error) {
            console.error('❌ Gmail send error:', error);
            throw error;
        }
    },

    async sendQRScanNotification(ownerEmail, petName, latitude, longitude) {
        const subject = `🚨 ¡Alerta! El QR de ${petName} ha sido escaneado`;

        let mapHtml = '';
        if (latitude && longitude) {
            // Yandex expects longitude,latitude
            const staticMapUrl = `https://static-maps.yandex.ru/1.x/?l=map&ll=${longitude},${latitude}&z=16&size=600,300&pt=${longitude},${latitude},pm2rdm`;
            const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

            mapHtml = `
                <div style="margin: 20px 0; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background-color: #f3f4f6;">
                    <a href="${googleMapsLink}" style="text-decoration: none; display: block;">
                        <img src="${staticMapUrl}" alt="Mapa de ubicación" width="600" style="width: 100%; max-width: 600px; height: auto; display: block; border: 0;">
                    </a>
                </div>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 12px; text-align: center; margin: 20px 0;">
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #4b5563;">📍 Ubicación detectada:</p>
                    <a href="${googleMapsLink}" style="display: inline-block; background: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Ver en Google Maps</a>
                </div>
            `;
        } else {
            mapHtml = `
                <div style="background: #fef2f2; border: 1px dashed #ef4444; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
                    <p style="margin: 0; color: #b91c1c; font-size: 14px;">📍 Ubicación pendiente...</p>
                    <p style="margin: 5px 0 0 0; color: #7f1d1d; font-size: 12px;">Estamos esperando que el navegador del rescatista nos comparta la ubicación exacta.</p>
                </div>
            `;
        }

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0;">
                <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 20px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <span style="font-size: 48px;">🐾</span>
                        <h1 style="color: #111827; margin: 10px 0 0 0; font-size: 24px; font-weight: 800;">Alerta PetPass</h1>
                    </div>
                    
                    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
                        <p style="margin: 0; color: #92400e; font-weight: 600;">⚠️ Notificación de Emergencia</p>
                        <p style="margin: 4px 0 0 0; color: #b45309; font-size: 14px;">El código QR de <strong>${petName}</strong> ha sido escaneado.</p>
                    </div>

                    ${mapHtml}

                    <div style="background: #ffffff; border: 1px solid #f3f4f6; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
                        <h2 style="margin: 0 0 16px 0; color: #374151; font-size: 16px; font-weight: 700;">Consejos Rápidos:</h2>
                        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #4b5563;">
                            <li style="margin-bottom: 8px;">Mantén tu teléfono cerca, alguien podría intentar llamarte.</li>
                            <li style="margin-bottom: 8px;">Revisa tu perfil de PetPass para asegurarte de que tus datos de contacto estén actualizados.</li>
                            <li>Si tu mascota está contigo, puedes ignorar esta alerta.</li>
                        </ul>
                    </div>

                    <div style="text-align: center;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}" style="color: #6b7280; text-decoration: underline; font-size: 12px;">Ir al Panel de Control</a>
                    </div>

                    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #f3f4f6; text-align: center;">
                        <p style="margin: 0; color: #9ca3af; font-size: 12px;">Desarrollado con ❤️ por PetPass Team</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        console.log(`[v2] 📧 Sending QR scan notification via Gmail to ${ownerEmail} for pet ${petName} (Map: ${latitude ? 'Yes' : 'No'})`);
        return await this.sendEmail(ownerEmail, subject, html);
    }
};
