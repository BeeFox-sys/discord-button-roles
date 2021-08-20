const mongoose = require("mongoose");
const {Schema} = mongoose;

const messageRoles = new Schema({
    "guildID": String,
    "messageID": String,
    "channelID": String,
    "mode": Number,
    "buttons": [
        {
            "roleID": String,
            "buttonID": String, // messageid-roleid
            "label": String,
            "emoji": String,
            "style": String
        }
    ]
});

module.exports = {
    "MessageRoles": mongoose.model("MessageRoles", messageRoles)
};
