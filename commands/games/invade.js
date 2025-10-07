// commands/games/invade.js
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { addPoints, getPoints, addStreak, getStreak, resetStreak } = require('../../points');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invade')
    .setDescription('Aliens incoming! Try to defend the humans — quick mini-game (1 player)'),

  async execute(interaction) {
    // No defers here — quick response
    const userId = interaction.user.id;

    // Simple premise: user chooses "Shield" vs "Laser"
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('shield').setLabel('Raise Shield 🛡️').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('laser').setLabel('Fire Laser 🔫').setStyle(ButtonStyle.Danger),
      );

    await interaction.reply({
      content: 'Alien scouts approaching! Choose quickly — Shield or Laser? (you have 15s)',
      components: [row]
    });

    const filter = i => i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000, max: 1 });

    collector.on('collect', async i => {
      // disable buttons immediately
      try { await i.update({ content: 'Resolving...', components: [] }); } catch (e) { console.error(e); }

      // Alien tactic: random choice biasable
      const alienChoice = Math.random() < 0.5 ? 'shield' : 'laser';

      // Outcome table (rock-paper-scissors style)
      // shield beats laser? we'll define:
      // - If both same: stalemate -> small reward
      // - If player shield and alien laser -> defend success (player wins)
      // - If player laser and alien shield -> alien breaks through (player loses)
      let resultText;
      let pointsEarned = 0;

      if (i.customId === alienChoice) {
        // tie
        pointsEarned = 3;
        addPoints(userId, pointsEarned);
        addStreak(userId); // minor streak increment
        resultText = `Stalemate! Both sides used **${i.customId.toUpperCase()}**. You earn ${pointsEarned} points.`;
      } else if (i.customId === 'shield' && alienChoice === 'laser') {
        // player defends successfully
        // reward scales with streak
        const streak = getStreak(userId);
        const base = 10;
        const multiplier = 1 + Math.min(streak, 5) * 0.2; // up to +100%
        pointsEarned = Math.floor(base * multiplier);
        addPoints(userId, pointsEarned);
        const newStreak = addStreak(userId);
        resultText = `Success! You raised the shield and stopped the alien laser. You earn **${pointsEarned} points** (streak ${newStreak}).`;
      } else {
        // player laser vs alien shield -> loss
        resetStreak(userId);
        // Optionally small consolation
        pointsEarned = 0;
        resultText = `Oh no — the alien shield held. You failed to defend this round and your streak was reset.`;
      }

      const totalPoints = getPoints(userId);
      await interaction.followUp({ content: `${resultText}\n💰 You now have **${totalPoints} points**.` });
    });

    collector.on('end', async collected => {
      if (collected.size === 0) {
        // user didn't respond in time
        try {
          await interaction.editReply({ content: 'You didn’t react in time — the aliens retreated... for now.', components: [] });
        } catch (e) { console.error(e); }
      }
    });
  }
};
