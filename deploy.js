
module.exports = async function deploy (client, guild = null) {
    
    const commands = require("./commands");

    if (!client.application?.owner) {

        await client.application?.fetch();

    }

    const data = [];

    for (const name in commands) {

        if (Object.hasOwnProperty.call(commands, name)) {

            const command = commands[name];

            if (command.commandData) {

                data.push(command.commandData);

            }

        
        }
    
    }

    let setCommands = null;

    if (guild) {

        setCommands = client.guilds.cache.get(guild)?.commands.set(data);
    
    } else {

        setCommands = client.application?.commands.set(data);
    
    }
    setCommands.then(console.log);

};
