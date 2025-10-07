const { SlashCommandBuilder } = require('discord.js');

// List of user IDs allowed to use this command
const allowedUsers = [
    'INSERTUSERIDHERE' // this specifies who can use the command
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Unmute a member who was timed out.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The member to unmute')
                .setRequired(true)
        ),
    async execute(interaction) {
        // Check if the executor is allowed
        if (!allowedUsers.includes(interaction.user.id)) {
            return interaction.reply({ content: 'You are not allowed to use this command.', ephemeral: true });
        }

        const member = interaction.options.getMember('target');

        if (!member) {
            return interaction.reply({ content: 'Member not found!', ephemeral: true });
        }

        if (!member.isCommunicationDisabled()) {
            return interaction.reply({ content: 'This member is not muted.', ephemeral: true });
        }

        try {
            await member.timeout(null); // Remove timeout
            return interaction.reply({ content: `${member.user.tag} has been unmuted.` });
        } catch (err) {
            console.error(err);
            return interaction.reply({ content: 'Failed to unmute this member.', ephemeral: true });
        }
    },
};
