const mongoose = require('mongoose');

const KEGGSchema = new mongoose.Schema({

    'gene': {type:String},
    'pathway':{type:String}, 
    'description': {type:String},
    'species':{type:String},
    
});

const resultsdb = mongoose.connection.useDb("hpinetdb")
const KEGGAestivums = resultsdb.model('kegg_hosts', KEGGSchema)
const KEGGTurgidums = resultsdb.model('kegg_pathogens', KEGGSchema)


module.exports ={
    'host':KEGGAestivums,
    'pathogen':KEGGTurgidums,
    
}