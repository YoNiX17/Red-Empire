// Vercel Serverless Function - Proxy pour Henrik Valorant API
// La clé API est stockée dans les variables d'environnement Vercel

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Get the endpoint from query params
    const { endpoint } = req.query;

    if (!endpoint) {
        return res.status(400).json({ error: 'Missing endpoint parameter' });
    }

    // Get API key from environment variable
    const apiKey = process.env.HENRIK_API_KEY;

    if (!apiKey) {
        console.error('HENRIK_API_KEY not configured in Vercel environment variables');
        return res.status(500).json({ error: 'API key not configured' });
    }

    try {
        // Build the Henrik API URL
        const separator = endpoint.includes('?') ? '&' : '?';
        const url = `https://api.henrikdev.xyz${endpoint}${separator}api_key=${apiKey}`;

        console.log(`Proxying request to: ${endpoint}`);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        const data = await response.json();

        // Forward the response with the same status
        return res.status(response.status).json(data);

    } catch (error) {
        console.error('Proxy error:', error);
        return res.status(500).json({ 
            error: 'Proxy error', 
            message: error.message 
        });
    }
}
