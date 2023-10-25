const { spawn } = require('child_process');
const path = require('path');

// Define a function to run the Python script
const getGOPPI = (method, hspecies, pspecies, score, threshold, host_genes, pathogen_genes) => {
  // Remove any spaces from host_genes
  const host_genes2 = host_genes.replace(" ", '');
  console.log(host_genes2);

  // Initialize variables
  let output ='';


  // Log the command that will be executed
//   console.log(
//     "/opt/miniconda3/envs/ml-gpu/bin/python3",
//     [
//       "/home/dock_user/web/hpinetdb/hpinetbackend/src/gosemsim/goSemSim.py",
//       "--hgenes",
//       host_genes2,
//       "--pgenes",
//       pathogen_genes,
//       "--host",
//       hspecies,
//       "--pathogen",
//       pspecies,
//       "--method",
//       method,
//       "--score",
//       score,
//       "--t",
//       threshold
//     ].join(" ") // Combine command arguments into a string
//   );

  const commandArgs = [
    "/opt/miniconda3/envs/ml-gpu/bin/python3",
    "/home/dock_user/web/hpinetdb/hpinetbackend/src/gosemsim/goSemSim.py",
    "--hgenes", host_genes2,
    "--pgenes", pathogen_genes,
    "--host", hspecies,
    "--pathogen", pspecies,
    "--method", method,
    "--score", score,
    "--t", threshold
  ];

//   console.log(commandArgs.slice[1])
  // Spawn a Python process to run the script
  const getS = spawn(commandArgs[0], commandArgs.slice(1), {shell: true, stdio: 'inherit'});
  
  // Handle stdout data
  getS.stdout.on('data', (data) => {
    output += data.toString();
    console.log('output was generated: ' + output);
  });

  getS.stdin.setEncoding = 'utf-8';

  // Handle stderr data
  getS.stderr.on('data', (data) => {
    console.log('error: ' + data);
  });

  return new Promise((resolve, reject) => {
    getS.stdout.on('end', async function (code) {

        const resultData = output;
            
            resolve(resultData);
    });
  });
};

module.exports = getGOPPI;
