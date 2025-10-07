const { SlashCommandBuilder } = require('discord.js');

// Add the IDs of the users who can use this command
const allowedUsers = [
    'INSERTUSERIDHERE' // this specifies who can use the command
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans a user from the server.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to ban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the ban')
                .setRequired(false)),
    async execute(interaction) {
        // Check if the command user is in the allowed list
        if (!allowedUsers.includes(interaction.user.id)) {
            return interaction.reply({
                content: "❌ You don't have permission to use this command.",
                ephemeral: true
            });
        }

        const targetUser = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!targetUser) {
            return interaction.reply({ content: 'You need to specify a user to ban!', ephemeral: true });
        }

        try {
            await interaction.guild.members.ban(targetUser, { reason });
            await interaction.reply({
                content: `✅ Successfully banned ${targetUser.tag} for: ${reason}`,
                ephemeral: true
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: `⚠️ There was an error trying to ban ${targetUser.tag}: ${error.message}`,
                ephemeral: true
            });
        }
    },
};
