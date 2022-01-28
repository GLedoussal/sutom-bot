require('dotenv').config()

const fs = require('fs');
const Discord = require('discord.js');
const Intents = Discord.Intents;
const Motus = require('./modules/Motus');

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const intents = new Intents();
intents.add(Intents.FLAGS.GUILDS);

global.client = new Discord.Client({ intents: intents });
client.commands = new Discord.Collection();

global.motusWorker = new Motus();

const commandFolders = fs.readdirSync('./commands');

const slashCommands = [];

for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        client.commands.set(command.name, command);
        if (command.data) {
            slashCommands.push(command.data.toJSON());
        }
    }
}

client.once('ready', async () => {
    console.log('Ready!');

    client.guilds.cache.map(guild => {
        if (slashCommands.length > 0) {
            const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);
            rest.put(Routes.applicationGuildCommands(client.application.id, guild.id), { body: slashCommands })
            .catch(console.error);
        }
    });
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (!client.commands.has(commandName)) return;

    const command = client.commands.get(commandName);

    if (command.perm) {
        let granted = Permission.check(message, command.level);
        if (!granted) return;
    }

    if (client.commands.get(commandName).execute)
        client.commands.get(commandName).execute(interaction);
});

client.login(process.env.TOKEN);