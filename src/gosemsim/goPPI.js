const { spawn } = require('child_process');
const path = require('path');

// Define a function to run the Python script
const getGOPPI = (method, hspecies, pspecies, score, threshold, host_genes, pathogen_genes) => {
  // Remove any spaces from host_genes
  const host_genes2 = host_genes.replace(" ", '');
  console.log(host_genes2);

  // Initialize variables
  let output = '';
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

  // Spawn a Python process to run the script
  const getS = spawn(commandArgs[0], commandArgs.slice(1));

  // Handle stdout data
  const stdoutPromise = new Promise((resolve) => {
    getS.stdout.on('data', (data) => {
      output += data.toString();
      console.log('output was generated: ' + data.toString());
    });
    getS.stdout.on('end', () => {
      resolve();
    });
  });

  // Handle stderr data
  const stderrPromise = new Promise((resolve) => {
    getS.stderr.on('data', (data) => {
      console.log('error: ' + data);
    });
    getS.stderr.on('end', () => {
      resolve();
    });
  });

  return Promise.all([stdoutPromise, stderrPromise]).then(() => {
    return output;
  });
};

module.exports = getGOPPI;
