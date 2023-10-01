const mongoose = require('mongoose');

const GOSchema = new mongoose.Schema({

    'gene': {type:String},
    'term':{type:String}, 
    'description': {type:String},
    'definition': {type:String},
    'evidence':{type:String}, 
    'ontology':{type:String},
    
});



const resultsdb = mongoose.connection.useDb("hpinetdb")
const GOHost = resultsdb.model('go_hosts', GOSchema)
const GOPathogen = resultsdb.model('go_pathogens', GOSchema)


module.exports ={
    'host':GOHost,
    'pathogen':GOPathogen,
   
}



