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
        };

        this.routes = {
            'GET': {},
            'POST': {}
        };
        
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
                const fullPath = parts[1];
                const [path, queryString] = fullPath.split('?');
                const query = {};

                if (queryString) {
                    const params = queryString.split('&');
                    for (let i = 0; i < params.length; i++) {
                        const param = params[i];
                        const [key, value] = param.split('=');
                        query[decodeURIComponent(key)] = decodeURIComponent(value || '');
                    }
                }

                const splitRequest = requestText.split('\r\n\r\n');
                let body = null;

                if (splitRequest.length > 1) {  // if there's a body section to the request.
                    const rawBody = splitRequest[1];

                    if (rawBody.trim() !== "") {
                        try {
                            body = JSON.parse(rawBody);
                        } catch (e) {
                            body = rawBody;
                        }
                    }
                }
                
                console.log('Client wants to do:', method);
                console.log('Client is asking for path:', fullPath);
        
                // Server's response:
                const req = {
                    method: method,
                    path: path,
                    query: query,
                    body: body,
                };

                const res = this.createResponse(socket);
                
                this._logRequest(method, fullPath, req.body, socket.remoteAddress)

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
        try {
            // Attempt to read the file synchronously
            const content = fs.readFileSync(filePath);
            
            // Extract the file extension to determine the MIME type
            const parts = filePath.split('.');
            const type = parts[parts.length - 1];
            let mapped = this.mappedTypes[type];

            if (mapped === undefined) {
                mapped = 'text/plain';
            }

            // Build the successful HTTP response header
            const htmlResponse = "HTTP/1.1 200 OK\r\n" +
                                 "Content-Type: " + mapped + "\r\n\r\n";
            
            // Send the header and the actual file content
            socket.write(htmlResponse);
            socket.write(content);
            socket.end();

        } catch (error) {
            // If fs.readFileSync fails (e.g., file not found), execution jumps here
            console.error(`Failed to serve static file: ${filePath}`, error.message);

            // Send a 404 Not Found response instead of crashing the server
            const notFoundResponse = "HTTP/1.1 404 Not Found\r\n" +
                                     "Content-Type: text/plain\r\n\r\n" +
                                     "404 - Static File Not Found\n";
            
            socket.write(notFoundResponse);
            socket.end();
        }
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
            socket: socket,
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

    _logRequest(method, path, body, ip) {
        const timestamp = new Date().toISOString();
        let logEntry = `[${timestamp}] Incoming Request: ${method} ${path}, from IP: ${ip}`;
        if (body === null) {
            logEntry += "\n";
        }
        else {
            logEntry += ` | request body: ${JSON.stringify(body)}\n`
        }
        
        // Write to a file named 'server.log'
        try {
            fs.appendFileSync('server.log', logEntry);
        } catch (error) {
            console.error("Failed to write to log file:", error.message);
        }
    }
}

module.exports = ServerManager;