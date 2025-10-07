const { SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

// Only these users can use the reload command
const allowedUsers = [
    'INSERTUSERIDHERE' // this specifies who can use the command
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reloads all commands in the utility folder'),

    async execute(interaction) {
        // Restrict usage
        if (!allowedUsers.includes(interaction.user.id)) {
            return interaction.reply({
                content: "❌ You don't have permission to use this command.",
                ephemeral: true
            });
        }

        const commandsPath = __dirname;
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        let reloaded = [];

        try {
            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);

                // Clear the old cache
                delete require.cache[require.resolve(filePath)];

                // Load the new command
                const newCommand = require(filePath);

                if ('data' in newCommand && 'execute' in newCommand) {
                    interaction.client.commands.set(newCommand.data.name, newCommand);
                    reloaded.push(newCommand.data.name);
                } else {
                    console.log(`[WARNING] The command at ${filePath} is missing "data" or "execute".`);
                }
            }

            // Log success in console
            console.log(`✅ Successfully reloaded ${reloaded.length} command(s) from utility folder: [${reloaded.join(', ')}]`);

            await interaction.reply({
                content: `✅ Reloaded ${reloaded.length} commands from utility folder:\n\`${reloaded.join(', ')}\``,
                ephemeral: true
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: `⚠️ Error reloading commands: \`${error.message}\``,
                ephemeral: true
            });
        }
    },
};
