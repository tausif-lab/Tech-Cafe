import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOrderReadyEmail(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  pickupTime: string,
  pickupDate: string,
  cafeName: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: customerEmail, // change to your email
      
      subject: `Your Order #${orderNumber} is Ready! 🎉`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background-color: #000; color: #fff; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background-color: #18181b; border-radius: 12px; padding: 30px; }
              .header { text-align: center; margin-bottom: 30px; }
              .title { font-size: 28px; font-weight: bold; color: #eab308; margin-bottom: 10px; }
              .status-badge { display: inline-block; background-color: #16a34a; color: white; padding: 8px 20px; border-radius: 20px; font-weight: bold; }
              .order-details { background-color: #27272a; border-radius: 8px; padding: 20px; margin: 20px 0; }
              .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #3f3f46; }
              .detail-row:last-child { border-bottom: none; }
              .label { color: #a1a1aa; }
              .value { color: #fff; font-weight: bold; }
              .pickup-info { background-color: #854d0e; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
              .pickup-time { font-size: 24px; font-weight: bold; color: #fbbf24; }
              .footer { text-align: center; margin-top: 30px; color: #71717a; font-size: 14px; }
              .button { display: inline-block; background-color: #eab308; color: #000; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="title">Order Ready! 🎉</div>
                <span class="status-badge">READY FOR PICKUP</span>
              </div>
              
              <p>Hi ${customerName},</p>
              <p>Great news! Your order is ready and waiting for you at ${cafeName}.</p>
              
              <div class="pickup-info">
                <p style="margin: 0; color: #fbbf24; font-size: 14px;">PICKUP TIME</p>
                <div class="pickup-time">${pickupDate} at ${pickupTime}</div>
              </div>
              
              <div class="order-details">
                <div class="detail-row">
                  <span class="label">Order Number</span>
                  <span class="value">#${orderNumber}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Status</span>
                  <span class="value" style="color: #16a34a;">Ready for Pickup</span>
                </div>
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders" class="button">
                  Track Your Order
                </a>
              </div>
              
              <div class="footer">
                <p>Thank you for ordering from ${cafeName}!</p>
                <p>If you have any questions, please don't hesitate to contact us.</p>
              </div>
            </div>
          </body>
        </html>
      `
    })

    if (error) {
      console.error('Email send error:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Email send exception:', error)
    return { success: false, error }
  }
}