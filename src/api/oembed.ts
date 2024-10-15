import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  // Mock oEmbed response
  const oEmbedResponse = {
    version: '1.0',
    type: 'rich',
    provider_name: 'YourAppName',
    provider_url: 'https://solana-wallet-dashboard-sand.vercel.app/',
    title: 'Dashboard Wallet',
    html: '<iframe src="https://solana-wallet-dashboard-sand.vercel.app" width="600" height="400"></iframe>',
    width: 600,
    height: 400,
  };

  res.status(200).json(oEmbedResponse);
}
