const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const AdmZip = require('adm-zip'); // install with `npm install adm-zip`

// ✅ CHANGE THESE
const AUTHORIZED_USERS = ['123456789012345678']; // your Discord ID(s)
const GITHUB_ZIP_URL = 'https://github.com/YourUsername/YourRepo/archive/refs/heads/main.zip'; // direct download URL to main branch
const BOT_PATH = path.resolve(__dirname, '..'); // root bot directory

module.exports = {
    data: new SlashCommandBuilder()
        .setName('update')
        .setDescription('Downloads the latest version of the bot from GitHub and updates automatically.'),
    
    async execute(interaction) {
        if (!AUTHORIZED_USERS.includes(interaction.user.id)) {
            return interaction.reply({ content: '❌ You are not authorized to use this command.', ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const zipPath = path.join(BOT_PATH, 'update.zip');
            const writer = fs.createWriteStream(zipPath);

            const response = await axios({
                url: GITHUB_ZIP_URL,
                method: 'GET',
                responseType: 'stream'
            });

            await new Promise((resolve, reject) => {
                response.data.pipe(writer);
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            const zip = new AdmZip(zipPath);
            zip.extractAllTo(BOT_PATH, true);
            fs.unlinkSync(zipPath);

            await interaction.editReply('✅ Update downloaded and installed successfully. Restarting the bot...');

            // Restart process
            setTimeout(() => {
                child_process.spawn(process.argv[0], process.argv.slice(1), {
                    detached: true,
                    stdio: 'inherit'
                });
                process.exit(0);
            }, 3000);

        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Failed to update the bot. Check console for details.');
        }
    }
};
