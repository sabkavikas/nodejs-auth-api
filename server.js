import http from 'http';
import url from 'url';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from './schema/userSchema.js';

const secretKey = 'SECRET123';

const server = http.createServer((req, res) => {
    // Set CORS headers to allow requests from any origin
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;

    if (path === '/signup' && req.method === 'POST') {
        handleSignup(req, res);
    } else if (path === '/login' && req.method === 'POST') {
        handleLogin(req, res);
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Not found' }));
    }
});

function connectDB() {
    return mongoose.connect("mongodb+srv://mern_practice:fqoUo73HyYCUS192@cluster0.0rzevgv.mongodb.net/node_api?retryWrites=true&w=majority");
}

const PORT = 4000; // Set the desired port for your server
server.listen(PORT, () => {
    connectDB()
        .then((response) => console.log('Database connected...',))
        .catch((error) => console.log('Error connecting database', error));
    console.log(`Server started on port ${PORT}`);
});


// Register new user
function handleSignup(req, res) {
    // Parse the incoming JSON data
    let body = '';
    req.on('data', (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const { name, email, password } = JSON.parse(body);

            const user = await User.findOne({ email });

            if (user && user.email === email) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Email already exists' }));
                return;
            }

            const newUser = await User.create({
                name, email, password
            });
            newUser.save();

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'User registered successfully' }));
        } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Invalid data' + error }));
        }
    });
}

// Login user and return JWT
function handleLogin(req, res) {
    // Parse the incoming JSON data
    let body = '';
    req.on('data', (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const { email, password } = JSON.parse(body);

            const user = await User.findOne({ email, password });

            if (!user) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Invalid credentials' }));
                return;
            }

            const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, secretKey, { expiresIn: '1h' });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ token }));
        } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Invalid data' + error }));
        }
    });
}





