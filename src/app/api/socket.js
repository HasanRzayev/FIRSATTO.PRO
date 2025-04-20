// pages/api/socket.js
export default function handler(req, res) {
    if (req.method === "GET") {
      const WebSocket = require("ws");
      const wss = new WebSocket.Server({ noServer: true });
  
      wss.on("connection", (ws) => {
        ws.on("message", (message) => {
          console.log("received: %s", message);
        });
  
        // Yeni bir mesaj geldiğinde tüm bağlı istemcilere ilet
        ws.send(JSON.stringify({ adId: 1, userName: "Hasan", content: "Yorum 1" }));
      });
  
      res.socket.server.on("upgrade", (request, socket, head) => {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit("connection", ws, request);
        });
      });
  
      res.status(200).end();
    } else {
      res.status(405).json({ error: "Yalnızca GET isteği kabul edilir." });
    }
  }
  