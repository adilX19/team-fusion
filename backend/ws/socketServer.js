// ws/socketServer.js
const WebSocket = require('ws');

const clients = new Map(); // user_id => ws

function setupWebSocket(server) {
    const wss = new WebSocket.Server({ noServer: true });

    server.on('upgrade', (req, socket, head) => {
        wss.handleUpgrade(req, socket, head, ws => {
            wss.emit('connection', ws, req);
        });
    });

    wss.on('connection', (ws, req) => {
        ws.on('message', msg => {
            try {
                const data = JSON.parse(msg);
                if (data.type === 'REGISTER' && data.user_id) {
                    clients.set(data.user_id, ws);
                    console.log(`🧑 User ${data.user_id} registered to WS`);
                }
            } catch (err) {
                console.error('WS parse error:', err);
            }
        });

        ws.on('close', () => {
            for (let [uid, socket] of clients.entries()) {
                if (socket === ws) clients.delete(uid);
            }
        });
    });
}

function getClient(user_id) {
    return clients.get(user_id);
}

module.exports = { setupWebSocket, getClient };
