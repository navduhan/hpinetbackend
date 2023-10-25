const { execSync } = require('child_process');
const path = require('path');

// Define a function to run the Python script
const getGOPPI = (method, hspecies, pspecies, score, threshold, host_genes, pathogen_genes) => {
  // Remove any spaces from host_genes
  const host_genes2 = host_genes.replace(" ", '');
  console.log(host_genes2);

  // Initialize variables
  let output = '';
  const command = `"/opt/miniconda3/envs/ml-gpu/bin/python3" ` +
    `"/home/dock_user/web/hpinetdb/hpinetbackend/src/gosemsim/goSemSim.py" ` +
    `--hgenes ${host_genes2} ` +
    `--pgenes ${pathogen_genes} ` +
    `--host ${hspecies} ` +
    `--pathogen ${pspecies} ` +
    `--method ${method} ` +
    `--score ${score} ` +
    `--t ${threshold}`;

  try {
    output = execSync(command).toString();
    console.log('output was generated: ' + output);
  } catch (error) {
    console.error('Error: ' + error);
  }

  return output;
};

module.exports = getGOPPI;
