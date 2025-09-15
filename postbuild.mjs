// postbuild.mjs
import fs from 'fs-extra';
import path from 'path';

// Path to your template files
const sourceDir = path.join(process.cwd(), 'starters');

// Destination path within the compiled Vercel output for the API route
// This matches the compiled output for `/api/template/[id]`
const destDir = path.join(
  process.cwd(),
  '.vercel/output/functions/api/template/[id].func/starters'
);

console.log(`Starting postbuild script...`);
console.log(`Source directory: ${sourceDir}`);
console.log(`Destination directory: ${destDir}`);

// Ensure the destination function directory exists before copying
if (fs.existsSync(path.dirname(destDir))) {
  console.log('Destination function directory exists. Copying files...');
  fs.copySync(sourceDir, destDir, {
    overwrite: true,
    errorOnExist: false,
    recursive: true,
  });
  console.log('Successfully copied template files to serverless function.');
} else {
  console.log(
    'Warning: Destination function directory not found. Skipping copy.'
  );
  console.log('This might be okay if the route was not built (e.g., during local dev).');
}

console.log('Postbuild script finished.');