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
client.on("messageCreate", async (message) => {

    if (!client.application?.owner) {

        await client.application?.fetch();

    }

    if (client.application?.owner.id === message.author.id) {

        if (message.content === "roles!deploy global") {

            await deploy(client);

            message.channel.send("Deployed Globaly!", {"messageReference": message.id});

        
        } else if (message.guild && message.content === "roles!deploy") {

            await deploy(client, message.guild.id);

            message.channel.send("Deployed!", {"messageReference": message.id});
        
        }
        
    
    }

});

const commands = require("./commands");

const assignRole = require("./assignRole");


client.on("interaction", (interaction) => {

    if (!interaction.guild) {

        interaction.reply("No can do! I am a guild only bot!");
    
    }

    if (interaction.isCommand()) {

        commands[interaction.commandName].command(interaction);
    
    } else if (interaction.isButton()) {

        const [
            commandName,
            buttonName
        ] = interaction.customID.split("_");

        if (commands[commandName]?.buttons[buttonName]) {

            commands[commandName].buttons[buttonName](interaction);

        } else {

            assignRole(interaction);
        
        }
    
    } else {

        console.log(interaction);
    
    }

});


client.on("ready", () => {

    console.log("bot connected  ");

});

const mongoose = require("mongoose");

mongoose.connect(process.env.DB_URL, {"useNewUrlParser": true,
    "useUnifiedTopology": true});
const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {

    console.log("db connected");
    client.login(process.env.TOKEN);

});


