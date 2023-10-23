const { spawn } = require('child_process');

const path = require('path');
const getGOPPI = (method, hspecies, pspecies, score, threshold, host_genes, pathogen_genes)=>{

const host_genes2 = host_genes.replace(" ",'')
console.log(host_genes2)
let output;
let getS;
console.log("/home_dock_user/src/gosemsim/goSemSim.py", "--hgenes", host_genes2, "--pgenes", pathogen_genes, "--host", hspecies, "--pathogen", pspecies, "--method", method, "--score", score, "--t", threshold )

    getS = spawn('/opt/miniconda3/envs/ml-gpu/bin/python3', ["/home/dock_user/src/gosemsim/goSemSim.py", "--hgenes", host_genes2, "--pgenes", pathogen_genes, "--host", hspecies, "--pathogen", pspecies, "--method", method, "--score", score, "--t", threshold]);

getS.stdout.on('data', (data) => {

    output = data.toString();

    console.log('output was generated: ' + output);
});

getS.stdin.setEncoding = 'utf-8';

getS.stderr.on('data', (data) => {
    
    console.log('error:' + data);
});
return new Promise((res, rej) => {

    getS.stdout.on('end', async function (code) {

    const rid = output.split('\n')
    console.log(rid[0])
    res(rid[0])
    })
 });

}

module.exports = getGOPPI
