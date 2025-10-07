const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

// Optional: restrict to specific users
const allowedUsers = [
    'INSERTUSERIDHERE' // this specifies who can use the command
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mutes a user by applying the Muted role.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to mute')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the mute')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers), // Requires moderation perms
    async execute(interaction) {
        // Restrict usage to allowed user IDs (optional)
        if (!allowedUsers.includes(interaction.user.id)) {
            return interaction.reply({
                content: "❌ You don't have permission to use this command.",
                ephemeral: true
            });
        }

        const targetUser = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!targetUser) {
            return interaction.reply({ content: '⚠️ You must specify a user to mute!', ephemeral: true });
        }

        try {
            const member = await interaction.guild.members.fetch(targetUser.id);

            // Check if "Muted" role exists, if not, create it
            let muteRole = interaction.guild.roles.cache.find(r => r.name === 'Muted');
            if (!muteRole) {
                muteRole = await interaction.guild.roles.create({
                    name: 'Muted',
                    color: '#555555',
                    permissions: [] // no extra perms
                });

                // Deny sending messages in all channels for the role
                for (const [channelId, channel] of interaction.guild.channels.cache) {
                    await channel.permissionOverwrites.edit(muteRole, {
                        SendMessages: false,
                        Speak: false,
                        AddReactions: false
                    }).catch(console.error);
                }
            }

            // Add Muted role to user
            await member.roles.add(muteRole, reason);

            await interaction.reply({
                content: `✅ ${targetUser.tag} has been muted. Reason: ${reason}`,
                ephemeral: true
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: `⚠️ Failed to mute ${targetUser.tag}: ${error.message}`,
                ephemeral: true
            });
        }
    },
};
