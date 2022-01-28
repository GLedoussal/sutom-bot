class Motus {
    constructor() {
        this.games = {};
        this.dictionnary = {};
        require('../assets/dictionnaire.json').forEach(w => {
            this.dictionnary[this.format(w)] = 1;
        });
        this.lettersEmotes = {
            "red": {
                "A": "<:A_red:936677767196573767>",
                    "B": "<:B_red:936677767255318559>",
                    "C": "<:C_red:936677767074938981>",
                    "D": "<:D_red:936677767016243281>",
                    "E": "<:E_red:936677766714228736>",
                    "F": "<:F_red:936677766923976704>",
                    "G": "<:G_red:936677767498580009>",
                    "H": "<:H_red:936677767083339826>",
                    "I": "<:I_red:936677767192395776>",
                    "J": "<:J_red:936677767209164830>",
                    "K": "<:K_red:936677767221751828>",
                    "L": "<:L_red:936677766907191308>",
                    "M": "<:M_red:936677767838326804>",
                    "N": "<:N_red:936677767561482240>",
                    "O": "<:O_red:936677766953312347>",
                    "P": "<:P_red:936677767007846410>",
                    "Q": "<:Q_red:936677767347576923>",
                    "R": "<:R_red:936677767053975693>",
                    "S": "<:S_red:936677767045595267>",
                    "T": "<:T_red:936677766655529081>",
                    "U": "<:U_red:936677767465009202>",
                    "V": "<:V_red:936677767385346149>",
                    "W": "<:W_red:936677767238520952>",
                    "X": "<:X_red:936677767397900358>",
                    "Y": "<:Y_red:936677767242727424>",
                    "Z": "<:Z_red:936677767842508840>"
            },
            "yellow": {
                "A": "<:A_yellow:936681220178317383>",
                    "B": "<:B_yellow:936681220111204452>",
                    "C": "<:C_yellow:936681219746304061>",
                    "D": "<:D_yellow:936681220224454706>",
                    "E": "<:E_yellow:936681220551622656>",
                    "F": "<:F_yellow:936681219989598249>",
                    "G": "<:G_yellow:936681220446761012>",
                    "H": "<:H_yellow:936681220165742632>",
                    "I": "<:I_yellow:936681220073455666>",
                    "J": "<:J_yellow:936681219712761888>",
                    "K": "<:K_yellow:936681220182515722>",
                    "L": "<:L_yellow:936681222162243644>",
                    "M": "<:M_yellow:936681220471943198>",
                    "N": "<:N_yellow:936681220266405908>",
                    "O": "<:O_yellow:936681220178337872>",
                    "P": "<:P_yellow:936681219733729353>",
                    "Q": "<:Q_yellow:936681220715212860>",
                    "R": "<:R_yellow:936681220119621663>",
                    "S": "<:S_yellow:936681220283195444>",
                    "T": "<:T_yellow:936681220107038782>",
                    "U": "<:U_yellow:936681220077682799>",
                    "V": "<:V_yellow:936681219809222658>",
                    "W": "<:W_yellow:936681220463554672>",
                    "X": "<:X_yellow:936681220568404038>",
                    "Y": "<:Y_yellow:936681219997958204>",
                    "Z": "<:Z_yellow:936681219939254302>"
            }
        }

        require('an-array-of-french-words').filter(w => w.length >= 5 && w.length < 10).forEach(w => {
            this.dictionnary[this.format(w)] = 1;
        });
    }

    async handle(interaction, args) {
        if (args.length === 0 || !args[0]) {
            const game = this.newGame(interaction.user.id);
            interaction.reply("\n" + this.lettersEmotes.red[game.word[0]] + " 🟦".repeat(game.word.length-1))
            .catch(e => console.log(e));
        } else {
            const game = this.games[interaction.user.id];
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
                                            acc.string[index] = this.lettersEmotes.yellow[character];
                                        } else {
                                            acc.string[index] = this.lettersEmotes.red[character];
                                        }
                                    } else {
                                        acc.string[index] = this.charToEmoji(character);
                                    }
                                }
                            } else {
                                if (character === game.word[index]) {
                                    acc.string[index] = this.lettersEmotes.red[character];
                                    if (!acc.characters[character]) acc.characters[character] = 1;
                                    else acc.characters[character]++;
                                    acc.done.push(index);
                                }
                            }

                            return acc;
                        }, {string: {}, characters: {}, done: []});
                        game.guesses.push(Object.values(result.string).join(" "));

                        let reply = "Coup n°" + game.guesses.length + "\n" + game.guesses.join("\n");

                        if (result.done.length === game.word.length) {
                            reply += "\nMot trouvé en " + game.guesses.length + " coups.";

                            delete this.games[interaction.user.id];
                        }
                        interaction.reply(reply)
                        .catch(e => console.log(e));
                    } else {
                        interaction.reply("Ton mot n'est pas dans mon dictionnaire de référence")
                        .catch(e => console.log(e));
                    }
                } else {
                    interaction.reply("Ton mot n'est même pas de la bonne taille")
                    .catch(e => console.log(e));
                }
            } else {
                interaction.reply("Tu n'as pas lancé de partie")
                .catch(e => console.log(e));
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