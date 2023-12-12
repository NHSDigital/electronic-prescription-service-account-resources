import * as esbuild from "esbuild"

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
}
