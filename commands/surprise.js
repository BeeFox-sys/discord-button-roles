const {MessageActionRow} = require("discord.js");

module.exports.commandData = {
    "name": "surprise",
    "description": "it's a surprise"
};

module.exports.command = function command (interaction) {

    const rowOne = new MessageActionRow()
        .addComponents([
            {
                "label": "Open Gift",
                "type": 2,
                "emoji": "🎁",
                "style": "SECONDARY",
                "customID": `${module.exports.commandData.name}_surprise`
            }
        ]);

    interaction.reply({
        "content": "** **",
        "components": [rowOne]
    });

};
module.exports.buttons = {};
module.exports.buttons.surprise = async function surprise (interaction) {


    const surprises = [
        [
            "<a:stickbug:801496853157249145>",
            "Get Stickbugged lol"
        ],
        [
            "🩳",
            "Get Tillmaned lol"
        ],
        [
            "<a:bongorichmond:795066662432538645>",
            "Reply if Richmond Harrason is your best friend also."
        ],
        [
            "<a:SonicDD:800231493447712798>",
            "sonic needs your credit card details to stop dr robotnik!"
        ]
    ];

    const [
        emoji,
        text
    ] = surprises[Math.floor(Math.random() * surprises.length)];

    const rowOne = new MessageActionRow()
        .addComponents([
            {
                "label": text,
                "type": 2,
                emoji,
                "style": "SUCCESS",
                "customID": `${module.exports.commandData.name}_surpriseEnded`,
                "disabled": true
            }
        ]);


    interaction.update({
        "content": "🎉",
        "components": [rowOne]
    });
    
};
