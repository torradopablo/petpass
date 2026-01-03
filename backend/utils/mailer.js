const nodemailer = require('nodemailer');

module.exports = {
    async sendEmail(to, subject, html) {
        try {
            const user = (process.env.GMAIL_USER || '').replace(/['"]/g, '').trim();
            const pass = (process.env.GMAIL_APP_PASSWORD || '').replace(/['"]/g, '').trim();

            if (!user || !pass) {
                console.warn('⚠️ GMAIL credentials not configured.');
                return { success: false, message: 'Credentials not configured' };
            }

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user, pass }
            });

            const mailOptions = {
                from: `"PetPass Protection" <${user}>`,
                to: to,
                subject: subject,
                html: html
            };

            const info = await transporter.sendMail(mailOptions);
            console.log('✅ Email sent:', info.messageId);
            return info;
        } catch (error) {
            console.error('❌ Email error:', error);
            throw error;
        }
    },

    async sendQRScanNotification(ownerEmail, petName, latitude, longitude) {
        const subject = `🚨 ALERTA: ${petName} ha sido escaneado`;

        let mapSection = '';
        if (latitude && longitude) {
            // Yandex expects longitude,latitude. lang=es_ES for Spanish maps.
            const staticMapUrl = `https://static-maps.yandex.ru/1.x/?l=map&ll=${longitude},${latitude}&z=16&size=600,300&pt=${longitude},${latitude},pm2rdm&lang=es_ES`;
            const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

            mapSection = `
                <div style="margin: 25px 0; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                    <a href="${googleMapsLink}" style="display: block; text-decoration: none;">
                        <img src="${staticMapUrl}" alt="Ubicación del escaneo" width="600" style="width: 100%; max-width: 600px; height: auto; display: block; border: 0;">
                        <div style="background-color: #f9fafb; padding: 12px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <span style="color: #4f46e5; font-weight: 600; font-size: 14px;">📍 Ver ubicación exacta en Google Maps →</span>
                        </div>
                    </a>
                </div>
            `;
        } else {
            mapSection = `
                <div style="background: #fffbeb; border: 1px dashed #f59e0b; padding: 24px; border-radius: 16px; text-align: center; margin: 25px 0;">
                    <p style="margin: 0; color: #92400e; font-weight: 600; font-size: 16px;">📍 Ubicación aproximada...</p>
                    <p style="margin: 8px 0 0 0; color: #b45309; font-size: 13px;">Estamos esperando que el rescatista comparta la ubicación precisa desde su navegador.</p>
                </div>
            `;
        }

        const html = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="utf-8">
                <style>
                    .btn:hover { background-color: #4338ca !important; }
                </style>
            </head>
            <body style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f3f4f6;">
                <div style="max-width: 600px; margin: 40px auto; padding: 0; border-radius: 24px; background-color: #ffffff; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 20px; text-align: center; color: #ffffff;">
                        <div style="font-size: 48px; margin-bottom: 10px;">🐾</div>
                        <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">Notificación de Escaneo</h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Tu mascota ha sido localizada</p>
                    </div>
                    
                    <div style="padding: 32px 24px;">
                        <div style="background: #fef2f2; border-radius: 12px; padding: 20px; border: 1px solid #fee2e2; margin-bottom: 24px;">
                            <p style="margin: 0; color: #991b1b; font-size: 15px;">
                                Hola, el código QR de <strong style="color: #b91c1c;">${petName}</strong> acaba de ser escaneado.
                            </p>
                        </div>

                        ${mapSection}

                        <div style="background: #ffffff; border: 1px solid #f3f4f6; padding: 24px; border-radius: 16px; margin-bottom: 32px;">
                            <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 700;">Pasos a seguir:</h2>
                            <div style="color: #4b5563; font-size: 15px;">
                                <div style="margin-bottom: 12px; display: flex;">
                                    <span style="color: #4f46e5; margin-right: 12px; font-weight: bold;">1.</span>
                                    <span>Mantén tu teléfono disponible para llamadas de números desconocidos.</span>
                                </div>
                                <div style="margin-bottom: 12px; display: flex;">
                                    <span style="color: #4f46e5; margin-right: 12px; font-weight: bold;">2.</span>
                                    <span>Verifica que tu información de contacto esté actualizada en el panel.</span>
                                </div>
                                <div style="display: flex;">
                                    <span style="color: #4f46e5; margin-right: 12px; font-weight: bold;">3.</span>
                                    <span>Si estás con tu mascota, puedes desestimar esta alerta.</span>
                                </div>
                            </div>
                        </div>

                        <div style="text-align: center;">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}" class="btn" style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 16px 32px; border-radius: 12px; font-weight: 700; text-decoration: none; font-size: 16px; transition: all 0.2s;">
                                Abrir Panel de Control
                            </a>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div style="padding: 32px 24px; background-color: #f9fafb; border-top: 1px solid #f3f4f6; text-align: center;">
                        <p style="margin: 0; color: #9ca3af; font-size: 13px;">
                            Este es un servicio de protección automatizado de <strong>PetPass</strong>.
                        </p>
                        <div style="margin-top: 16px; font-size: 12px; color: #d1d5db;">
                            &copy; 2026 PetPass Protection Team. Todos los derechos reservados.
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        return await this.sendEmail(ownerEmail, subject, html);
    }
};
