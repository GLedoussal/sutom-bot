class Motus {
    constructor() {
        this.games = {};
        this.dictionnary = {};

        require('an-array-of-french-words').filter(w => w.length >= 5 && w.length < 10).forEach(w => {
            this.dictionnary[this.format(w)] = 1;
        });
    }

    async handle(message, args) {
        if (args.length === 0) {
            const game = this.newGame(message.author.id);
            message.reply("\n" + this.charToEmoji(game.word[0]) + " 🟦".repeat(game.word.length-1));
        } else {
            const game = this.games[message.author.id];
            if (game) {
                if (args[0].length === game.word.length) {

                    args[0] = this.format(args[0]);

                    if (this.dictionnary[args[0]]) {
                        const result = args[0].repeat(2).split('').reduce((acc, character, index) => {
                            if (index > (args[0].length - 1)) {
                                index -= (args[0].length);

                                if (acc.done.indexOf(index) === -1) {
                                    const regex = new RegExp(character, "g");
                                    if (game.word.match(regex)) {

                                        if (!acc.characters[character]) acc.characters[character] = 1;
                                        else acc.characters[character]++;

                                        if (acc.characters[character] <= game.characters[character]) {
                                            acc.string[index] = "🟡";
                                        } else {
                                            acc.string[index] = "🟦";
                                        }
                                    } else {
                                        acc.string[index] = "🟦";
                                    }
                                }
                            } else {
                                if (character === game.word[index]) {
                                    acc.string[index] = this.charToEmoji(character);
                                    if (!acc.characters[character]) acc.characters[character] = 1;
                                    else acc.characters[character]++;
                                    acc.done.push(index);
                                }
                            }

                            return acc;
                        }, {string: {}, characters: {}, done: []});
                        game.guesses.push(Object.values(result.string).join(" "));

                        let reply = "\n" + game.guesses.join("\n");

                        if (result.done.length === game.word.length) {
                            reply += "\nMot trouvé en " + game.guesses.length + " coups.";

                            delete this.games[message.author.id];
                        }
                        message.reply(reply);
                    } else {
                        message.channel.send("Ton mot n'est pas dans mon dictionnaire de référence");
                    }
                } else {
                    message.channel.send("Ton mot n'est même pas de la bonne taille");
                }
            } else {
                message.channel.send("Tu n'as pas lancé de partie");
            }
        }
    }

    newGame(userId) {

        const words = Object.keys(this.dictionnary);
        this.games[userId] = {
            word: this.format(words[Math.floor(Math.random()*words.length)]),
            guesses : []
        };

        this.games[userId].characters = this.games[userId].word.split('').reduce((acc, character) => {
            if (!acc[character]) acc[character] = 1;
            else acc[character]++;
            return acc;
        }, {});

        return this.games[userId];
    }

    charToEmoji(c) {
        return String.fromCodePoint(c.toLowerCase().charCodeAt() + 127365);
    }

    format(str) {
        return str.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }
}

module.exports = Motus;