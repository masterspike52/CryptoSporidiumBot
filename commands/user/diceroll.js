const { SlashCommandBuilder, MessageFlags } = require('discord.js');

const allowedDice = [4, 6, 8, 10, 12, 20, 100];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('diceroll')
        .setDescription('Roll a D&D-style die.')
        .addIntegerOption(option =>
            option.setName('dice')
                .setDescription('Number of dice to roll')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)
        )
        .addIntegerOption(option =>
            option.setName('sides')
                .setDescription('Type of die to roll (D&D dice only: 4,6,8,10,12,20,100)')
                .setRequired(true)
        ),
    async execute(interaction) {
        const numDice = interaction.options.getInteger('dice');
        const numSides = interaction.options.getInteger('sides');

        if (!allowedDice.includes(numSides)) {
            return interaction.reply({
                content: `⚠️ Invalid die! You can only roll D&D dice: ${allowedDice.join(', ')}`,
                flags: MessageFlags.Ephemeral
            });
        }

        const rolls = [];
        for (let i = 0; i < numDice; i++) {
            rolls.push(Math.floor(Math.random() * numSides) + 1);
        }

        const total = rolls.reduce((a, b) => a + b, 0);

        const maxDisplay = 50;
        let rollsDisplay = rolls
            .slice(0, maxDisplay)
            .map((roll, index) => `Dice ${index + 1}: ${roll}`)
            .join('\n');

        if (rolls.length > maxDisplay) {
            rollsDisplay += `\n...and ${rolls.length - maxDisplay} more dice`;
        }

        await interaction.reply({
            content: `🎲 **Rolled ${numDice}d${numSides}**\n\`\`\`\n${rollsDisplay}\n\`\`\`\n**Total:** ${total}`,
            // no ephemeral here, visible to everyone
        });
    },
};
