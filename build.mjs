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

  const output = fs.createWriteStream(`${repo_package}.zip`)
  const zip = archiver("zip", { zlib: { level: 9 } })

  output.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
  });

  zip.pipe(output)
  zip.directory(`dist/${repo_package}/`, false)
  zip.finalize()
}
