import { pathToFileURL } from 'node:url';
import path from 'node:path';

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    let sub = specifier.slice(2);
    if (!path.extname(sub)) {
      sub += '.js';
    }
    const resolvedPath = path.resolve(process.cwd(), 'src', sub);
    return nextResolve(pathToFileURL(resolvedPath).href, context);
  }
  return nextResolve(specifier, context);
}

