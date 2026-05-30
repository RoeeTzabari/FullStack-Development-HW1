const net = require('net');
class Server
{
    constructor()
    {
        this.routes = {
            'GET': {},
            'POST': {}
        }
        this.server = net.createServer((socket) => {
            // 'socket' is a duplex stream representing the connection
        
            // Receive data from client
            socket.on('data', (data) => {
                // Convert the raw bytes into readable text
                const requestText = data.toString();
                
                // Split the request text into an array of lines
                // In HTTP, every line ends with '\r\n'
                const lines = requestText.split('\r\n');
                
                // Get the very first line (e.g., "GET / HTTP/1.1")
                const firstLine = lines[0];
                
                // Split the firstLine by space to get the individual words
                const parts = firstLine.split(' ');
                
                // Extract the Method (GET) and the Path (/) using the array indexes
                const method = parts[0];
                const path = parts[1];
                
                console.log('Client wants to do:', method);
                console.log('Client is asking for path:', path);
        
                // Server's response:
                if (this.routes[method] && this.routes[method][path]) {
                    this.routes[method][path](socket);
                } else {
                    this.sendResponse(socket, 404, "Not Found", "Are you lost?");
                }
            });
        
            // Handle connection close
            socket.on('end', () => {
                console.log('Client disconnected');
            });
        
            // Handle errors
            socket.on('error', (err) => {
                console.error('Socket error:', err.message);
            });
        });
    }

    sendResponse(socket, statusCode, statusText, body) {
        const response = "HTTP/1.1 " + statusCode + " " + statusText + "\r\n" +
                         "Content-Type: text/plain\r\n\r\n" +
                         body + "\n";
        
        socket.write(response);
        socket.end();
    }

    listen(port) {
        this.server.listen(port, () => {
            console.log(`Server listening on port ${port}`);
        });
    }

    get(path, response) {
        this.routes['GET'][path] = response;
    }

    post(path, handler) {
        this.routes['POST'][path] = handler;
    }

    
}

const server = new Server();

server.get('/', (socket) => {
    server.sendResponse(socket, 200, "OK", "Welcome to the homepage!");
});

// Register the '/about' route
server.get('/about', (socket) => {
    server.sendResponse(socket, 200, "OK", "This is the About page!");
});

server.listen(3000);