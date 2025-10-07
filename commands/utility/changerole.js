// commands/utility/changerole.js
const { SlashCommandBuilder } = require('discord.js');

// List of user IDs allowed to use this command
const allowedUsers = [
    'INSERTUSERIDHERE' // this specifies who can use the command
];
module.exports = {
    data: new SlashCommandBuilder()
        .setName('changerole')
        .setDescription('Replace the roles of a user with a new one.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user whose role you want to change.')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The new role to assign.')
                .setRequired(true)),

    async execute(interaction) {
        // Check if the executor is allowed
        if (!allowedUserIDs.includes(interaction.user.id)) {
            return interaction.reply({ content: '❌ You are not allowed to use this command.', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const role = interaction.options.getRole('role');
        const member = await interaction.guild.members.fetch(user.id);

        if (!member) {
            return interaction.reply({ content: '❌ Could not find that member.', ephemeral: true });
        }

        // Ensure bot can assign this role
        if (role.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({ content: '❌ I cannot assign that role (it is higher or equal to my highest role).', ephemeral: true });
        }

        try {
            // Remove all roles except @everyone
            const rolesToKeep = member.roles.cache.filter(r => r.id === interaction.guild.id);
            await member.roles.set([...rolesToKeep.keys(), role.id]);

            await interaction.reply(`✅ Replaced ${user.tag}'s roles with **${role.name}**`);
        } catch (err) {
            console.error(err);
            await interaction.reply({ content: '❌ Failed to change role.', ephemeral: true });
        }
    },
};
