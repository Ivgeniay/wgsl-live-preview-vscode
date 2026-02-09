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

                currentPanel.webview.html = getWebviewContent();

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
            }, 100);
        }
    });

    context.subscriptions.push(disposable);
    context.subscriptions.push(changeDocumentSubscription);
}

function getWebviewContent(): string {
    const htmlPath = path.join(__dirname, 'webview', 'preview.html');
    return fs.readFileSync(htmlPath, 'utf8');
}

function getGlobals(): string {
    const globalsPath = path.join(__dirname, 'webview', 'globals.wgsl');
    return fs.readFileSync(globalsPath, 'utf8');
}

function injectGlobals(shaderCode: string): string {
    const globalsCode = getGlobals();
    return shaderCode + globalsCode;
    //return globalsCode + shaderCode;
}

export function deactivate() {}