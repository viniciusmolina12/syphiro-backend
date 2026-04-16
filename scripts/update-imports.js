const fs = require('fs');
const path = require('path');

function walk(dir) {
    return fs.readdirSync(dir).flatMap(f => {
        const full = path.join(dir, f);
        return fs.statSync(full).isDirectory() ? walk(full) : [full];
    }).filter(f => f.endsWith('.ts'));
}

const srcDir = path.resolve('src');

const modules = [
    { folder: '@shared', alias: '@shared' },
    { folder: 'character', alias: '@character' },
    { folder: 'class', alias: '@class' },
    { folder: 'combat', alias: '@combat' },
    { folder: 'enemy', alias: '@enemy' },
    { folder: 'instance', alias: '@instance' },
    { folder: 'player', alias: '@player' },
    { folder: 'profession', alias: '@profession' },
    { folder: 'skill', alias: '@skill' },
];

// Build a map from absolute src subfolder path -> alias
const moduleMap = modules.map(({ folder, alias }) => ({
    absPath: path.join(srcDir, folder),
    alias,
}));

function resolveImportToAlias(fileAbsPath, importPath) {
    // Only handle relative imports
    if (!importPath.startsWith('./') && !importPath.startsWith('../')) return null;

    const fileDir = path.dirname(fileAbsPath);
    const resolved = path.resolve(fileDir, importPath);

    for (const { absPath, alias } of moduleMap) {
        if (resolved.startsWith(absPath + path.sep) || resolved === absPath) {
            const rel = resolved.slice(absPath.length + 1).replace(/\\/g, '/');
            return `${alias}/${rel}`;
        }
    }
    return null;
}

const files = walk('src');
let totalChanged = 0;

files.forEach(file => {
    const fileAbs = path.resolve(file);
    let content = fs.readFileSync(file, 'utf8');

    // Match: from './...' or from '../...' (single or double quotes)
    const updated = content.replace(
        /(from\s+['"])(\.\.?\/[^'"]+)(['"])/g,
        (match, open, importPath, close) => {
            const aliased = resolveImportToAlias(fileAbs, importPath);
            if (aliased) return `${open}${aliased}${close}`;
            return match;
        }
    );

    if (updated !== content) {
        fs.writeFileSync(file, updated);
        totalChanged++;
        console.log('updated:', file);
    }
});

console.log('\nTotal files changed:', totalChanged);
