export default {
  async fetch(request, env) {
    // Only accept POST requests
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      // Parse the JSON from the frontend
      const body = await request.json();
      const { firstName, lastName, email, message } = body;

      // Validate all fields
      if (!firstName || !lastName || !email || !message) {
        return new Response(
          JSON.stringify({ success: false, error: 'All fields are required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Build the message
      const fullName = `${firstName} ${lastName}`;
      const telegramText = 
        `📩 *New Contact Message*\n\n` +
        `👤 *Name:* ${fullName}\n` +
        `📧 *Email:* ${email}\n` +
        `💬 *Message:*\n${message}\n\n` +
        `— VKL Trucking Contact Form`;

      // Send to Telegram using the SECRET token
      const telegramResponse = await fetch(
        `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: env.TELEGRAM_CHAT_ID,
            text: telegramText,
            parse_mode: 'Markdown',
          }),
        }
      );

      const data = await telegramResponse.json();

      // Return success or failure to the frontend
      if (data.ok) {
        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      } else {
        return new Response(
          JSON.stringify({ success: false, error: 'Telegram API error' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } catch (error) {
      return new Response(
        JSON.stringify({ success: false, error: 'Server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
};
