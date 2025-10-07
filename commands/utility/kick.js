const { SlashCommandBuilder } = require('discord.js');

// List of user IDs who are allowed to use the kick command
const allowedUsers = [
    'INSERTUSERIDHERE' // this specifies who can use the command
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicks a user from the server.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to kick')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the kick')
                .setRequired(false)),
    async execute(interaction) {
        // Restrict usage to only allowed users
        if (!allowedUsers.includes(interaction.user.id)) {
            return interaction.reply({
                content: "❌ You don't have permission to use this command.",
                ephemeral: true
            });
        }

        const targetUser = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!targetUser) {
            return interaction.reply({
                content: 'You need to specify a user to kick!',
                ephemeral: true
            });
        }

        try {
            const member = await interaction.guild.members.fetch(targetUser.id);
            await member.kick(reason);
            await interaction.reply({
                content: `✅ Successfully kicked ${targetUser.tag} for: ${reason}`,
                ephemeral: true
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: `⚠️ There was an error trying to kick ${targetUser.tag}: ${error.message}`,
                ephemeral: true
            });
        }
    },
};
