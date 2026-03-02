import { verifySession } from '../_lib/auth.js';

export default function handler(req, res) {
  const session = verifySession(req);

  if (!session) {
    // Clear possibly stale cookie
    res.setHeader('Set-Cookie', 'session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');
    return res.status(200).json({ authenticated: false, user: null });
  }

  return res.status(200).json({
    authenticated: true,
    user: {
      id: session.sub,
      username: session.username,
      avatar: session.avatar,
      globalName: session.globalName,
      guildMember: session.guildMember,
      hasRequiredRole: session.hasRequiredRole,
    },
  });
}
