const ServerManager = require('./ServerManager');

const server = new ServerManager();

server.get('/', (socket) => {
    server.serveStaticFile(socket, './MainPage.html');
});

server.listen(3000)