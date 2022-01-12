module.exports = {
    name: 'motus',
    description: 'Pour jouer à motus.',
    async execute(message, args) {
        global.motusWorker.handle(message, args);
    },
};