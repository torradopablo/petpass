const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

dotenv.config();

const app = express();
const port = 3001;

// Middleware to handle raw body for Stripe webhooks
app.use('/api/webhooks', bodyParser.raw({ type: 'application/json' }));
app.use(express.json());

// Mock Vercel environment for controllers
const mockReqRes = (handler) => async (req, res) => {
    const vercelRes = {
        status: (code) => {
            res.status(code);
            return vercelRes;
        },
        json: (data) => res.json(data),
        send: (data) => res.send(data),
        setHeader: (name, value) => res.setHeader(name, value),
        end: () => res.end()
    };
    try {
        await handler(req, vercelRes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// Routes
const paymentsHandler = require('./api/payments');
const webhooksHandler = require('./api/webhooks');
const petsHandler = require('./api/pets');
const scansHandler = require('./api/scans');

app.post('/api/payments', mockReqRes(paymentsHandler));
app.post('/api/webhooks', mockReqRes(webhooksHandler));
app.get('/api/pets', mockReqRes(petsHandler));
app.post('/api/scans', mockReqRes(scansHandler));

// Serve frontend
app.use(express.static('frontend'));

app.listen(port, () => {
    console.log(`Local server running at http://localhost:${port}`);
});
