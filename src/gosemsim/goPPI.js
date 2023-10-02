const { spawn } = require('child_process');

const path = require('path');
const getGOPPI = (method, hspecies, pspecies, score, threshold, host_genes, pathogen_genes)=>{

let host_genes2 = host_genes.replace(" ",'')
let output;
let getS;
console.log("/opt/web/hpinetdb/hpinetbackend/src/gosemsim/goSemSim.py", "--hgenes", host_genes2, "--pgenes", pathogen_genes, "--host", hspecies, "--pathogen", pspecies, "--method", method, "--score", score, "--t", threshold )

    getS = spawn('/opt/miniconda3/envs/mlgpu/bin/python3', ["/opt/web/hpinetdb/hpinetbackend/src/gosemsim/goSemSim.py", "--hgenes", host_genes2, "--pgenes", pathogen_genes, "--host", hspecies, "--pathogen", pspecies, "--method", method, "--score", score, "--t", threshold]);

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
