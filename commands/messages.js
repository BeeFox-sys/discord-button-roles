const {MessageActionRow, Interaction, CommandInteraction} = require("discord.js");
const {MessageRoles} = require("../schemas/roles");

module.exports.commandData = {
    "name": "message",
    "description": "Manages bot messages",
    "type": "CHAT_INPUT",
    "options": [
        {
            "name": "create",
            "description": "Creates a message that can hold roles",
            "type": "SUB_COMMAND",
            "options": [
                {
                    "name": "channel",
                    "description": "The channel in which to create the message",
                    "required": true,
                    "type": "CHANNEL"
                },
                {
                    "name": "content",
                    "description": "The content for the message",
                    "type": "STRING"
                }
            ]
        },
        {
            "name": "edit",
            "description": "Edits a message that can hold roles",
            "type": "SUB_COMMAND",
            "options": [
                {
                    "name": "id",
                    "description": "The id of the message you wish to edit",
                    "required": true,
                    "type": "STRING"
                },
                {
                    "name": "content",
                    "description": "The content for the message",
                    "type": "STRING",
                    "required": true
                }
            ]
        },
        {
            "name": "mode",
            "description": "Edits a messages role mode",
            "type": "SUB_COMMAND",
            "options": [
                {
                    "name": "id",
                    "description": "The id of the message you wish to edit",
                    "required": true,
                    "type": "STRING"
                },
                {
                    "name": "mode",
                    "description": "The role mode for the message",
                    "type": "INTEGER",
                    "required": true,
                    "choices": [
                        {
                            "name": "Replace Role",
                            "value": 1
                        },
                        {
                            "name": "Toggle Role",
                            "value": 0
                        },
                        {
                            "name": "Give Role",
                            "value": 2
                        },
                        {
                            "name": "Take Role",
                            "value": 3
                        }
                    ]
                }
            ]
        }
    ]
};

/**
 *
 * @param {CommandInteraction} interaction
 */
module.exports.command = function command (interaction) {

    if (!interaction.member.permissions.has("MANAGE_GUILD")) {

        interaction.reply({
            "epherical": true,
            "content": "You do not have permission"
        }).catch((error) => {

            console.error("Interaction timed out:", error.stack, error);
        
        });
        
        return;
    
    }

    switch (interaction.options.getSubcommand()) {

    case "create": create(interaction);
        break;
    case "edit": edit(interaction);
        break;
    case "mode": mode(interaction);
        break;
    default: break;
    
    }

};

/**
 * Creates an interaction message
 * @param {Interaction} interaction
 */
async function create (interaction) {

    const rowOne = new MessageActionRow()
        .addComponents([
            {
                "label": "How to add roles",
                "type": 2,
                "emoji": "❓",
                "style": 2,
                "custom_id": `${module.exports.commandData.name}_addRoles`
            }
        ]);

    interaction.reply("Creating Message...").catch((error) => {

        console.error("Interaction timed out:", error.stack, error);
    
    });

    const message = await interaction.options.get("channel").channel.send({
        "content": interaction.options.get("content")?.value ?? "** **",
        "components": [rowOne]
    }).catch((error) => {

        console.error("Error creating message:", error);
    
    });

    await new MessageRoles({
        "guildID": message.guild.id,
        "channelID": message.channel.id,
        "messageID": message.id,
        "replace": false,
        "buttons": [],
        "mode": 0
    }).save();

    interaction.followUp({
        "content": "Message Created!",
        "components": [
            {
                "type": "ACTION_ROW",
                "components": [
                    {
                        "type": 2,
                        "label": "Jump!",
                        "style": 5,
                        "url": message.url
                    }
                ]
            }
        ]
    }).catch((error) => {

        console.error("Interaction timed out:", error.stack, error);
    
    });
   
}

/**
 * edits a message
 * @param {Interaction} interaction
 */
async function edit (interaction) {

    const id = interaction.options.get("id").value;
    const messageEntry = await MessageRoles.findOne({"messageID": id});

    if (!messageEntry || messageEntry.guildID !== interaction.guild.id) {

        interaction.reply({
            "epherical": true,
            "content": "That message is not editable!"
        }).catch((error) => {

            console.error("Interaction timed out:", error.stack, error);
        
        });
        
        return;
    
    }

    const channel = await interaction.guild.channels.fetch(messageEntry.channelID);
    const message = await channel.messages.fetch(messageEntry.messageID);

    await message.edit(interaction.options.get("content").value)
        .catch((error) => {

            console.error("Error editing message:", error);

        });

    interaction.reply({
        "content": "Edited Message!",
        "components": [
            {
                "type": "ACTION_ROW",
                "components": [
                    {
                        "type": 2,
                        "label": "Jump!",
                        "style": 5,
                        "url": message.url
                    }
                ]
            }
        ]
    }).catch((error) => {

        console.error("Interaction timed out:", error.stack, error);
    
    });

}


module.exports.buttons = {};
module.exports.buttons.addRoles = async function addRoles (interaction) {


    interaction.reply({
        "content": "To add roles to this message, simply use `/roles add [role] [emoji] [name] [messageID]. The message ID for this message is:",
        "ephemeral": true
    }).catch((error) => {

        console.error("Interaction timed out:", error.stack, error);
    
    });
    interaction.followUp({
        "ephemeral": true,
        "content": interaction.message.id
    }).catch((error) => {

        console.error("Interaction timed out:", error.stack, error);
    
    });
    
};

const messageModeTypes = {
    "0": "toggle",
    "1": "replace",
    "2": "give",
    "3": "remove"
};


/**
 *
 * @param {Interaction} interaction
 */
async function mode (interaction) {

    const id = interaction.options.get("id").value;
    const messageEntry = await MessageRoles.findOne({"messageID": id});

    if (!messageEntry || messageEntry.guildID !== interaction.guild.id) {

        interaction.reply({
            "epherical": true,
            "content": "That message is not editable!"
        }).catch((error) => {

            console.error("Interaction timed out:", error.stack, error);
        
        });
        
        return;
    
    }

    const messageMode = interaction.options.get("mode").value;

    messageEntry.mode = messageMode;
    messageEntry.save();

    interaction.reply({
        "content": `Role assignment mode set to: ${messageModeTypes[messageMode]}`
    }).catch((error) => {

        console.error("Interaction timed out:", error.stack, error);
    
    });

}
