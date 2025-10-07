const fs = require('fs');
const path = require('path');

// Replace with your logging channel ID
const LOG_CHANNEL_ID = 'INSERTLOGCHANNELIDHERE';

module.exports = (client) => {

    // Helper function to sanitize filenames
    function sanitize(str) {
        return str.replace(/[^a-z0-9_-]/gi, '_');
    }

    // Generic logging function
    async function logMessage(message) {
        if (!message.guild || !message.channel) return; // Only log guild messages
        if (message.author.bot) return; // Skip bots

        const guildName = sanitize(message.guild.name);
        const guildId = message.guild.id;
        const channelName = sanitize(message.channel.name);
        const channelId = message.channel.id;

        // Prepare folder
        const logFolder = path.join(__dirname, 'logs', `${guildName}-${guildId}`);
        if (!fs.existsSync(logFolder)) fs.mkdirSync(logFolder, { recursive: true });

        // File per channel
        const filePath = path.join(logFolder, `${channelName}-${channelId}.txt`);

        const timestamp = new Date().toISOString();
        const logLine = `[${timestamp}] ${message.author.tag} (${message.author.id}): ${message.content}\n`;

        // Append to file
        try {
            fs.appendFileSync(filePath, logLine, 'utf8');
        } catch (err) {
            console.error("Failed to write log file:", err);
        }

        // Also send to Discord logging channel
        try {
            const logChannel = await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
            if (logChannel && logChannel.isTextBased()) {
                logChannel.send(`\`\`\`[${timestamp}] #${channelName} | ${message.author.tag}: ${message.content}\`\`\``)
                    .catch(() => {});
            }
        } catch (err) {
            console.error("Failed to send message to log channel:", err);
        }
    }

    // Event: new messages
    client.on('messageCreate', logMessage);

    // Event: edited messages
    client.on('messageUpdate', async (oldMessage, newMessage) => {
        // Ignore bot messages and DMs
        if (!newMessage.guild || newMessage.author?.bot) return;
        const timestamp = new Date().toISOString();
        const guildName = sanitize(newMessage.guild.name);
        const guildId = newMessage.guild.id;
        const channelName = sanitize(newMessage.channel.name);
        const channelId = newMessage.channel.id;

        const logFolder = path.join(__dirname, 'logs', `${guildName}-${guildId}`);
        if (!fs.existsSync(logFolder)) fs.mkdirSync(logFolder, { recursive: true });

        const filePath = path.join(logFolder, `${channelName}-${channelId}.txt`);
        const logLine = `[${timestamp}] ${newMessage.author.tag} (${newMessage.author.id}) edited message: ${newMessage.content}\n`;

        try {
            fs.appendFileSync(filePath, logLine, 'utf8');
        } catch (err) {
            console.error("Failed to write edited message log:", err);
        }

        try {
            const logChannel = await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
            if (logChannel && logChannel.isTextBased()) {
                logChannel.send(`\`\`\`[${timestamp}] #${channelName} | ${newMessage.author.tag} edited: ${newMessage.content}\`\`\``)
                    .catch(() => {});
            }
        } catch (err) {
            console.error("Failed to send edited message to log channel:", err);
        }
    });

    // Event: deleted messages
    client.on('messageDelete', async (message) => {
        if (!message.guild || message.author?.bot) return;
        const timestamp = new Date().toISOString();
        const guildName = sanitize(message.guild.name);
        const guildId = message.guild.id;
        const channelName = sanitize(message.channel.name);
        const channelId = message.channel.id;

        const logFolder = path.join(__dirname, 'logs', `${guildName}-${guildId}`);
        if (!fs.existsSync(logFolder)) fs.mkdirSync(logFolder, { recursive: true });

        const filePath = path.join(logFolder, `${channelName}-${channelId}.txt`);
        const logLine = `[${timestamp}] ${message.author.tag} (${message.author.id}) deleted message: ${message.content}\n`;

        try {
            fs.appendFileSync(filePath, logLine, 'utf8');
        } catch (err) {
            console.error("Failed to write deleted message log:", err);
        }

        try {
            const logChannel = await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
            if (logChannel && logChannel.isTextBased()) {
                logChannel.send(`\`\`\`[${timestamp}] #${channelName} | ${message.author.tag} deleted: ${message.content}\`\`\``)
                    .catch(() => {});
            }
        } catch (err) {
            console.error("Failed to send deleted message to log channel:", err);
        }
    });
};
