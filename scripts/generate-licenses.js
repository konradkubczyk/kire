const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

try {
  console.log("Gathering production dependencies...");
  const npmListOutput = execSync("npm list --all --json --omit=dev").toString();
  const npmList = JSON.parse(npmListOutput);

  const allDeps = new Map();

  function collectDeps(deps) {
    if (!deps) return;
    for (const [name, info] of Object.entries(deps)) {
      allDeps.set(name, info.version);
      if (info.dependencies) {
        collectDeps(info.dependencies);
      }
    }
  }

  collectDeps(npmList.dependencies);

  console.log(
    `Found ${allDeps.size} production dependencies. Gathering licenses...`,
  );

  const results = [];
  const nodeModulesPath = path.join(process.cwd(), "node_modules");

  for (const [name, version] of allDeps) {
    const depPath = path.join(nodeModulesPath, name);
    const pkgPath = path.join(depPath, "package.json");

    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      let license = pkg.license;
      if (typeof license === "object") license = license.type;

      let licenseText = "";
      const licenseFiles = [
        "LICENSE",
        "LICENSE.md",
        "LICENSE.txt",
        "license",
        "license.md",
        "license.txt",
        "COPYING",
        "LICENSE.MIT",
        "LICENSE.BSD",
      ];
      for (const lFile of licenseFiles) {
        const lPath = path.join(depPath, lFile);
        if (fs.existsSync(lPath)) {
          licenseText = fs.readFileSync(lPath, "utf8");
          break;
        }
      }

      results.push({
        name,
        version,
        license: license || "Unknown",
        licenseText: licenseText || "No license text found.",
      });
    } else {
      results.push({
        name,
        version,
        license: "Unknown",
        licenseText: "Package directory not found in node_modules.",
      });
    }
  }

  // Sort by name
  results.sort((a, b) => a.name.localeCompare(b.name));

  const outputPath = path.join(process.cwd(), "assets", "licenses.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`Successfully generated ${outputPath}`);
} catch (error) {
  console.error("Error generating licenses:", error);
  process.exit(1);
}
