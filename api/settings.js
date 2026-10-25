module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const ca = process.env.TOKEN_CA || 'CommingSoon';
  const twitter = process.env.TWITTER_URL || 'https://x.com/SydneeSwenee';
  const telegram = process.env.TELEGRAM_URL || '';
  const isPlaceholder =
    /^comm?ing\s*soon$/i.test(String(ca).trim()) ||
    String(ca).trim().toLowerCase() === 'comingsoon' ||
    String(ca).trim().toLowerCase() === 'commingsonn';

  res.status(200).json({
    name: 'SYDNEE SWENEE',
    symbol: 'SWENEE',
    chain: 'Solana',
    ca,
    twitter,
    telegram,
    community: twitter,
    dex: isPlaceholder ? '' : (process.env.DEX_URL || `https://pump.fun/coin/${ca}`)
  });
};
