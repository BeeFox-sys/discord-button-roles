module.exports.commandData = {
    "name": "echo",
    "description": "responds with your text",
    "options": [
        {
            "type": "STRING",
            "name": "input",
            "description": "What you want echoed",
            "required": true
        }
    ]
};

module.exports.command = function command (interaction) {

    interaction.reply(interaction.options.get("input").value);

};
