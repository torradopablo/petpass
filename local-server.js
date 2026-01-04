const app = require('./backend/app');
const express = require('express');
const path = require('path');

const port = 3001;

// Serve frontend
app.use(express.static('frontend'));

// Simple fallback
app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.listen(port, () => {
    console.log(`Local server running at http://localhost:${port}`);
});
