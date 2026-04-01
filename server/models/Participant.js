import mongoose from "mongoose";

const responseSchema = new mongoose.Schema({
    stage: String,
    eventType: String,
    subStage: String,

    value: String,
    selected: String,
    correct: Boolean,

    attempt: Number,
    hintsUsed: Number,

    category: String,
    word: String,
    blockType: String,
    action: String,

    responseTimeMs: Number,
    transcript: String,

    timestamp: {
        type: Date,
        default: Date.now
    }
});

const participantSchema = new mongoose.Schema({
    participantId: {
        type: String,
        required: true,
        unique: true
    },

    name: String,
    gender: String,

    friend: {
        name: String,
        avatar: String
    },

    stageFinished: {
        type: String,
        default: "participant"
    },

    nextStage: {
        type: String,
        default: "friend"
    },

    responses: [responseSchema]

}, { timestamps: true });

export default mongoose.model("Participant", participantSchema);