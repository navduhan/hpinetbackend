const { spawn } = require('child_process');
const path = require('path');

// Define a function to run the Python script
const getGOPPI = (method, hspecies, pspecies, score, threshold, host_genes, pathogen_genes) => {
  // Remove any spaces from host_genes
  const host_genes2 = host_genes.replace(" ", '');
  console.log(host_genes2);

  // Initialize variables
  let output;


  // Log the command that will be executed
  console.log(
    "/opt/miniconda3/envs/ml-gpu/bin/python3",
    [
      "/home/dock_user/web/hpinetdb/hpinetbackend/src/gosemsim/goSemSim.py",
      "--hgenes",
      host_genes2,
      "--pgenes",
      pathogen_genes,
      "--host",
      hspecies,
      "--pathogen",
      pspecies,
      "--method",
      method,
      "--score",
      score,
      "--t",
      threshold
    ].join(" ") // Combine command arguments into a string
  );

  // Spawn a Python process to run the script
  const getS = spawn('/opt/miniconda3/envs/ml-gpu/bin/python3', [
    "/home/dock_user/web/hpinetdb/hpinetbackend/src/gosemsim/goSemSim.py",
    "--hgenes",
    host_genes2,
    "--pgenes",
    pathogen_genes,
    "--host",
    hspecies,
    "--pathogen",
    pspecies,
    "--method",
    method,
    "--score",
    score,
    "--t",
    threshold
  ]);

  // Handle standard output from the Python process
  getS.stdout.on('data', (data) => {
    output = data.toString();
    console.log('output was generated: ' + output);
  });

  // Handle standard error from the Python process
  getS.stderr.on('data', (data) => {
    console.log('error: ' + data);
  });

  // Return a Promise to resolve when the process ends
  return new Promise((res, rej) => {
    getS.stdout.on('end', async function (code) {
      const rid = output;
      console.log(rid);
      res(rid); // Assuming you want to resolve the first character of the output
    });
  });
};

module.exports = getGOPPI;
