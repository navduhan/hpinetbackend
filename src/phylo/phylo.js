const { spawn } = require('child_process');

const path = require('path');

const buildCmd = (phyloConfig) => {
  const genomePool = phyloConfig['genomePool'];
  const hspecies = phyloConfig['hspecies'];
  const pspecies = phyloConfig['pspecies'];
  const host_genes = phyloConfig['host_genes'].replace(' ', '');
  const pathogen_genes = phyloConfig['pathogen_genes'].replace(' ', '');
  const hi = phyloConfig['hi'];
  const hc = phyloConfig['hc'];
  const he = phyloConfig['he'];
  const pi = phyloConfig['pi'];
  const pc = phyloConfig['pc'];
  const pe = phyloConfig['pe'];
  const threshold = phyloConfig['threshold'];

  console.log(`python3 / home / dock_user / web / hpinetdb / hpinetbackend / src / phylo / phylopred.py--gp ${genomePool} --h ${hspecies} --p ${pspecies} --hg ${host_genes} --pg ${pathogen_genes} --hi ${hi} --hc ${hc} --he ${he} --pi ${pi} --pc ${pc} --pe ${pe} --t ${threshold}`)
  const cmdMap = {
    'gp': genomePool,
    'h': hspecies,
    'p': pspecies,
    'hg': host_genes,
    'pg': pathogen_genes,
    'hi': hi,
    'hc': hc,
    'he': he,
    'pi': pi,
    'pc': pc,
    'pe': pe,
    't': threshold,
  }

  let cmd = ['/home/dock_user/web/hpinetdb/hpinetbackend/src/phylo/phylopred.py']
  for (let [key, val] in cmdMap.entries()) {
    cmd.push(`--${key}`);
    cmd.push(val);
  }

  return cmd;
}

// genomePool, hspecies, pspecies, host_genes, pathogen_genes, hi, hc, he, pi, pc, pe, threshold
const getphyloPPI = async (phyloConfig) => {
  const getS = spawn('/opt/miniconda3/envs/ml-gpu/bin/python3', buildCmd(phyloConfig), { shell: true });

  console.log("executed script");

  // Use a promise to handle the output of the spawned process
  const outputPromise = new Promise((resolve, reject) => {
    getS.stdout.on('data', (data) => {
      resolve(data.toString());
    });

    getS.stderr.on('data', (data) => {
      reject(new Error(data));
    });

    getS.on('close', (code) => {
      if (code !== 0) {
        reject(new Error('phylopred.py exited with code ' + code));
      }
    });
  });

  // Wait for the output of the spawned process and return it
  const output = await outputPromise;
  console.log(output)
  // Return the output rid
  return output;
};

module.exports = getphyloPPI;