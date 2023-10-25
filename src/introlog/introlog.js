const { spawn } = require('child_process');

// Function to run the hpinterolog.py script
const getPPI = async (method, hspecies, pspecies, identity, coverage, evalue, pi, pc, pe, intdb, domdb, genes, idt) => {
  let output;

  // Define the working directory
  const cwd = '/opt/web/hpinetdb/hpinetbackend/src/introlog';

  // Build the command arguments for the script
  const commandArgs = [
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

  const getS = spawn('/opt/miniconda3/envs/ml-gpu/bin/python3', ['hpinterolog.py', ...commandArgs], { cwd });

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
      const resultData = output.split('\n');
      console.log(resultData[0]);
      resolve(resultData[0]);
    });
  });
};

module.exports = getPPI;
