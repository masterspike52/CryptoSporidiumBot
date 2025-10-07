const { SlashCommandBuilder } = require('discord.js');
const { getPoints } = require('../../points');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('points')
        .setDescription('Check your points!'),
    async execute(interaction) {
        const total = getPoints(interaction.user.id);
        await interaction.reply(`💰 You have **${total} points**!`);
    }
};
