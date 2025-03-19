import { WebSocketServer } from 'ws';
import ws from 'ws'; // ✅ Import WebSocket for constants like `ws.OPEN`

const wss = new WebSocketServer({ port: 4322 });

const clients = new Map(); // Store clients with unique IDs

wss.on('connection', (ws) => {
  const clientId = `client-${Date.now()}`; // Generate a unique client ID
  clients.set(clientId, ws);
  console.log(`New client connected: ${clientId}`);

  ws.send(JSON.stringify({ type: 'welcome', clientId }));

  ws.on('message', (message) => {
    console.log(`Received from ${clientId}: ${message}`);

    // Parse received JSON message
    let data;
    try {
      data = JSON.parse(message);
    } catch (e) {
      console.error('Invalid JSON');
      return;
    }

    // Broadcast message to all clients
    if (data.type === 'broadcast') {
      wss.clients.forEach((client) => {
        if (client.readyState === ws.OPEN) { // ✅ Use `ws.OPEN`
          client.send(JSON.stringify({ from: clientId, message: data.message, type: 'broadcast' }));
        }
      });
    }
  });

  ws.on('close', () => {
    console.log(`Client disconnected: ${clientId}`);
    clients.delete(clientId);
  });
});

console.log('WebSocket server running on ws://localhost:4322');
