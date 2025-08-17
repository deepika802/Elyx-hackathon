// chat.js
const { db } = require("./db");

function setupChat(io) {
  io.on("connection", (socket) => {
    console.log("🔌 Client connected");

    // Receive message from client
    socket.on("message", (data) => {
      const { sender = "User", message } = data;
      if (!message) return;

      // Save to DB
      db.query(
        "INSERT INTO chats (sender, content) VALUES (?, ?)",
        [sender, message],
        (err, result) => {
          if (err) return console.error(err);

          const newMsg = {
            id: result.insertId,
            sender,
            content: message,
            created_at: new Date(),
          };

          // Broadcast to all clients
          io.emit("message", newMsg);
        }
      );
    });

    socket.on("disconnect", () => console.log("❌ Client disconnected"));
  });
}

module.exports = { setupChat };
