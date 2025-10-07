const { addPoints } = require('../points');

module.exports = {
    name: 'messageCreate',
    execute(message) {
        if (message.author.bot) return;

        // Give random points between 1-5 for activity
        const earned = Math.floor(Math.random() * 5) + 1;
        const total = addPoints(message.author.id, earned);
    }
};
