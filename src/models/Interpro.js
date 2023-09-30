const mongoose = require('mongoose');

const InterproSchema = new mongoose.Schema({

    'gene': {type:String},
    'length':{type:Number}, 
    'interpro_id': {type:String},
    'sourcedb': {type:String},
    'domain': {type:String},
    'domain_description': {type:String},
    'score': {type:Number},
    'species':{type:String}
    
    
});

const resultsdb = mongoose.connection.useDb("hpinetdb")
const InterproAestivums = resultsdb.model('interpro_hosts', InterproSchema)


module.exports ={
    'host':InterproAestivums,
    
}