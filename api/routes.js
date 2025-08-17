// routes.js
const express = require("express");
const router = express.Router();
const { db } = require("./db");

// === PROFILE ROUTES ===
router.get("/profile", (req, res) => {
  db.query("SELECT * FROM profile LIMIT 1", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result[0] || {});
  });
});

router.post("/profile", (req, res) => {
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

// === CHAT ROUTES ===
router.get("/messages", (req, res) => {
  db.query("SELECT * FROM chats ORDER BY id ASC", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

router.post("/send", (req, res) => {
  const { sender = "User", content } = req.body;
  if (!content) return res.status(400).json({ error: "Message required" });

  db.query(
    "INSERT INTO chats (sender, content) VALUES (?, ?)",
    [sender, content],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      const newMsg = { id: result.insertId, sender, content, created_at: new Date() };
      res.json(newMsg);
    }
  );
});

module.exports = router;
