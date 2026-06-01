# ServerManager Framework 🚀

A custom-built, Express-like HTTP server framework created entirely from scratch using Node.js's native `net` module.

## 🛠️ Core Features

* **Express-style Routing:** Clean and intuitive API for defining `GET` and `POST` routes (e.g., `app.get('/path', handler)`).
* **Intelligent Request Parsing:** Automatically extracts query parameters from URLs and parses JSON payloads from POST requests into a usable `req.body` object.
* **Custom Response Object:** Provides a chainable `res` object with helper methods like `res.status(code)`, `res.send(text)`, and `res.json(data)` for easy HTTP response building.
* **Static File Serving:** Built-in method (`serveStaticFile`) to deliver HTML, CSS, JS, and image files directly to the browser, complete with error handling (404 Not Found) for missing files.

## ✨ Creative Features (Bonus)

Beyond the standard HTTP server requirements, this project includes unique features:

1.  **Custom Logging System:** A built-in logger that intercepts incoming requests and writes them to a local `server.log` file in real-time. It records the timestamp, HTTP method, path, client IP address, and the parsed JSON body of POST requests.
2.  **Interactive API Mini-Game (HTTP Wordle):** A fully playable, server-validated Wordle clone. The client sends 6-letter guesses via POST requests to the `/api/wordle` endpoint. The server validates the input against the secret word ("SERVER"), computes the hit/miss array, and responds with JSON data to color the game board.

## 🚀 How to Run

1.  Clone this repository.
2.  Open your terminal in the project directory.
3.  Run the server using Node.js:
    ```bash
    node Server.js
    ```
4.  Open your web browser and navigate to:
    * `http://localhost:3000` (Main Page)
    * `http://localhost:3000/login` (Login System Example)
    * `http://localhost:3000/wordle` (Interactive Wordle Game)