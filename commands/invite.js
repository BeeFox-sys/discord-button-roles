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
        "content": interaction.client.generateInvite({
            "scopes": ["bot"],
            "permissions": [
                FLAGS.MANAGE_ROLES,
                FLAGS.USE_APPLICATION_COMMANDS,
                FLAGS.SEND_MESSAGES,
                FLAGS.VIEW_CHANNEL,
                FLAGS.READ_MESSAGE_HISTORY
            ]
        }),
        "ephemeral": true
    });

};
