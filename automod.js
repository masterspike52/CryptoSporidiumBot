const fs = require('fs');
const path = require('path');

const bannedWords = [
  'replace with words you want banned' //this dictates what words are banned, you can add multiple
];

// For spam tracking
const messageCooldown = new Map();
// Track raw offense "hits" (increments on each banned-word message)
const offenseCounts = new Map();
// Track how many mutes / escalation level a user has had
const muteLevels = new Map();

// Escalating timeout durations (ms)
const TIMEOUT_DURATIONS = [
  10 * 60 * 1000,      // 10 minutes
  60 * 60 * 1000,      // 1 hour
  24 * 60 * 60 * 1000, // 24 hours
  7 * 24 * 60 * 60 * 1000 // 7 days
];
const DEFAULT_FINAL_TIMEOUT = TIMEOUT_DURATIONS[TIMEOUT_DURATIONS.length - 1];

// Normalize text to detect evasion
function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/0/g, 'o')
        .replace(/1/g, 'i')
        .replace(/!/g, 'i')
        .replace(/\$/g, 's')
        .replace(/3/g, 'e')
        .replace(/4/g, 'a')
        .replace(/5/g, 's')
        .replace(/7/g, 't')
        .replace(/9/g, 'g')
        .replace(/@/g, 'a')
        .replace(/€/g, 'e')                // Added euro symbol replacement
        .replace(/[^a-z0-9\s]+/g, ' ')   // keep spaces to split words
        .replace(/(.)\1{2,}/g, '$1');     // collapse repeated letters
}

// Logging helper
function logAction(action) {
    const logFolder = path.join(__dirname, 'logs');
    if (!fs.existsSync(logFolder)) fs.mkdirSync(logFolder, { recursive: true });

    const logFile = path.join(logFolder, 'moderation.log');
    const timestamp = new Date().toISOString();
    try {
        fs.appendFileSync(logFile, `[${timestamp}] ${action}\n`, 'utf8');
    } catch (err) {
        console.error('Failed to write moderation log:', err);
    }
}

// Get timeout duration for a user based on their mute level
function getTimeoutForUser(userId) {
    const level = muteLevels.get(userId) || 0;
    if (level < TIMEOUT_DURATIONS.length) return TIMEOUT_DURATIONS[level];
    return DEFAULT_FINAL_TIMEOUT;
}

// Increase mute level for escalation
function bumpMuteLevel(userId) {
    const current = muteLevels.get(userId) || 0;
    const next = Math.min(current + 1, TIMEOUT_DURATIONS.length - 1);
    muteLevels.set(userId, next);
    return next;
}

// Main automod module
module.exports = (client) => {
    client.on('messageCreate', async (message) => {
        try {
            if (!message || !message.author || message.author.bot) return;
            if (!message.guild || !message.member) return;

            const normalized = normalizeText(String(message.content || ''));

            // Split message into words for exact matching
            const words = normalized.split(/\s+/);

            const hit = bannedWords.some(word => words.includes(word.replace(/\s+/g, '').toLowerCase()));

            if (hit) {
                // Delete the message and warn user
                try { await message.delete().catch(() => {}); } catch {}
                try { await message.channel.send(`${message.author}, that word is not allowed here! 🚫`).catch(() => {}); } catch {}

                const prev = offenseCounts.get(message.author.id) || 0;
                const offenses = prev + 1;
                offenseCounts.set(message.author.id, offenses);

                logAction(`Offense recorded: ${message.author.tag} (${message.author.id}) — offenses=${offenses} — content="${message.content}"`);

                // If offenses >=2, timeout user
                if (offenses >= 2) {
                    offenseCounts.set(message.author.id, 0);
                    const userTimeoutMs = getTimeoutForUser(message.author.id);

                    if (message.member && message.member.moderatable) {
                        try {
                            await message.member.timeout(userTimeoutMs, 'Repeated offensive language');
                            await message.channel.send(`${message.author} has been muted for repeated offensive language.`);
                            logAction(`Muted ${message.author.tag} (${message.author.id}) for ${userTimeoutMs} ms.`);
                            bumpMuteLevel(message.author.id);
                        } catch (err) {
                            console.error('Failed to timeout user:', err);
                            logAction(`Failed to mute ${message.author.tag} (${message.author.id}): ${err.message}`);
                            try { await message.channel.send(`${message.author}, your language is not allowed. Moderators: I couldn't timeout this user due to permissions/role hierarchy.`).catch(() => {}); } catch {}
                        }
                    } else {
                        logAction(`Could not mute ${message.author.tag} (${message.author.id}) — moderatable=false or missing member object.`);
                        try { await message.channel.send(`${message.author}, your language is not allowed. Moderators: I couldn't timeout this user due to permissions/role hierarchy.`).catch(() => {}); } catch {}
                    }
                }
                return;
            }

            // Spam detection
            const now = Date.now();
            const timestamps = messageCooldown.get(message.author.id) || [];
            const recent = timestamps.filter(ts => now - ts < 5000);
            recent.push(now);
            messageCooldown.set(message.author.id, recent);

            if (recent.length > 5) {
                messageCooldown.set(message.author.id, []);
                if (message.member && message.member.moderatable) {
                    const spamTimeout = TIMEOUT_DURATIONS[0];
                    try {
                        await message.channel.send(`${message.author}, you are sending messages too quickly! You have been muted for spamming.`);
                        await message.member.timeout(spamTimeout, 'Spamming messages');
                        logAction(`Muted ${message.author.tag} (${message.author.id}) for spamming.`);
                    } catch (err) {
                        console.error('Failed to timeout user for spam:', err);
                        logAction(`Failed to mute ${message.author.tag} for spam: ${err.message}`);
                        try { await message.channel.send(`${message.author}, please slow down. Moderators: I couldn't timeout this user due to permissions/role hierarchy.`).catch(() => {}); } catch {}
                    }
                } else {
                    logAction(`Could not mute ${message.author.tag} (${message.author.id}) for spam (moderatable=false).`);
                }
            }
        } catch (err) {
            console.error('automod handler error:', err);
            logAction(`automod handler error: ${err.message}`);
        }
    });
};
