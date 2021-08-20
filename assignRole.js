/* eslint-disable no-unused-vars */
const {ButtonInteraction} = require("discord.js");
const {Model} = require("mongoose");
/* eslint-enable no-unused-vars */
const {MessageRoles} = require("./schemas/roles");


/**
 *
 * @param {ButtonInteraction} interaction
 */
module.exports = async function assignRole (interaction) {
    
    const [
        messageID,
        roleID
    ] = interaction.customID.split("-");

    const role = await interaction.guild.roles.fetch(roleID);

    /** @type {Model} */
    const messageEntry = await MessageRoles.findOne({messageID});
    const {member} = interaction;

    if (!role) {

        interaction.followUp({
            "ephemeral": true,
            "content": "The role for this button has been deleted! Please contact a moderator!"
        });
    
    }

    // console.log(role, messageEntry, member);
    
    if (messageEntry.mode === 0) {

        // Toggle

        if (member.roles.cache.has(role)) {

            await member.roles.remove(role);
            interaction.deferUpdate();
        
        } else {

            await member.roles.add(role);
            interaction.deferUpdate();


        }

    } else if (messageEntry.mode === 1) {

        // Replace

        const allRoles = messageEntry.buttons.map((button) => button.roleID).filter((testedRole) => testedRole !== testedRole.id);

        await member.roles.remove(allRoles);
        await member.roles.add(role);
        interaction.deferUpdate();


    } else if (messageEntry.mode === 2) {

        // Give

        await member.roles.add(role);
        interaction.deferUpdate();

    } else if (messageEntry.mode === 3) {

        // Remove

        await member.roles.remove(role);
        interaction.deferUpdate();

    }


};
