import express from "express";
import Participant from "../models/Participant.js";

const router = express.Router();

// � SIMPLE LOGIN (no JWT for now)
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "1234") {
    return res.json({ success: true });
  }

  res.status(401).json({ success: false });
});

// � GET ALL DATA
router.get("/data", async (req, res) => {
  const data = await Participant.find().sort({ participantId: 1 });
  res.json(data);
});

// ⬇️ EXPORT CSV
router.get("/export", async (req, res) => {
  const participants = await Participant.find();

  const rows = [];

  participants.forEach(p => {
    p.responses.forEach(r => {
      rows.push({
        participantId: p.participantId,
        gender: p.gender,
        stage: r.stage,
        eventType: r.eventType,
        category: r.category,
        word: r.word,
        action: r.action,
        responseTimeMs: r.responseTimeMs,
        value: r.value,
        transcript: r.transcript,
        timestamp: r.timestamp
      });
    });
  });

  const headers = Object.keys(rows[0] || {});
  const csv = [
    headers.join(","),
    ...rows.map(row =>
      headers.map(h => `"${row[h] ?? ""}"`).join(",")
    )
  ].join("\n");

  res.header("Content-Type", "text/csv");
  res.attachment("data.csv");
  res.send(csv);
});

export default router;