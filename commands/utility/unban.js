const { SlashCommandBuilder } = require('discord.js');

// Only these users can use the unban command
const allowedUsers = [
    'INSERTUSERIDHERE' // this specifies who can use the command
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unbans a user from the server.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to unban')
                .setRequired(true)),
    async execute(interaction) {
        // Restrict usage
        if (!allowedUsers.includes(interaction.user.id)) {
            return interaction.reply({
                content: "❌ You don't have permission to use this command.",
                ephemeral: true
            });
        }

        const targetUser = interaction.options.getUser('target');

        if (!targetUser) {
            return interaction.reply({
                content: '⚠️ You need to specify a user to unban!',
                ephemeral: true
            });
        }

        try {
            await interaction.guild.members.unban(targetUser);
            await interaction.reply({
                content: `✅ Successfully unbanned ${targetUser.tag}`,
                ephemeral: true
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: `⚠️ There was an error trying to unban ${targetUser.tag}: ${error.message}`,
                ephemeral: true
            });
        }
    },
};
