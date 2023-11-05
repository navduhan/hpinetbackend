const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const getPPI = require("../introlog/introlog");
const GO = require("../models/GO");
const KEGG = require("../models/KEGG");
const Interpro = require("../models/Interpro");
const Local = require("../models/Local");
const TF = require("../models/TF");
const Effector = require("../models/Effector");
const mongoose = require('mongoose');
const getGOPPI = require("../gosemsim/goPPI");
const getphyloPPI = require("../phylo/phylo");
const wheatSchema = new mongoose.Schema({
  Host_Protein: { type: String },
  Pathogen_Protein: { type: String },
  ProteinA: { type: String },
  ProteinB: { type: String },
  intdb_x: { type: String },
  Method: { type: String },
  Type: { type: String },
  Confidence: { type: String },
  PMID: { type: String },
});

const GOPPISchema = new mongoose.Schema({
  Host_Protein: { type: String },
  Pathogen_Protein: { type: String },
  Host_GO: { type: String },
  Pathogen_GO: { type: String },
  score: { type: Number },
});

const PhyloPPISchema = new mongoose.Schema({
  Host_Protein: { type: String },
  Pathogen_Protein: { type: String },
  Score: { type: Number },
  Host_Pattern: { type: String },
  Pathogen_Pattern: { type: String },
  
});

const DomainSchema = new mongoose.Schema({
  Host_Protein: { type: String },
  Pathogen_Protein: { type: String },
  ProteinA: { type: String },
  ProteinB: { type: String },
  score: { type: Number },
  DomianA_name: { type: String },
  DomainA_desc: { type: String },
  DomianA_interpro: { type: String },
  DomianB_name: { type: String },
  DomainB_desc: { type: String },
  DomianB_interpro: { type: String },
  intdb: { type: String },
});

function splithost(string) {
  const cdsOrCdsRegex = /(cds|CDS)/i;
  const lastDotIndex = string.lastIndexOf('.');
  const secondLastDotIndex = string.lastIndexOf('.', lastDotIndex - 1);

  if (cdsOrCdsRegex.test(string)) {
    return string.slice(0, secondLastDotIndex);
  } else {
    return string.slice(0, lastDotIndex);
  }
}

router.route('/ppi').post(async (req, res) => {

  const body = JSON.parse(JSON.stringify(req.body));
  let isgenes;
  if (body.genes.length !==0 | body.keyword ){
     isgenes= "True"
  }
  else{
     isgenes = "False"
  }
  
  let genes;
  let species;

  if (body.searchType ==='keyword'){
    
    if (body.ids ==='host'){
      species = body.host.toLowerCase()
    }
    else{
      species = body.pathogen.toLowerCase()
    }
    console.log(species)
    if (body.anotType === 'go'){
      const query = {
        $or: [
          
          { "gene": { $regex: body.keyword} },
          { "term": { $regex: body.keyword} },
          { "description": { $regex: body.keyword} },
          { "definition": { $regex: body.keyword } },
          { "evidence": { $regex: body.keyword} },
          { "ontology": { $regex: body.keyword } },
          
        ],
        'species':species
      }

      keyword_data = await GO[body.ids].find(query)
      
      const geneArray = keyword_data.map(obj => obj.gene);
      console.log(geneArray.length)
      genes = geneArray.join(',');
      
    }
  }
  else{

    genes =body.genes
    
  }

  


  const filePath = path.join(__dirname,`../genes.txt`);

  
  fs.writeFile(filePath, genes, (err) => {
    if (err) {
      console.error('Error writing to the file:', err);
    } 
  });

  let results = await getPPI(body.category, body.hspecies, body.pspecies, body.hi, body.hc, body.he, body.pi, body.pc, body.pe, body.intdb, body.domdb, isgenes, species)
  
  res.json(results)

});

router.route('/goppi').post(async (req, res) => {

  const body = JSON.parse(JSON.stringify(req.body));

  let results = await getGOPPI(body.method, body.hspecies, body.pspecies, body.score, body.threshold, body.host_genes, body.pathogen_genes)
  
  res.json(results)
  
});

router.route('/phyloppi').post(async (req, res) => {
 
  const body = JSON.parse(JSON.stringify(req.body));
try{
    let results = await getphyloPPI(body.method, body.hspecies, body.pspecies, body.host_genes, body.pathogen_genes, body.hi, body.hc, body.he, body.pi, body.pc, body.pe, body.threshold)
    
    res.json(results)

    console.log("sent results")
}
catch (error) {
  console.error("Error:", error);
  res.status(500).json({ error: "An error occurred" });
}
 
});

