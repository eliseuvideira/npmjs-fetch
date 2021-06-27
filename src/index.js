#!/usr/bin/env node

const { program } = require("commander");
const fetch = require("node-fetch");

const { version } = require("../package.json");

const fetchDownloads = async (pkg) => {
  const response = await fetch(
    `https://api.npmjs.org/downloads/point/last-week/${pkg}`
  );
  if (response.status !== 200) {
    return 0;
  }
  const data = await response.json();
  return data.downloads || 0;
};

const fetchPackage = async (pkg) => {
  const response = await fetch(`https://registry.npmjs.org/${pkg}/latest`);
  if (response.status !== 200) {
    return null;
  }
  const data = await response.json();
  const downloads = await fetchDownloads(pkg);

  return {
    name: data.name,
    version: data.version,
    description: data.description,
    license: data.license,
    repository: data.repository.git,
    homepage: data.homepage,
    node_version: data.engines.node,
    downloads,
  };
};

program
  .argument("<packages...>")
  .action(async (packages) => {
    const list = [];
    for (const pkg of packages) {
      const data = await fetchPackage(pkg);
      if (pkg) {
        list.push(data);
      }
    }
    console.log(JSON.stringify(list, null, 2));
  })
  .version(version, "-v, --version");

program.parse();
