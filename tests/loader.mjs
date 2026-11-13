import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'next/headers') {
    return nextResolve('next/headers.js', context);
  }

  // Handle @/ alias
  if (specifier.startsWith('@/')) {
    let sub = specifier.slice(2);
    const basePath = path.resolve(process.cwd(), 'src', sub);
    let target = basePath;

    if (!path.extname(sub)) {
      if (fs.existsSync(basePath + '.js')) {
        target = basePath + '.js';
      } else if (fs.existsSync(basePath + '.jsx')) {
        target = basePath + '.jsx';
      } else if (fs.existsSync(path.join(basePath, 'index.js'))) {
        target = path.join(basePath, 'index.js');
      } else {
        target = basePath + '.js';
      }
    }
    return nextResolve(pathToFileURL(target).href, context);
  }

  // Handle relative imports without file extension
  if ((specifier.startsWith('./') || specifier.startsWith('../')) && context.parentURL) {
    try {
      const parentFilePath = fileURLToPath(context.parentURL);
      const parentDir = path.dirname(parentFilePath);
      const targetPath = path.resolve(parentDir, specifier);

      if (!path.extname(specifier)) {
        if (fs.existsSync(targetPath + '.js')) {
          return nextResolve(pathToFileURL(targetPath + '.js').href, context);
        } else if (fs.existsSync(targetPath + '.jsx')) {
          return nextResolve(pathToFileURL(targetPath + '.jsx').href, context);
        } else if (fs.existsSync(path.join(targetPath, 'index.js'))) {
          return nextResolve(pathToFileURL(path.join(targetPath, 'index.js')).href, context);
        }
      }
    } catch {
      // fallback to default
    }
  }

  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.includes('/src/')) {
    return nextLoad(url, { ...context, format: 'module' });
  }
  return nextLoad(url, context);
}
