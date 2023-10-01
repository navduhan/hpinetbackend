const mongoose = require('mongoose');

const LocalSchema = new mongoose.Schema({

    'gene': {type:String}, 
    'location': {type:String},
    
});

const resultsdb = mongoose.connection.useDb("hpinetdb")
const LocalHosts = resultsdb.model('local_hosts', LocalSchema)
const LocalPathogens = resultsdb.model('local_pathogens', LocalSchema)


module.exports ={
    'host':LocalHosts,
    'pathogen':LocalPathogens,
    
}