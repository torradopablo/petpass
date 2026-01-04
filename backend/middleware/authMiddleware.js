const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

module.exports = async (req, res, next) => {
    try {
        console.log('Auth middleware - Request headers:', Object.keys(req.headers));
        console.log('Auth middleware - Authorization header:', req.headers.authorization ? 'PRESENT' : 'MISSING');
        
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.log('Auth middleware - No authorization header found');
            return res.status(401).json({ error: 'Missing Authorization header' });
        }

        const token = authHeader.replace('Bearer ', '');
        console.log('Auth middleware - Token length:', token.length);
        console.log('Auth middleware - Validating token with Supabase...');
        
        const { data: { user }, error } = await supabase.auth.getUser(token);
        console.log('Auth middleware - Supabase response user:', user ? 'PRESENT' : 'MISSING');
        console.log('Auth middleware - Supabase response error:', error ? error.message : 'NONE');

        if (error || !user) {
            console.log('Auth middleware - Authentication failed');
            return res.status(401).json({ error: 'Invalid token' });
        }

        console.log('Auth middleware - Authentication successful for user:', user.email);
        req.user = user;
        next();
    } catch (err) {
        console.error('Auth Middleware Error:', err);
        res.status(500).json({ error: 'Internal Server Error during authentication' });
    }
};
