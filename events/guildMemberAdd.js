const ROLE_ID = "ENTERROLEIDHERE"; // 👈 replace with your role ID

module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client) {
        try {
            // Send welcome DM
            await member.send(
                `👋 Welcome to **${member.guild.name}**, ${member.displayName}! We're glad to have you here.`
            );
        } catch (err) {
            console.error(`❌ Could not DM ${member.user.tag}. They may have DMs disabled.`);
        }

        try {
            // Assign role
            const role = member.guild.roles.cache.get(ROLE_ID);
            if (role) {
                await member.roles.add(role);
                console.log(`✅ Assigned role "${role.name}" to ${member.user.tag}`);
            } else {
                console.error(`❌ Role with ID ${ROLE_ID} not found in ${member.guild.name}`);
            }
        } catch (err) {
            console.error(`❌ Failed to assign role to ${member.user.tag}`, err);
        }
    },
};
