const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('joke')
        .setDescription('Tells you a random joke from all kinds of categories!'),
    async execute(interaction) {
        const jokes = [
            // Dad Jokes
            "I'm afraid for the calendar. Its days are numbered.",
            "Why did the scarecrow win an award? Because he was outstanding in his field.",
            "I only know 25 letters of the alphabet. I don't know y.",
            
            // Bad Jokes
            "Why did the bicycle fall over? Because it was two-tired.",
            "I tried to make a belt out of watches… it was a waist of time.",
            "I used to play piano by ear, but now I use my hands.",
            
            // Alien Invader Jokes
            "Why don’t aliens eat clowns? Because they taste funny.",
            "How do you organize a space party? You planet.",
            "I met an alien once. Nice guy, but his jokes were out of this world.",
            
            // Tech/Programmer Jokes
            "Why do programmers prefer dark mode? Because light attracts bugs.",
            "I told my computer I needed a break, and it froze.",
            "There are 10 types of people in the world: those who understand binary, and those who don’t.",
            
            // Random Silly Jokes
            "Why can’t your nose be 12 inches long? Because then it would be a foot.",
            "Parallel lines have so much in common… it’s a shame they’ll never meet.",
            "What did the ocean say to the beach? Nothing, it just waved."
        ];

        const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
        await interaction.reply(randomJoke);
    },
};
