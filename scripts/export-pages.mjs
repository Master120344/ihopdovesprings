import { readdir, readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'dist');
const basePath = (process.env.PAGES_BASE_PATH ?? '/ihopdovesprings').replace(/\/$/, '');
const pagesOrigin = (process.env.PAGES_ORIGIN ?? 'https://master120344.github.io/ihopdovesprings').replace(/\/$/, '');
const sitesOrigin = 'https://ihop-dove-springs.martystowing739.chatgpt.site';

if (basePath && (!basePath.startsWith('/') || basePath.startsWith('//') || /[\s"'<>?#]/.test(basePath))) {
  throw new Error('PAGES_BASE_PATH must be a URL path such as /ihopdovesprings, or empty for a custom domain.');
}
const parsedOrigin = new URL(pagesOrigin);
if (!['https:', 'http:'].includes(parsedOrigin.protocol) || parsedOrigin.search || parsedOrigin.hash) {
  throw new Error('PAGES_ORIGIN must be an HTTP or HTTPS site URL without a query or fragment.');
}

async function exportDirectory(directory, relative = '') {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const name = path.join(relative, entry.name);
    const input = path.join(source, name);
    const output = path.join(root, name);
    if (entry.isDirectory()) {
      await mkdir(output, { recursive: true });
      await exportDirectory(input, name);
      continue;
    }
    if (!entry.isFile()) throw new Error(`Unsupported build entry: ${name}`);
    await mkdir(path.dirname(output), { recursive: true });
    if (/\.(html|css|xml|txt)$/.test(name)) {
      let content = (await readFile(input, 'utf8')).replaceAll(sitesOrigin, pagesOrigin);
      if (name.endsWith('.html')) {
        content = content
          .replace(/\b(href|src|poster|action)=(['"])\/(?!\/)/g, (_, attribute, quote) => `${attribute}=${quote}${basePath}/`)
          .replace(/("src"\s*:\s*")\/(?!\/)/g, `$1${basePath}/`)
          .replace(/(\burl=)\/(?!\/)/gi, `$1${basePath}/`);
      }
      if (name.endsWith('.css')) {
        content = content.replace(/url\((['"]?)\/(?!\/)/g, (_, quote) => `url(${quote}${basePath}/`);
      }
      await writeFile(output, content);
    } else {
      await copyFile(input, output);
    }
  }
}

await exportDirectory(source);
await writeFile(path.join(root, '.nojekyll'), '');
console.log(`Exported the Sites design for GitHub Pages at ${pagesOrigin}/`);
