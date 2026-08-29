const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {

    // Handle browser CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // Only accept POST requests
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        {
          status: 405,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    try {
      const body = await request.json();
      const { firstName, lastName, email, message } = body;

      // Validate fields
      if (!firstName || !lastName || !email || !message) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'All fields are required',
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }

      const fullName = `${firstName} ${lastName}`;

      const telegramText =
        `📩 *New Contact Message*\n\n` +
        `👤 *Name:* ${fullName}\n` +
        `📧 *Email:* ${email}\n` +
        `💬 *Message:*\n${message}\n\n` +
        `— VKL Trucking Contact Form`;

      // Send to Telegram
      const telegramResponse = await fetch(
        `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: env.TELEGRAM_CHAT_ID,
            text: telegramText,
            parse_mode: 'Markdown',
          }),
        }
      );

      const data = await telegramResponse.json();

      if (data.ok) {
        return new Response(
          JSON.stringify({ success: true }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Telegram API error',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );

    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Server error',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }
  },
};
