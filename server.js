const net = require('net');

// Create a TCP server
const server = net.createServer((socket) => {
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

        // Send a temporary generic response
        socket.write('Hello from server!\n');
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

// Start listening on port 3000
server.listen(3000, () => {
    console.log('Server listening on port 3000');
});
