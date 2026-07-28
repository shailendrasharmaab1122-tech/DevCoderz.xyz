export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { path } = req.query;

    if (!path) {
        return res.status(400).json({ error: 'Path parameter is missing' });
    }

    const targetUrl = `https://api.thescholarverse.site/nexttoppers/${Array.isArray(path) ? path.join('/') : path}`;
    
    const queryParams = new URLSearchParams(req.query);
    queryParams.delete('path');
    const queryString = queryParams.toString();
    const finalUrl = queryString ? `${targetUrl}?${queryString}` : targetUrl;

    try {
        const apiResponse = await fetch(finalUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });

        const contentType = apiResponse.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
            const data = await apiResponse.json();
            return res.status(apiResponse.status).json(data);
        } else {
            const buffer = await apiResponse.arrayBuffer();
            res.setHeader('Content-Type', contentType);
            return res.status(apiResponse.status).send(Buffer.from(buffer));
        }
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch via proxy', details: error.message });
    }
}
