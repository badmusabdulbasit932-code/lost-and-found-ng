const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', required: true },
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
    status: { type: String, enum: ['active', 'closed', "blocked"], default: 'active' },
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
    lastMessageAt: { type: Date, default: null },
    isPrivacyRevealed: { type: Boolean, default: false },
    revealRequestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, {
    timestamps: true,
});
conversationSchema.index({ matchId: 1 }, { unique: true });

module.exports = mongoose.model("Conversation", conversationSchema);