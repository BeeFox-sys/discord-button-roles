const {MessageActionRow, CommandInteraction, MessageButton} = require("discord.js");
const {MessageRoles} = require("../schemas/roles");

module.exports.commandData = {
    "name": "roles",
    "description": "Manages bot roles",
    "type": "CHAT_INPUT",
    "options": [
        {
            "name": "add",
            "description": "Add a role to a message",
            "type": "SUB_COMMAND",
            "options": [
                {
                    "name": "id",
                    "description": "The ID of the message you are updating",
                    "required": true,
                    "type": "STRING"
                },
                {
                    "name": "role",
                    "description": "The role associated with this button",
                    "required": true,
                    "type": "ROLE"
                },
                {
                    "name": "label",
                    "description": "The label of the button",
                    "type": "STRING"
                },
                {
                    "name": "style",
                    "description": "The style of the button",
                    "type": "STRING",
                    "choices": [
                        {
                            "name": "Blurple",
                            "value": 1
                        },
                        {
                            "name": "Grey",
                            "value": 2
                        },
                        {
                            "name": "Red",
                            "value": 4
                        },
                        {
                            "name": "Green",
                            "value": 3
                        }
                    ]
                },
                {
                    "name": "emoji",
                    "description": "Emoji displayed with the message",
                    "type": "STRING"
                }
            ]
        },
        {
            "name": "remove",
            "description": "Removes a button from a message",
            "type": "SUB_COMMAND",
            "options": [
                {
                    "name": "id",
                    "description": "The id of the message you wish to edit",
                    "required": true,
                    "type": "STRING"
                },
                {
                    "name": "role",
                    "description": "The role of the button you would like to remove",
                    "type": "ROLE",
                    "required": true
                }
            ]
        },
        {
            "name": "cleanup",
            "description": "Removes buttons that do not have roles associated with them",
            "type": "SUB_COMMAND",
            "options": [
                {
                    "name": "id",
                    "description": "The id of the message you wish to edit",
                    "required": true,
                    "type": "STRING"
                }
            ]
        }
    ]
};


module.exports.command = function command (interaction) {

    if (!interaction.member.permissions.has("MANAGE_GUILD")) {

        interaction.reply({
            "epherical": true,
            "content": "You do not have permission"
        });
    
    }

    switch (interaction.options.getSubcommand()) {

    case "add": add(interaction);
        break;
    case "remove": remove(interaction);
        break;
    case "cleanup": cleanup(interaction);
        break;
    default: break;
        
    }

};

/**
 * Adds a button to a message
 * @param {Interaction} interaction
 */
async function add (interaction) {

    const id = interaction.options.get("id").value;
    const messageEntry = await MessageRoles.findOne({"messageID": id});

    if (!messageEntry || messageEntry.guildID !== interaction.guild.id) {

        interaction.reply({
            "epherical": true,
            "content": "That message is not editable!"
        });
        
        return;
    
    }

    if (!interaction.options.get("label")?.value && !interaction.options.get("emoji")?.value) {

        interaction.reply({
            "epherical": true,
            "content": "You must have at least one of `emoji` and `label`"
        });
        
        return;
    
    }

    if (interaction.options.get("label")?.value && interaction.options.get("label").value?.length > 80) {

        interaction.reply({
            "epherical": true,
            "content": "`label` must be less then 80 characters"
        });
        
        return;
    
    }

    // eslint-disable-next-line require-unicode-regexp
    const emojiRegex = /(?:\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]|<a?:.+?:\d+>)/i;

    if (interaction.options.get("emoji")?.value && !emojiRegex.test(interaction.options.get("emoji").value)) {

        interaction.reply({
            "epherical": true,
            "content": "`emoji` must be an emoji"
        });
        
        return;
    
    }

    if (messageEntry.buttons.length === 25) {

        interaction.reply({
            "epherical": true,
            "content": "There is a max of 25 buttons per message!"
        });
        
        return;
    
    }

    if (messageEntry.buttons.filter((elem) => elem.roleID === interaction.options.get("role").value).length) {

        interaction.reply({
            "epherical": true,
            "content": "That Role is already in the list!"
        });
        
        return;
    
    }

    const channel = await interaction.guild.channels.fetch(messageEntry.channelID);
    const message = await channel.messages.fetch(messageEntry.messageID);


    // Create New Button
    messageEntry.buttons.push({
        "roleID": interaction.options.get("role").value,
        "buttonID": `${message.id}-${interaction.options.get("role").value}`, // messageid-roleid
        "label": interaction.options.get("label")?.value ?? null,
        "emoji": interaction.options.get("emoji")?.value.match(emojiRegex)[0] ?? null,
        "style": interaction.options.get("style")?.value ?? 2
    });

    messageEntry.save().then(async (newEntry) => {

        const components = [new MessageActionRow()];
        
        let row = 0;

        for (let index = 0; index < 25; index++) {
            
            const button = newEntry.buttons.shift();

            if (button) {

                if (components[row].components.length === 5) {

                    components.push(new MessageActionRow());
                    row++;
                
                }

                const {label, emoji, style, buttonID} = button;


                const newButton = new MessageButton({
                    label,
                    style,
                    "custom_id": buttonID
                });

                if (emoji) {

                    newButton.setEmoji(emoji);

                }

                components[row].addComponents(newButton);
            
            }
        
        }

        // console.log(components);

        await message.edit({
            "content": message.content,
            components
        });

        interaction.reply({
            "content": "Added Role!",
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
        });

    });
    
}

