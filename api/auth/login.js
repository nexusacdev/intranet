import crypto from 'crypto';

export default function handler(req, res) {
  const state = crypto.randomBytes(32).toString('hex');

  res.setHeader('Set-Cookie', `discord_oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`);

  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
    response_type: 'code',
    scope: 'identify',
    state,
  });

  res.writeHead(302, { Location: `https://discord.com/api/oauth2/authorize?${params}` });
  res.end();
}
