import jwt from 'jsonwebtoken';
import { parseCookies } from '../_lib/auth.js';

export default async function handler(req, res) {
  try {
    const { code, state } = req.query;
    const cookies = parseCookies(req.headers.cookie);

    // Validate CSRF state
    if (!state || state !== cookies.discord_oauth_state) {
      return res.status(403).json({ error: 'Invalid OAuth state' });
    }

    // Clear the state cookie
    res.setHeader('Set-Cookie', [
      'discord_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0',
    ]);

    // Exchange code for access token
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI,
      }),
    });

    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      console.error('Token exchange failed:', text);
      return res.status(502).json({ error: 'Token exchange failed' });
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Fetch Discord user identity
    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) {
      return res.status(502).json({ error: 'Failed to fetch Discord user' });
    }

    const discordUser = await userRes.json();

    // Check guild membership using bot token
    let guildMember = false;
    let hasRequiredRole = false;
    let memberRoles = [];

    const memberRes = await fetch(
      `https://discord.com/api/guilds/${process.env.DISCORD_GUILD_ID}/members/${discordUser.id}`,
      { headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` } }
    );

    if (memberRes.ok) {
      const memberData = await memberRes.json();
      guildMember = true;
      memberRoles = memberData.roles || [];

      const allowedRoles = [
        process.env.DISCORD_ROLE_YOUNG_NINJA_ID,
        process.env.DISCORD_ROLE_FOUNDER_ID,
      ].filter(Boolean);

      hasRequiredRole = memberRoles.some(r => allowedRoles.includes(r));
    }

    // Sign JWT
    const payload = {
      sub: discordUser.id,
      username: discordUser.username,
      avatar: discordUser.avatar,
      globalName: discordUser.global_name,
      guildMember,
      hasRequiredRole,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Set session cookie + clear state cookie
    const cookieHeaders = res.getHeader('Set-Cookie') || [];
    res.setHeader('Set-Cookie', [
      ...cookieHeaders,
      `session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 60 * 60}`,
    ]);

    res.writeHead(302, { Location: '/' });
    res.end();
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
