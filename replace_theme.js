const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const globalStylesPath = path.join(__dirname, 'src', 'styles', 'globalStyles.js');

const colorMap = {
  '#2baab1': 'theme.primary',
  '#ff7a00': 'theme.accent',
  '#ef4444': 'theme.danger',
  '#f59e0b': 'theme.warning',
  '#1bb21b': 'theme.success',
  '#f9f9f9': 'theme.surface',
  '#ffffff': 'theme.background',
  '#333333': 'theme.textPrimary',
  '#777777': 'theme.textSecondary',
  '#e0e0e0': 'theme.border',
};

// Two regexes:
// 1. Matches JSX props like: color="#ff7a00" -> color={theme.accent}
// 2. Matches regular strings like: "#ff7a00" -> theme.accent
const jsxPropRegex = /=(\s*)(['"])(#[0-9a-fA-F]{6})\2/gi;
const stringRegex = /(['"])(#[0-9a-fA-F]{6})\1/gi;

function processFile(filePath) {
  const isGlobalStyles = filePath === globalStylesPath;
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;
  let modified = false;

  // First replace JSX props
  content = content.replace(jsxPropRegex, (match, space, quote, hex) => {
    const lowerHex = hex.toLowerCase();
    if (colorMap[lowerHex]) {
      modified = true;
      return `=${space}{${colorMap[lowerHex]}}`;
    }
    return match;
  });

  // Then replace the remaining strings
  content = content.replace(stringRegex, (match, quote, hex) => {
    const lowerHex = hex.toLowerCase();
    if (colorMap[lowerHex]) {
      modified = true;
      return colorMap[lowerHex];
    }
    return match;
  });

  if (modified) {
    if (!isGlobalStyles) {
      let relativePath = path.relative(path.dirname(filePath), globalStylesPath);
      relativePath = relativePath.replace(/\\/g, '/').replace(/\.js$/, '');
      if (!relativePath.startsWith('.')) {
        relativePath = './' + relativePath;
      }

      if (!content.includes('import { theme }') && !content.includes('import {theme}')) {
        const importRegex = /^import\s+.*?;?\s*$/gm;
        let lastMatch = null;
        let match;
        while ((match = importRegex.exec(content)) !== null) {
          lastMatch = match;
        }

        const importStatement = `\nimport { theme } from '${relativePath}';`;
        if (lastMatch) {
          content = content.slice(0, lastMatch.index + lastMatch[0].length) +
                    importStatement +
                    content.slice(lastMatch.index + lastMatch[0].length);
        } else {
          content = importStatement + '\n' + content;
        }
      }
    }
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${filePath}`);
  }
}

function traverseDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDir(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

traverseDir(srcDir);
console.log('Theme replacement complete.');
