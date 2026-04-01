import express from "express";
import Participant from "../models/Participant.js";

const router = express.Router();


// ✅ CREATE / VALIDATE PARTICIPANT
router.post("/participant", async (req, res) => {
    try {
        const { name, participantId, gender } = req.body;

        let user = await Participant.findOne({ participantId });

        // � If already exists → resume
        if (user) {
            return res.json({
                allowed: true,
                nextStage: user.nextStage
            });
        }

        // � Create new
        user = new Participant({
            name,
            participantId,
            gender,
            stageFinished: "participant",
            nextStage: "friend"
        });

        await user.save();

        res.json({
            allowed: true,
            nextStage: "friend"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});


// ✅ SAVE FRIEND
router.post("/friend", async (req, res) => {
    try {
        const { participantId, friendName, avatar } = req.body;

        const user = await Participant.findOne({ participantId });

        if (!user) return res.status(404).json({ error: "User not found" });

        user.friend = {
            name: friendName,
            avatar
        };

        user.stageFinished = "friend";
        user.nextStage = "pd";

        await user.save();

        res.json({ success: true });

    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});


// ✅ SAVE RESPONSE (UNIVERSAL)
router.post("/response", async (req, res) => {
    try {
        const { participantId, data } = req.body;

        const user = await Participant.findOne({ participantId });

        if (!user) return res.status(404).json({ error: "User not found" });

        user.responses.push(data);

        await user.save();

        res.json({ success: true });

    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});


// ✅ UPDATE STAGE
router.post("/stage", async (req, res) => {
    try {
        const { participantId, stageFinished, nextStage } = req.body;

        const user = await Participant.findOne({ participantId });

        if (!user) return res.status(404).json({ error: "User not found" });

        user.stageFinished = stageFinished;
        user.nextStage = nextStage;

        await user.save();

        res.json({ success: true });

    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});


// ✅ GET SESSION (VERY IMPORTANT FOR GUARD)
router.get("/session/:participantId", async (req, res) => {
    try {
        const user = await Participant.findOne({
            participantId: req.params.participantId
        });

        if (!user) {
            return res.json({ nextStage: "participant" });
        }

        res.json({
            nextStage: user.nextStage,
            stageFinished: user.stageFinished,
            friend: user.friend,
            gender: user.gender
        });

    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

export default router;