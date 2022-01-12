require('dotenv').config();

const fs = require('fs');
const Discord = require('discord.js');

global.client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFolders = fs.readdirSync('./commands');
for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        client.commands.set(command.name, command);
    }
}


client.once('ready', () => {
    console.log('Ready!');
});

const Motus = require('./modules/Motus');
global.motusWorker = new Motus();

client.on('message', message => {
    if (message.author.bot) return;

    if (!message.content.startsWith(process.env.PREFIX)) return;

    const messageArgs = message.content.slice(process.env.PREFIX.length).trim().split(/ +/);
    const messageCommand = messageArgs.shift().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (!client.commands.has(messageCommand)) return;

    try {
        const command = client.commands.get(messageCommand);

        if (command.perm) {
            let granted = Permission.check(message, command.level);
            if (!granted) return;
        }

        if (command.args && !messageArgs.length) {
            let reply = `Les calculs sont pas bons, ${message.author}!`;

            if (command.usage) {
                reply += `\nCette commande s'utilise comme ça: \`${process.env.PREFIX}${command.name} ${command.usage}\``;
            }

            return message.channel.send(reply);
        }

        try {
            command.execute(message, messageArgs);
        } catch (error) {
            console.error(error);
            message.reply('je suis désolée mais je n\'ai pas réussi à exécuter ta commande.');
        }
    } catch (error) {
        console.error(error);
    }
});

client.login(process.env.TOKEN);