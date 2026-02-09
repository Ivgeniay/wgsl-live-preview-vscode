const fs = require('fs');
const path = require('path');

const EXCLUDE_EXTENSIONS = ['.ts', '.js', '.map'];

function copyRecursive(srcDir, destDir, relativePath = '') {
    const currentSrc = path.join(srcDir, relativePath);
    const currentDest = path.join(destDir, relativePath);

    if (!fs.existsSync(currentSrc)) {
        return;
    }

    const stats = fs.statSync(currentSrc);

    if (stats.isDirectory()) {
        if (!fs.existsSync(currentDest)) {
            fs.mkdirSync(currentDest, { recursive: true });
        }

        const items = fs.readdirSync(currentSrc);
        items.forEach(item => {
            copyRecursive(srcDir, destDir, path.join(relativePath, item));
        });
    } else {
        const ext = path.extname(currentSrc);
        
        if (!EXCLUDE_EXTENSIONS.includes(ext)) {
            const destDirPath = path.dirname(currentDest);
            if (!fs.existsSync(destDirPath)) {
                fs.mkdirSync(destDirPath, { recursive: true });
            }
            
            fs.copyFileSync(currentSrc, currentDest);
            console.log(`Copied: ${relativePath}`);
        }
    }
}

const srcDir = path.join(__dirname, 'src');
const outDir = path.join(__dirname, 'out');

copyRecursive(srcDir, outDir);