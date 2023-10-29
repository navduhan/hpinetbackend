const { spawn } = require('child_process');

const path = require('path');
const getphyloPPI = (genomePool, hspecies, pspecies, host_genes, pathogen_genes, hi, hc, he, pi,pc,pe, threshold)=>{

const host_genes2 = host_genes.replace(" ",'')
const pathogen_genes2 = pathogen_genes.replace(" ","")
console.log(host_genes2)
let output;
let getS;
console.log("/home/dock_user/web/hpinetdb/hpinetbackend/src/phylo/phylopred.py","--gp", genomePool,"--h", hspecies, "--p", pspecies, "--hg", host_genes2, "--pg", pathogen_genes2, "--hi", hi, "--hc", hc, "--he", he, "--pi", pi, "--pc", pc, "--pe", pe )

    getS = spawn('/opt/miniconda3/envs/ml-gpu/bin/python3', ["/home/dock_user/web/hpinetdb/hpinetbackend/src/phylo/phylopred.py","--gp", genomePool,"--h", hspecies, "--p", pspecies, "--hg", host_genes2, "--pg", pathogen_genes2, "--hi", hi, "--hc", hc, "--he", he, "--pi", pi, "--pc", pc, "--pe", pe, "--t", threshold]);

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

    const rid = output
    console.log(rid)
    res(rid)
    })
 });

}

module.exports = getphyloPPI