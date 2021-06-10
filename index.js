require("dotenv").config();
const {Client} = require("discord.js");
const deploy = require("./deploy");
const client = new Client({
    "intents": [
        "GUILD_MESSAGES",
        "GUILD_INTEGRATIONS",
        "GUILD_WEBHOOKS",
        "GUILDS"
    ]
});

// Deploy Commands
client.on("message", async (message) => {

    if (!client.application?.owner) {

        await client.application?.fetch();

    }

    if (client.application?.owner.id === message.author.id) {

        if (message.content === "emoji!deploy global") {

            await deploy(client);

            message.channel.send("Deployed Globaly!", {"messageReference": message});

        
        } else if (message.guild && message.content === "emoji!deploy") {

            await deploy(client, message.guild.id);

            message.channel.send("Deployed!", {"messageReference": message});
        
        }
        
    
    }

});

const commands = require("./commands");

client.on("interaction", (interaction) => {

    if (interaction.isCommand()) {

        commands[interaction.commandName].command(interaction);
    
    } else if (interaction.isButton()) {

        const [
            commandName,
            buttonName
        ] = interaction.customID.split("_");

        if (commands[commandName].buttons[buttonName]) {

            commands[commandName].buttons[buttonName](interaction);

        }
    
    } else {

        console.log(interaction);
    
    }

});


client.on("ready", () => {

    console.log("ready");

});
client.login(process.env.TOKEN);
