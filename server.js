const ServerManager = require('./ServerManager');

const app = new ServerManager();


/* ================== MAIN PAGE ================== */
app.get('/', (req, res) => {
    app.serveStaticFile(res.socket, './index.html');
});


/* ================== LOGIN ================== */
const username = "admin";
const password = "123456"

// 1. Serve the login page when the user asks for the homepage
app.get('/login', (req, res) => {
    app.serveStaticFile(res.socket, './login.html');
});

// 2. Handle the login POST request (API endpoint)
app.post('/api/login', (req, res) => {
    // Extract the body that the server parsed for us
    const credentials = req.body;
    
    console.log("Login attempt with:", credentials);

    // Make sure the client actually sent data
    if (!credentials || !credentials.username || !credentials.password) {
        return res.status(400).json({ 
            success: false, 
            error: "Missing username or password" 
        });
    }

    // Check if the username and password match our "database"
    if (credentials.username === username && credentials.password === password) {
        // Success! Send a 200 OK status
        res.status(200).json({ 
            success: true, 
            message: "Welcome back, Admin!" 
        });
    } else {
        // Failure! Send a 401 Unauthorized status
        res.status(401).json({ 
            success: false, 
            error: "Incorrect username or password. Please try again." 
        });
    }
});





/* ================== WORDLE ================== */

// 1. Serve the Wordle game page
app.get('/wordle', (req, res) => {
    app.serveStaticFile(res.socket, './wordle.html');
});

// 2. The Wordle API: Checks the guess against the secret word
app.post('/api/wordle', (req, res) => {
    const SECRET_WORD = "SERVER"; // Thematic 6-letter word!
    const guess = req.body.guess;

    // Validate the input
    if (!guess || guess.length !== 6) {
        return res.status(400).json({ error: "Guess must be exactly 6 letters" });
    }

    const guessUpper = guess.toUpperCase();
    const result = [];
    
    // Simple Wordle logic to determine colors
    for (let i = 0; i < 6; i++) {
        if (guessUpper[i] === SECRET_WORD[i]) {
            result.push("correct"); // Green
        } else if (SECRET_WORD.includes(guessUpper[i])) {
            result.push("present"); // Yellow
        } else {
            result.push("absent");  // Gray
        }
    }

    // Check if the user won
    const isWin = guessUpper === SECRET_WORD;

    // Send the results back to the client
    res.status(200).json({ 
        result: result, 
        win: isWin 
    });
});




/* ================== START THE SERVER ================== */
app.listen(3000);
console.log("Server running! Go to http://localhost:3000/login to test the login.");