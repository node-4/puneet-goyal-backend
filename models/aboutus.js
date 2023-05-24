const mongoose = require("mongoose"); 

const aboutUs  = mongoose.Schema({
    about: {
        type: String
    }
})



const about  = mongoose.model('about', aboutUs);

module.exports = about;