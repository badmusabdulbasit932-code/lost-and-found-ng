const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    type: {type: String, enum: ['lost', 'found'], required: true},
    category: {type: String, required: true},
    location: {type: String, required: true},
    reward: {type: String, default: ""},
    images: [{type: String}],
    imageTags: {type:[ String], default: []},
    status: {type: String, enum: ["open", "matched", "resolved"], default: 'open'},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
    deletedAt: {type: Date, default: null},
    isVerified: {type: Boolean, default: false},
})

module.exports = mongoose.model('Report', reportSchema);