const { SlashCommandBuilder } = require('discord.js');
const { addPoints, getPoints, addStreak, getStreak, resetStreak } = require('../../points');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gamble')
        .setDescription('Guess if the sum of two dice will be even or odd, and optionally bet points!')
        .addStringOption(option =>
            option.setName('guess')
                .setDescription('Your guess: even or odd')
                .setRequired(true)
                .addChoices(
                    { name: 'Even', value: 'even' },
                    { name: 'Odd', value: 'odd' }
                )
        )
        .addIntegerOption(option =>
            option.setName('bet')
                .setDescription('Optional: amount of points to bet (must have enough points)')
                .setRequired(false)
                .setMinValue(1)
        ),

    async execute(interaction) {
        const userId = interaction.user.id;
        const guess = interaction.options.getString('guess');
        const bet = interaction.options.getInteger('bet') || 0;

        let userPoints = getPoints(userId);

        if (bet > userPoints) {
            return interaction.reply({ content: `⚠️ You don't have enough points to bet ${bet}. You currently have ${userPoints} points.` });
        }

        // Roll 2d6
        const die1 = Math.floor(Math.random() * 6) + 1;
        const die2 = Math.floor(Math.random() * 6) + 1;
        const sum = die1 + die2;
        const outcome = sum % 2 === 0 ? 'even' : 'odd';

        let streak = getStreak(userId);
        let basePoints = bet > 0 ? bet : 10; // base points is either bet or default 10

        // Apply streak multipliers
        if (streak >= 3) {
            basePoints *= 2; // 2x for 3+ correct
        } else if (streak === 2) {
            basePoints *= 1.5; // 1.5x for 2 correct
        }

        let resultMessage;

        if (guess === outcome) {
            // Correct guess
            streak = addStreak(userId);

            // If betting, double the points
            const pointsEarned = bet > 0 ? basePoints * 2 : basePoints;
            const totalPoints = addPoints(userId, pointsEarned);

            resultMessage = `🎲 You rolled ${die1} + ${die2} = ${sum} (${outcome})!\n✅ Correct! You earned **${pointsEarned} points**.\n💰 Total points: **${totalPoints}**\n🔥 Current streak: **${streak}**`;
        } else {
            // Wrong guess
            resetStreak(userId);

            if (bet > 0) {
                // Subtract bet if user bet points
                userPoints -= bet;
                addPoints(userId, -bet); // deduct points
            }

            resultMessage = `🎲 You rolled ${die1} + ${die2} = ${sum} (${outcome})!\n❌ Wrong guess! ${bet > 0 ? `You lost **${bet} points**.` : 'Your streak has been reset.'}\n💰 Total points: **${getPoints(userId)}**`;
        }

        await interaction.reply({ content: resultMessage });
    },
};
