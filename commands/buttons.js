const {MessageActionRow} = require("discord.js");

module.exports.commandData = {
    "name": "button-test",
    "description": "Tests Buttons"
};

module.exports.command = function command (interaction) {

    const rowOne = new MessageActionRow()
        .addComponents([
            {
                "label": "Click Me!",
                "type": 2,
                "emoji": "🖱",
                "style": "PRIMARY",
                "customID": `${module.exports.commandData.name}_ClickMe`
            }
        ]);

    interaction.reply({
        "content": "Click the buttons!",
        "components": [rowOne]
    });

};
module.exports.buttons = {};
module.exports.buttons.ClickMe = async function ClickMe (interaction) {

    const rowOne = new MessageActionRow()
        .addComponents([
            {
                "label": ":O!",
                "type": 2,
                "emoji": "<a:stickbug:801496853157249145>",
                "style": "SUCCESS",
                "customID": `${module.exports.commandData.name}_ClickMe`,
                "disabled": true
            }
        ]);


    interaction.update({
        "content": "woah,,",
        "components": [rowOne]
    });
    
};
