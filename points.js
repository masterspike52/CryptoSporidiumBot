const fs = require('fs');
const path = require('path');

const pointsFile = path.join(__dirname, 'points.json');

// Load points and streaks from file, or start fresh
let data = { points: {}, streaks: {} };
if (fs.existsSync(pointsFile)) {
    try {
        data = JSON.parse(fs.readFileSync(pointsFile, 'utf8'));
        data.points = data.points || {};
        data.streaks = data.streaks || {};
    } catch (err) {
        console.error('Failed to read points.json, starting fresh.', err);
        data = { points: {}, streaks: {} };
    }
}

// Helper to save data immediately
function saveData() {
    try {
        fs.writeFileSync(pointsFile, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.error('Failed to write points.json', err);
    }
}

// Points functions
function addPoints(userId, amount) {
    if (!data.points[userId]) data.points[userId] = 0;
    data.points[userId] += amount;
    saveData();
    return data.points[userId];
}

function getPoints(userId) {
    if (!data.points[userId]) data.points[userId] = 0;
    return data.points[userId];
}

// Leaderboard function
function getLeaderboard(limit = 10) {
    return Object.entries(data.points)
        .sort(([, a], [, b]) => b - a) // sort by points, descending
        .slice(0, limit); // top X users
}

// Streak functions
function addStreak(userId) {
    if (!data.streaks[userId]) data.streaks[userId] = 0;
    data.streaks[userId]++;
    saveData();
    return data.streaks[userId];
}

function getStreak(userId) {
    if (!data.streaks[userId]) data.streaks[userId] = 0;
    return data.streaks[userId];
}

function resetStreak(userId) {
    data.streaks[userId] = 0;
    saveData();
}

module.exports = { addPoints, getPoints, getLeaderboard, addStreak, getStreak, resetStreak };
