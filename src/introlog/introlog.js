const { spawn } = require('child_process');
const path = require('path');

// Function to run the hpinterolog.py script
const getPPI = async (method, hspecies, pspecies, identity, coverage, evalue, pi, pc, pe, intdb, domdb, genes, idt) => {
  let output;

  // Build the command arguments for the script
  const commandArgs = [
    "/opt/miniconda3/envs/ml-gpu/bin/python3",
    "/home/dock_user/web/hpinetdb/hpinetbackend/src/introlog/hpinterolog.py",
    "--method", method,
    "--blastdb", "/home/dock_user/hpinetblast.db",
    "--ppidb", "ppidb",
    "--host_table", hspecies.toLowerCase(),
    "--pathogen_table", pspecies,
    "--host_identity", parseInt(identity),
    "--host_coverage", parseInt(coverage),
    "--host_evalue", parseFloat(evalue),
    "--pathogen_identity", parseInt(pi),
    "--pathogen_coverage", parseInt(pc),
    "--pathogen_evalue", parseFloat(pe),
    "--ppitables", intdb,
    '--domdb', domdb,
    '--id', idt
  ];

  if (genes.length > 0) {
    commandArgs.push('--genes', genes);
  }

  const getS = spawn(commandArgs[0], commandArgs.slice(1));

  // Handle stdout data
  getS.stdout.on('data', (data) => {
    output = data.toString();
    console.log('output was generated: ' + output);
  });

  getS.stdin.setEncoding = 'utf-8';

  // Handle stderr data
  getS.stderr.on('data', (data) => {
    console.log('error: ' + data);
  });

  return new Promise((resolve, reject) => {
    getS.stdout.on('end', async function (code) {
        if (typeof output === 'string') {
            
            const resultData = output.split('\n');
            
            resolve(resultData[0]);
            // Now you can use the resultData array
          } else {
            console.error("Output is not a valid string.");
          }
         
   
    });
  });
};

module.exports = getPPI;
