module.exports = function handler(req, res) {
  res.status(200).json({ ok: true, env: !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY });
};
