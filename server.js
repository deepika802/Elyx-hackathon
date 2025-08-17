const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors");
const { db } = require("./db");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// === PROFILE ===
app.get("/profile", (req, res) => {
  db.query("SELECT * FROM profile LIMIT 1", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result[0] || {});
  });
});

app.post("/profile", (req, res) => {
  const { name, age, disease, goals, commitments } = req.body;

  db.query("SELECT * FROM profile LIMIT 1", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.length > 0) {
      db.query(
        "UPDATE profile SET name=?, age=?, disease=?, goals=?, commitments=? WHERE id=?",
        [name, age, disease, goals, commitments, result[0].id],
        (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true });
        }
      );
    } else {
      db.query(
        "INSERT INTO profile (name, age, disease, goals, commitments) VALUES (?, ?, ?, ?, ?)",
        [name, age, disease, goals, commitments],
        (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true });
        }
      );
    }
  });
});

// === CHAT ===
app.get("/messages", (req, res) => {
  db.query("SELECT * FROM chats ORDER BY id ASC", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

app.post("/send", (req, res) => {
  const { sender = "User", content } = req.body;
  if (!content) return res.status(400).json({ error: "Message required" });

  db.query(
    "INSERT INTO chats (sender, content) VALUES (?, ?)",
    [sender, content],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      const newMsg = { id: result.insertId, sender, content, created_at: new Date() };
      io.emit("message", newMsg);
      res.json(newMsg);
    }
  );
});

// Socket.IO
io.on("connection", (socket) => {
  console.log("🔌 Client connected");
  socket.on("message", (data) => {
    const { sender = "User", message } = data;
    db.query("INSERT INTO chats (sender, content) VALUES (?, ?)", [sender, message], (err, result) => {
      if (err) return console.error(err);
      io.emit("message", { id: result.insertId, sender, content: message, created_at: new Date() });
    });
  });
  socket.on("disconnect", () => console.log("❌ Client disconnected"));
});

// === PROGRESS DATA ===
app.get("/progress", (req, res) => {
  db.query("SELECT * FROM progress ORDER BY date ASC", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

app.post("/progress", (req, res) => {
  const { profile_id = 1, metric, value, date } = req.body;
  db.query(
    "INSERT INTO progress (profile_id, metric, value, date) VALUES (?, ?, ?, ?)",
    [profile_id, metric, value, date],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// === DECISIONS ===
app.get("/decisions", (req, res) => {
  db.query("SELECT * FROM decisions ORDER BY date DESC", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

app.post("/decisions", (req, res) => {
  const { profile_id = 1, decision_type, description, reason, date } = req.body;
  db.query(
    "INSERT INTO decisions (profile_id, decision_type, description, reason, date) VALUES (?, ?, ?, ?, ?)",
    [profile_id, decision_type, description, reason, date],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// === INTERNAL METRICS ===
app.get("/metrics", (req, res) => {
  db.query("SELECT * FROM metrics ORDER BY date ASC", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// === PERSONA ===
app.get("/persona", (req, res) => {
  db.query("SELECT * FROM persona ORDER BY created_at DESC LIMIT 1", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result[0] || {});
  });
});

app.post("/persona", (req, res) => {
  const { profile_id = 1, analysis } = req.body;
  db.query(
    "INSERT INTO persona (profile_id, analysis) VALUES (?, ?)",
    [profile_id, analysis],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
