const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

// ✅ Declare allowedUserIDs first
const allowedUsers = [
    'INSERTUSERIDHERE' // this specifies who can use the command
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Delete the last X messages in this channel.')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of messages to delete (1-1000)')
                .setRequired(true)
        ),

    async execute(interaction) {
        // Restrict command to allowed users
        if (!allowedUserIDs.includes(interaction.user.id)) {
            return interaction.reply({ content: '❌ You are not allowed to use this command.', ephemeral: true });
        }

        let amount = interaction.options.getInteger('amount');

        if (amount < 1 || amount > 1000) {
            return interaction.reply({ content: 'You must provide a number between 1 and 1000.', ephemeral: true });
        }

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({ content: 'I do not have permission to manage messages in this channel.', ephemeral: true });
        }

        try {
            let totalDeleted = 0;
            while (amount > 0) {
                const deleteAmount = amount > 100 ? 100 : amount;
                const deleted = await interaction.channel.bulkDelete(deleteAmount, true);
                totalDeleted += deleted.size;
                amount -= deleted.size;

                if (deleted.size === 0) break; // stop if no messages were deleted
            }

            await interaction.reply({ content: `✅ Deleted ${totalDeleted} messages.`, ephemeral: true });
        } catch (err) {
            console.error(err);
            return interaction.reply({ content: 'Failed to delete messages. They might be older than 14 days or I lack permissions.', ephemeral: true });
        }
    },
};
