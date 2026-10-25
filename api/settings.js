module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const ca = process.env.TOKEN_CA || 'GCN58WHB85WJ2kt3vwsmNUs8yhLTQNGcFguP77AKpump';
  const twitter = process.env.TWITTER_URL || 'https://x.com/SydneeSwenee';
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
    community: twitter,
    dex: isPlaceholder ? '' : (process.env.DEX_URL || `https://pump.fun/coin/GCN58WHB85WJ2kt3vwsmNUs8yhLTQNGcFguP77AKpump`),
    chart: isPlaceholder ? '' : (process.env.CHART_URL || 'https://dexscreener.com/solana/CSD2QjUDK9AUVUm9voHZLB83scH9ZQP4nJWwiQyh5Tmz?embed=1&theme=dark&trades=0&info=0'),
    pair: isPlaceholder ? '' : 'CSD2QjUDK9AUVUm9voHZLB83scH9ZQP4nJWwiQyh5Tmz'
  });
};
