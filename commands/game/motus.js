const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: "motus",
    data: new SlashCommandBuilder().setName("motus").setDescription("Pour jouer à motus.").addStringOption(option =>
        option.setName("word").setDescription("Votre mot à deviner").setRequired(false)
    ),
    async execute(interaction) {
        const args = [];
        args.push(interaction.options.getString("word"));
        global.motusWorker.handle(interaction, args);
    }
};