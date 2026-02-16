const esbuild = require('esbuild');
const path = require('path');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

async function main() {
    const ctx = await esbuild.context({
        entryPoints: [path.join(__dirname, 'src', 'webview', 'render.ts')],
        bundle: true,
        outfile: path.join(__dirname, 'out', 'webview', 'bundle.js'),
        platform: 'browser',
        format: 'iife',
        sourcemap: !production,
        minify: production,
        target: 'es2020',
        logLevel: 'info',
    });

    if (watch) {
        await ctx.watch();
        console.log('Watching webview files...');
    } else {
        await ctx.rebuild();
        await ctx.dispose();
        console.log('Webview bundle built successfully');
    }
}

main().catch(e => {
    console.error('Build failed:', e);
    process.exit(1);
});