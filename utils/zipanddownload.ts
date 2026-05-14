import path from "path";
import fs from "fs-extra";
import archiver from "archiver";
import AdmZip from "adm-zip";

export const createAndDownloadZip = (
  projectDir: any,
  projectId: any,
  res: any,
  filesToAdd: { source: string; dest: string }[] = [],
  backendZipBuffer: Buffer | null = null // New parameter
) => {
  const zipPath = path.join(__dirname, `${projectId}.zip`);
  const output = fs.createWriteStream(zipPath);
  const archive = archiver("zip", { zlib: { level: 9 } });
  const backendTempDir = path.join(__dirname, `backend_temp_${projectId}`);
  console.log("zipPath", projectDir);

  output.on("close", () => {
    //console.log(`Zip file ${zipPath} has been created. `);
    res.download(zipPath, `${projectId}.zip`, (err: any) => {
      if (err) {
        console.error("Download error:", err);
      }
      fs.unlinkSync(zipPath);
      if (fs.existsSync(backendTempDir)) {
        fs.removeSync(backendTempDir);
      }
    });
  });

  archive.on("error", (err) => {
    console.error("Archiving error:", err);
    if (!res.headersSent) {
      res.status(500).send("Error creating zip file.");
    }
  });

  archive.pipe(output);
  archive.directory(projectDir, "frontend");
  for (const file of filesToAdd) {
    // console.log("Adding file to zip:", file.source, "as", file.dest);
    archive.file(file.source, { name: file.dest });
  }

  // Add backend zip buffer if provided
  if (backendZipBuffer) {
    fs.ensureDirSync(backendTempDir);
    try {
      const zip = new AdmZip(backendZipBuffer);
      zip.extractAllTo(backendTempDir, /*overwrite*/ true);
      
      const possibleBackendPath = path.join(backendTempDir, "backend");
      if (fs.existsSync(possibleBackendPath) && fs.lstatSync(possibleBackendPath).isDirectory()) {
        archive.directory(possibleBackendPath, "backend");
      } else {
        archive.directory(backendTempDir, "backend");
      }
    } catch (e) {
      console.error("Error unzipping backend buffer:", e);
      if (fs.existsSync(backendTempDir)) {
        fs.removeSync(backendTempDir);
      }
      archive.abort();
      if (!res.headersSent) {
        res.status(500).send("Error processing backend data.");
      }
      return;
    }
  }
  archive.finalize();
};