router.route('/results/').get(async (req, res) => {
  try {
    const { results, category, page, size } = req.query;
    const pageInt = parseInt(page) || 1;
    const sizeInt = parseInt(size) || 1000;
    const skip = (pageInt - 1) * sizeInt;

    const resultsdb = mongoose.connection.useDb("hpinet_results");
    let ResultsModel;

    if (category === 'interolog') {
      ResultsModel = resultsdb.model(results, wheatSchema);
    } else if (category === 'gosim') {
      ResultsModel = resultsdb.model(results, GOPPISchema);
    } else if (category === 'phylo') {
      ResultsModel = resultsdb.model(results, PhyloPPISchema);
    } else {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const [final, counts, hostProtein, pathogenProtein] = await Promise.all([
      ResultsModel.find({}).limit(sizeInt).skip(skip).exec(),
      ResultsModel.countDocuments(),
      ResultsModel.distinct("Host_Protein"),
      ResultsModel.distinct("Pathogen_Protein"),
    ]);

    res.json({
      results: final,
      total: counts,
      hostcount: hostProtein.length,
      pathogencount: pathogenProtein.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.route('/annotation/').get(async(req,res) =>{

console.log(req.query)

let {host, pathogen, hid, pid} =req.query

const rhid = splithost(hid)


let hgo_results = await GO['host'].find({'species': host.toLowerCase() , 'gene':hid})
let pgo_results = await GO['pathogen'].find({'species': pathogen, 'gene':pid})
let hkegg_results = await KEGG['host'].find({'species': host, 'gene':rhid})
let pkegg_results = await KEGG['pathogen'].find({'species': pathogen , 'gene':pid})
let hlocal_results = await Local['host'].find({'species': host.toLowerCase() , 'gene':hid})
let plocal_results = await Local['pathogen'].find({'species': pathogen, 'gene':pid})
let hinterpro_results = await Interpro['host'].find({'species': host.toLowerCase() , 'gene':rhid})
let pinterpro_results = await Interpro['pathogen'].find({'species': pathogen , 'gene':pid})
let htf_results = await TF['host'].find({'species': host, 'gene':hid})
let effector_results = await Effector['pathogen'].find({'species': pathogen, 'gene': pid})

res.json({
'hgo': hgo_results, 
'pgo':pgo_results, 
'hkegg': hkegg_results, 
'pkegg':pkegg_results, 
'hlocal':hlocal_results, 
'plocal':plocal_results, 
'htf':htf_results,
'peff':effector_results, 
'hint':hinterpro_results, 
'pint':pinterpro_results})
})


router.route('/download/').get(async (req, res) => {
  let { results } = req.query

  const resultsdb = mongoose.connection.useDb("hpinet_results")
  const Results = resultsdb.model(results, wheatSchema)

  let final = await Results.find({})

  res.json({ 'results': final })

})

router.route('/domain_download/').post(async (req, res) => {
  try {
    const body = req.body;
    const table = body.species.toLowerCase() + '_domains';
    const resultsdb = mongoose.connection.useDb("hpinetdb");
    const Results = resultsdb.model(table, DomainSchema);
    
    const query = { intdb: { $in: body.intdb } };

    if (body.genes && body.genes.length > 0) {
      if (body.idt === 'host') {
        query.Host_Protein = { $in: body.genes };
      } else if (body.idt === 'pathogen') {
        query.Pathogen_Protein = { $in: body.genes};
      }
    }
   console.log(query)
    const [final] = await Promise.all([
      Results.find(query),
    ]);
    
    res.json({
      results: final,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }

})

router.route('/domain_results/').post(async (req, res) => {
  try {
    const body = req.body;
    const page = parseInt(body.page) || 1;
    const size = parseInt(body.size) || 10;
    const table = body.species.toLowerCase() + '_domains';
    const limit = size;
    const skip = (page - 1) * size;
    const resultsdb = mongoose.connection.useDb("hpinetdb");
    const Results = resultsdb.model(table, DomainSchema);
    
    const query = { intdb: { $in: body.intdb } };

    if (body.genes &&  body.genes.length > 0) {
      if (body.idt === 'host') {
        query.Host_Protein = { $in: body.genes };
      } else if (body.idt === 'pathogen') {
        query.Pathogen_Protein = { $in: body.genes};
      }
    }
   console.log(query)
    const [final, counts, hostProtein, pathogenProtein] = await Promise.all([
      Results.find(query).limit(limit).skip(skip).lean().exec(),
      Results.count(query),
      Results.distinct("Host_Protein", query),
      Results.distinct("Pathogen_Protein", query),
    ]);
    

    res.json({
      results: final,
      total: counts,
      hostcount: hostProtein.length,
      pathogencount: pathogenProtein.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});




router.route('/network/').get(async (req, res) => {
  let { results } = req.query

  const resultsdb = mongoose.connection.useDb("hpinet_results")
  const Results = resultsdb.model(results, wheatSchema)

  let final = await Results.find().exec()
  let counts = await Results.count()
  let host_protein = await Results.distinct("Host_Protein")
  let pathogen_protein = await Results.distinct('Pathogen_Protein')
  res.json({ 'results': final, 'total': counts, 'hostcount': host_protein.length, 'pathogencount': pathogen_protein.length })

})

router.route('/go/').get(async (req, res) => {

  let { species, sptype, page, size } = req.query
  if (!page) {
    page = 1
  }
  if (page) {
    page = parseInt(page) + 1
  }
  if (!size) {
    size = 10
  }

  const limit = parseInt(size)

  const skip = (page - 1) * size;

  let go_results = await GO[sptype].find({ 'species': { '$in': species.toLowerCase() } }).limit(limit).skip(skip).exec()
  let total = await GO[sptype].find({ 'species': { '$in': species.toLowerCase() } }).count()
  let knum = await GO[sptype].distinct('term')
  console.log(knum.length)
  res.json({ 'data': go_results, 'total': total })

})


router.route('/kegg/').get(async (req, res) => {

  let { species, sptype, page, size } = req.query
  if (!page) {
    page = 1
  }
  if (page) {
    page = parseInt(page) + 1
  }
  if (!size) {
    size = 10
  }

  const limit = parseInt(size)

  const skip = (page - 1) * size;

  let kegg_results = await KEGG[sptype].find({ 'species': { '$in': species } }).limit(limit).skip(skip).exec()
  let total = await KEGG[sptype].find({ 'species': { '$in': species } }).count()

  res.json({ 'data': kegg_results, 'total': total })

})

router.route('/interpro/').get(async (req, res) => {

  let { species, sptype, page, size } = req.query
  if (!page) {
    page = 1
  }
  if (page) {
    page = parseInt(page) + 1
  }
  if (!size) {
    size = 10
  }

  const limit = parseInt(size)

  const skip = (page - 1) * size;

  let interpro_results = await Interpro[sptype].find({ 'species': { '$in': species } }).limit(limit).skip(skip).exec()
  let total = await Interpro[sptype].find({ 'species': { '$in': species } }).count()

  res.json({ 'data': interpro_results, 'total': total })

})

router.route('/local/').get(async (req, res) => {

  let { species, sptype, page, size } = req.query
  if (!page) {
    page = 1
  }
  if (page) {
    page = parseInt(page) + 1
  }
  if (!size) {
    size = 10
  }

  const limit = parseInt(size)

  const skip = (page - 1) * size;

  let local_results = await Local[sptype].find({ 'species': { '$in': species } }).limit(limit).skip(skip).exec()
  let total = await Local[sptype].find({ 'species': { '$in': species } }).count()

  res.json({ 'data': local_results, 'total': total })

})

router.route('/tf/').get(async (req, res) => {

  let { species, sptype, page, size } = req.query
  if (!page) {
    page = 1
  }
  if (page) {
    page = parseInt(page) + 1
  }
  if (!size) {
    size = 10
  }


  const limit = parseInt(size)

  const skip = (page - 1) * size;

  let transcription_results = await TF[sptype].find({ 'species': { '$in': species } }).limit(limit).skip(skip).exec()
  let total = await TF[sptype].find({ 'species': { '$in': species } }).count()

  res.json({ 'data': transcription_results, 'total': total })

})

router.route('/effector/').get(async (req, res) => {

  let { species, page, size } = req.query
  if (!page) {
    page = 1
  }
  if (page) {
    page = parseInt(page) + 1
  }
  if (!size) {
    size = 10
  }

  let query = {
    'species': species
  }
  console.log(species)
  const limit = parseInt(size)

  const skip = (page - 1) * size;

  let effector_results = await Effector['pathogen'].find({ 'species': { '$in': species } }).limit(limit).skip(skip).exec()
  let total = await Effector['pathogen'].count(query)
  console.log(effector_results)
  res.json({ 'data': effector_results, 'total': total })

})

module.exports = router;