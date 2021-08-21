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
    ] = interaction.customId.split("-");

    const role = await interaction.guild.roles.fetch(roleID);

    /** @type {Model} */
    const messageEntry = await MessageRoles.findOne({messageID});
    const {member} = interaction;

    if (!role) {

        interaction.followUp({
            "ephemeral": true,
            "content": "The role for this button has been deleted! Please contact a moderator!"
        }).catch((error) => {

            console.error("Interaction timed out:", error.stack, error);
        
        });
    
    }

    // console.log(role, messageEntry, member);
    
    if (messageEntry.mode === 0) {

        // Toggle
        try {

            if (member.roles.cache.has(role.id)) {

                await member.roles.remove(role);
                interaction.deferUpdate();
            
            } else {

                await member.roles.add(role);
                interaction.deferUpdate();

            }
        
        } catch (error) {

            console.error("Error assiging toggle role:", error);
        
        }

    } else if (messageEntry.mode === 1) {

        // Replace
        try {

            const allRoles = messageEntry.buttons.map((button) => button.roleID).filter((testedRole) => testedRole !== testedRole.id);

            await member.roles.remove(allRoles);
            await member.roles.add(role);
            interaction.deferUpdate();
        
        } catch (error) {

            console.error("Error assiging replacement role:", error);
    
        }

    } else if (messageEntry.mode === 2) {

        // Give

        try {

            await member.roles.add(role);
            interaction.deferUpdate();
        
        } catch (error) {

            console.error("Error assiging role:", error);
    
        }
    
    } else if (messageEntry.mode === 3) {

        // Remove

        try {

            await member.roles.remove(role);
            interaction.deferUpdate();
        
        } catch (error) {

            console.error("Error removing role:", error);
    
        }
    
    }


};
