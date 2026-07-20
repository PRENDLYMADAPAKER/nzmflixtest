const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Force open CORS so your front-end code can make requests without browser blocks
app.use(cors());
app.use(express.json());

const KISSKH_BASE = 'https://kisskh.do/api';

// 2. Proxy Route for Searching/Details
app.get('/api/proxy', async (req, res) => {
    try {
        const targetUrl = req.query.url;
        if (!targetUrl) return res.status(400).json({ error: 'Missing target url parameter' });

        // Make the request using backend headers to masquerade as an ordinary visitor
        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://kisskh.do/',
                'Origin': 'https://kisskh.do'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error("Proxy routing issue:", error.message);
        res.status(500).json({ error: 'Failed fetching upstream data' });
    }
});

// 3. Dedicated Route to Grab the Video Streams with required Auth Tokens
app.get('/api/stream-links', async (req, res) => {
    try {
        const { episodeId } = req.query;
        if (!episodeId) return res.status(400).json({ error: 'Missing episodeId' });

        // Build the authenticated server url string
        // Note: KissKH often changes the token implementation. A hardcoded valid token 
        // works temporarily, but an advanced scraper uses headless tools like Playwright to grab live tokens.
        const streamInfoUrl = `${KISSKH_BASE}/DramaList/Episode/Server?episodeId=${episodeId}&kkey=YOUR_KKEY_TOKEN`;

        const response = await axios.get(streamInfoUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://kisskh.do/'
            }
        });

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed resolving stream arrays' });
    }
});

app.listen(PORT, () => console.log(`NZM Proxy running on http://localhost:${PORT}`));
