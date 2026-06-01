const net = require('net');
const fs = require('fs');
const { stringify } = require('querystring');


class ServerManager
{
    constructor()
    {
        this.mappedTypes = {
            'html': 'text/html',
            'css': 'text/css',
            'js': 'application/javascript',
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg'
        }

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
                const req = {
                    method: method,
                    path: path
                };

                const res = this.createResponse(socket);

                if (this.routes[method] && this.routes[method][path]) {
                    this.routes[method][path](req, res);
                } else {
                    res.status(404).send("Not Found - Are you lost?");
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

    serveStaticFile(socket, filePath) {
        const content = fs.readFileSync(filePath);
        const type = filePath.split('.')[2];
        let mapped = this.mappedTypes[type];

        if (mapped === undefined) {
            mapped = 'text/plain';
        }

        const htmlResponse = "HTTP/1.1 200 OK\r\n" +
                             "Content-Type: " + mapped + "\r\n\r\n";
        
        socket.write(htmlResponse);
        socket.write(content);
        socket.end();
    }

    createResponse(socket) {
        const statusTexts = {
            200: 'OK',
            201: 'Created',
            400: 'Bad Request',
            404: 'Not Found',
            500: 'Internal Server Error'
        };

        const res = {
            statusCode: 200,
            statusText: "OK",
            
            
            status: function(code) {
                this.statusCode = code;
                this.statusText = statusTexts[this.statusCode];
                if (this.statusText === undefined)
                {
                    this.statusText = 'Unknown';
                }
                return this;
            },

            send: function(text) {
                const response = "HTTP/1.1 " + this.statusCode + " " + this.statusText + "\r\n" +
                                 "Content-Type: text/plain\r\n\r\n" +
                                 text + "\n";

                socket.write(response);
                socket.end();
            },

            json: function(data) {
                const content =  JSON.stringify(data);
                const response = "HTTP/1.1 " + this.statusCode + " " + this.statusText + "\r\n" +
                                 "Content-Type: application/json\r\n\r\n" +
                                 content + "\n";
                socket.write(response);
                socket.end();
            }
        };

        return res;
    }
}

module.exports = ServerManager;