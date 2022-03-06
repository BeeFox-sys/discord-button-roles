const {Permissions} = require("discord.js");
const {FLAGS} = Permissions;

/** @type {import("discord.js").ApplicationCommandData} */
module.exports.commandData = {
    "name": "invite",
    "description": "Invite the bot to your guild",
    "type": "CHAT_INPUT"
};

/**
 *
 * @param {CommandInteraction} interaction
 */
module.exports.command = function command (interaction) {

    interaction.reply({
        "content": `You can invite role bearer with this link: ${interaction.client.generateInvite({
            "scopes": [
                "bot",
                "applications.commands"
            ],
            "permissions": [
                FLAGS.MANAGE_ROLES,
                FLAGS.USE_APPLICATION_COMMANDS,
                FLAGS.SEND_MESSAGES,
                FLAGS.VIEW_CHANNEL,
                FLAGS.READ_MESSAGE_HISTORY
            ]
        })}\nIf you want to support rolebearer's server costs, you can donate to Beefox at https://liberapay.com/beefox/ (An open source donation service)`,
        "ephemeral": false
    });

};
