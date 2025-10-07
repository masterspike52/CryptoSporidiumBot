const { SlashCommandBuilder } = require('discord.js');
const points = require('../../points.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Shows the top users by points.')
        .addIntegerOption(option =>
            option.setName('limit')
                .setDescription('How many users to show (default 10)')
                .setMinValue(1)
                .setMaxValue(25)
        ),

    async execute(interaction) {
        const limit = interaction.options.getInteger('limit') || 10;
        const leaderboard = points.getLeaderboard(limit);

        if (leaderboard.length === 0) {
            return interaction.reply('No points have been recorded yet.');
        }

        let reply = `🏆 **Leaderboard (Top ${leaderboard.length})** 🏆\n\n`;

        for (let i = 0; i < leaderboard.length; i++) {
            const [userId, pts] = leaderboard[i];
            let displayName;

            try {
                // Try to get the member (nickname if available)
                const member = await interaction.guild.members.fetch(userId).catch(() => null);
                if (member) {
                    displayName = member.displayName; // Nickname OR username
                } else {
                    // Fallback: fetch user global username
                    const user = await interaction.client.users.fetch(userId);
                    displayName = user.username;
                }
            } catch {
                displayName = `Unknown (${userId})`;
            }

            reply += `**${i + 1}.** ${displayName} — ${pts} points\n`;
        }

        await interaction.reply(reply);
    },
};
