import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
    
    let currentPanel: vscode.WebviewPanel | undefined = undefined;

    const disposable = vscode.commands.registerCommand(
        'wgsl-live-preview.showPreview',
        () => {
            const editor = vscode.window.activeTextEditor;
            
            if (!editor) {
                vscode.window.showErrorMessage('No active editor');
                return;
            }

            if (editor.document.languageId !== 'wgsl') {
                vscode.window.showErrorMessage('Current file is not a WGSL shader');
                return;
            }

            if (currentPanel) {
                currentPanel.reveal(vscode.ViewColumn.Beside);
            } else {
                currentPanel = vscode.window.createWebviewPanel(
                    'wgslPreview',
                    'WGSL Preview',
                    vscode.ViewColumn.Beside,
                    {
                        enableScripts: true,
                        retainContextWhenHidden: true
                    }
                );

                currentPanel.webview.html = getWebviewContent(currentPanel.webview, context.extensionUri);

                currentPanel.onDidDispose(() => {
                    currentPanel = undefined;
                }, null, context.subscriptions);
            }

            const shaderCode = injectGlobals(editor.document.getText());
            console.log('Sending shader code, length:', shaderCode.length);
            currentPanel.webview.postMessage({
                command: 'updateShader',
                code: shaderCode
            });
        }
    );

    let updateTimeout: NodeJS.Timeout | undefined;
    let postTimeout: number = 100;

    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(event => {
        if (event.document.languageId === 'wgsl' && currentPanel) {
            if (updateTimeout) {
                clearTimeout(updateTimeout);
            }
            
            updateTimeout = setTimeout(() => {
                const shaderCode = injectGlobals(event.document.getText());
                console.log('Document changed, updating shader, length:', shaderCode.length);
                currentPanel!.webview.postMessage({
                    command: 'updateShader',
                    code: shaderCode
                });
            }, postTimeout);
        }
    });
    const createShaderDisposable = vscode.commands.registerCommand(
        'wgsl-live-preview.createNewShader',
        async (uri: vscode.Uri) => {
            let folderPath: string;

            if (uri && uri.fsPath) {
                const stat = await vscode.workspace.fs.stat(uri);
                if (stat.type === vscode.FileType.Directory) {
                    folderPath = uri.fsPath;
                } else {
                    folderPath = path.dirname(uri.fsPath);
                }
            } else if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
                folderPath = vscode.workspace.workspaceFolders[0]!.uri.fsPath;
            } else {
                vscode.window.showErrorMessage('No workspace folder found');
                return;
            }

            const fileName = await vscode.window.showInputBox({
                prompt: 'Enter shader file name',
                placeHolder: 'shader.wgsl',
                value: 'shader.wgsl',
                validateInput: (value) => {
                    if (!value) {
                        return 'File name cannot be empty';
                    }
                    if (!value.endsWith('.wgsl')) {
                        return 'File must have .wgsl extension';
                    }
                    return null;
                }
            });

            if (!fileName) {
                return;
            }

            const filePath = path.join(folderPath, fileName);
            const fileUri = vscode.Uri.file(filePath);

            try {
                await vscode.workspace.fs.stat(fileUri);
                vscode.window.showErrorMessage(`File ${fileName} already exists`);
                return;
            } catch {
            }

            const shaderTemplate = `struct VertexInput {
    @location(0) pos: vec2f,
}

struct VertexOutput {
    @builtin(position) pos: vec4f,
}

struct FragmentOutput {
    @location(0) color: vec4f,
}

@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
    var output = VertexOutput(
        vec4f(input.pos, 0.0, 1.0)
    );

    return output;
}

@fragment
fn fs_main(input: VertexOutput) -> FragmentOutput {
    var output = FragmentOutput(
        vec4f(1.0, 1.0, 1.0, 1.0)
    );

    return output;
}
`;

            await vscode.workspace.fs.writeFile(fileUri, Buffer.from(shaderTemplate, 'utf8'));

            const document = await vscode.workspace.openTextDocument(fileUri);
            await vscode.window.showTextDocument(document);
        }
    );

    context.subscriptions.push(createShaderDisposable);
    context.subscriptions.push(disposable);
    context.subscriptions.push(changeDocumentSubscription);
}

function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri): string {
    const htmlPath = path.join(__dirname, 'webview', 'preview.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    const cspSource = webview.cspSource;
    
    const bundleJsPath = vscode.Uri.joinPath(extensionUri, 'out', 'webview', 'bundle.js');
    const bundleJsUri = webview.asWebviewUri(bundleJsPath);
    
    return htmlContent
        .replace('{{cspSource}}', cspSource)
        .replace('{{bundleUri}}', bundleJsUri.toString());
}

function getGlobals(): string {
    const globalsPath = path.join(__dirname, 'webview', 'globals.wgsl');
    return fs.readFileSync(globalsPath, 'utf8');
}

function injectGlobals(shaderCode: string): string {
    const globalsCode = getGlobals();
    return shaderCode + globalsCode;
}

export function deactivate() {}