import * as esbuild from "esbuild"
import fs from "fs"
import archiver from "archiver"

const repo_packages = [
  "splunkProcessor"
]

for (const repo_package of repo_packages) {
  await esbuild.build({
    entryPoints: [`packages/${repo_package}/src/${repo_package}.js`],
    bundle: true,
    sourcemap: true,
    platform: "node",
    target: [
      "es2020"
    ],
    outfile: `dist/${repo_package}/app.js`,
  })

  const output = fs.createWriteStream(`dist/${repo_package}.zip`)
  const archive = archiver("zip", { zlib: { level: 9 } })

  output.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
  });

  output.on('end', function () {
    console.log('Data has been drained');
  });

  archive.on('warning', function (err) {
    if (err.code === 'ENOENT') {
    } else {
      throw err;
    }
  });

  archive.on('error', function (err) {
    throw err;
  });

  archive.pipe(output)
  archive.directory(`dist/${repo_package}/`, false)
  archive.finalize()
}