/**
 * removes a role from a message list
 * @param {Interaction} interaction
 */
async function remove (interaction) {


    const id = interaction.options.get("id").value;
    const messageEntry = await MessageRoles.findOne({"messageID": id});

    if (!messageEntry || messageEntry.guildID !== interaction.guild.id) {

        interaction.reply({
            "epherical": true,
            "content": "That message is not editable!"
        });
        
        return;
    
    }

    if (!messageEntry.buttons.filter((elem) => elem.roleID === interaction.options.get("role").value).length) {

        interaction.reply({
            "epherical": true,
            "content": "That Role isn't in the list!"
        });
        
        return;
    
    }
    
    
    const buttonIndex = messageEntry.buttons.indexOf((elem) => elem.roleID === interaction.options.get("role").value);

    messageEntry.buttons.splice(buttonIndex, 1);

    messageEntry.save().then(async (newEntry) => {

        const components = [];
        
        let row = 0;

        if (messageEntry.buttons.length > 0) {

            components.push(new MessageActionRow());
        
        }

        for (let index = 0; index < 25; index++) {
            
            const button = newEntry.buttons.shift();

            if (button) {

                if (components[row].components.length === 5) {

                    components.push(new MessageActionRow());
                    row++;
                
                }

                const {label, emoji, style, "buttonID": custom_id} = button;


                components[row].addComponents({
                    label,
                    emoji,
                    style,
                    custom_id,
                    "type": 2
                });
            
            }
        
        }

        const channel = await interaction.guild.channels.fetch(messageEntry.channelID);
        const message = await channel.messages.fetch(messageEntry.messageID);

        await message.edit({
            "content": message.content,
            components
        });

        interaction.reply({
            "content": "Removed Role!",
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
        });
    
    });

}

/**
 *
 * @param {CommandInteraction} interaction
 */
async function cleanup (interaction) {

    const id = interaction.options.get("id").value;
    const messageEntry = await MessageRoles.findOne({"messageID": id});

    if (!messageEntry || messageEntry.guildID !== interaction.guild.id) {

        interaction.reply({
            "epherical": true,
            "content": "That message is not editable!"
        });
    
    }

    /**
     *
     * @param {Object} button
     * @returns {Boolean}
     */
    async function buttonFilter (button) {

        return await interaction.guild.roles.fetch(button.roleID) !== null;
    
    }

    const correctButtons = [];

    for (const button of messageEntry.buttons) {

        if (await buttonFilter(button)) {

            correctButtons.push(button);

        }
    
    }

    messageEntry.buttons = correctButtons;
    await messageEntry.save();

    const components = [];
        
    let row = 0;

    if (messageEntry.buttons.length > 0) {

        components.push(new MessageActionRow());
        
    }

    for (let index = 0; index < 25; index++) {
            
        const button = messageEntry.buttons.shift();

        if (button) {

            if (components[row].components.length === 5) {

                components.push(new MessageActionRow());
                row++;
                
            }

            const {label, emoji, style, "buttonID": custom_id} = button;


            components[row].addComponents({
                label,
                emoji,
                style,
                custom_id,
                "type": 2
            });
            
        }
        
    }

    const channel = await interaction.guild.channels.fetch(messageEntry.channelID);
    const message = await channel.messages.fetch(messageEntry.messageID);

    await message.edit({
        "content": message.content,
        components
    });

    interaction.reply({
        "content": "Cleaned up any deleted roles!",
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
    });
    

}
