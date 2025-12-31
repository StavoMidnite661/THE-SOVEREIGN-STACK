
import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is missing. Email service will run in mock mode.');
}

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export const mailService = {
    async sendReceipt(to: string, amount: number, orderId: string, txHash?: string, merchant?: string) {
        if (!resend) {
            console.log(`[MOCK EMAIL] To: ${to}, Subject: Receipt for Order ${orderId}`);
            return { success: true, mocked: true };
        }

        try {
            const { data, error } = await resend.emails.send({
                from: 'SOVR Credit <receipts@resend.dev>', // Use resend.dev for testing unless verified domain exists
                to: [to],
                subject: `Payment Receipt: $${amount} at ${merchant || 'SOVR Merchant'}`,
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <div style="text-align: center; margin-bottom: 30px;">
               <h1 style="color: #f97316;">SOVR Credit</h1>
            </div>
            
            <div style="background: #f4f4f5; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
              <h2 style="margin-top: 0;">Payment Confirmed</h2>
              <p style="font-size: 16px; color: #666;">Your transaction was successful.</p>
              
              <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">Amount</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold;">$${amount.toFixed(2)} USD</td>
                </tr>
                 <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">Merchant</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #ddd; text-align: right;">${merchant}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">Order ID</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #ddd; text-align: right; font-family: monospace;">${orderId}</td>
                </tr>
              </table>
            </div>

            <p style="text-align: center; font-size: 14px; color: #888;">
              Ref: ${txHash || 'Off-chain Settlement'} <br/>
              <a href="https://sovr.credit" style="color: #f97316;">View in Dashboard</a>
            </p>
          </div>
        `,
            });

            if (error) {
                console.error('Resend Error:', error);
                return { success: false, error };
            }

            console.log(`[EMAIL SENT] Receipt to ${to} for order ${orderId}`);
            return { success: true, data };

        } catch (err) {
            console.error('Email Service Exception:', err);
            return { success: false, error: err };
        }
    }
};
