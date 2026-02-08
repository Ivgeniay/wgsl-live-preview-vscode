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

            const shaderCode = editor.document.getText();
            currentPanel.webview.postMessage({
                command: 'updateShader',
                code: shaderCode
            });
        }
    );

    context.subscriptions.push(disposable);
}

function getWebviewContent(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WGSL Preview</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            background: #1e1e1e;
        }
        #canvas {
            width: 100vw;
            height: 100vh;
            display: block;
        }
        #error {
            position: absolute;
            top: 10px;
            left: 10px;
            color: #f48771;
            background: rgba(0, 0, 0, 0.8);
            padding: 10px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 12px;
            max-width: 80%;
            display: none;
        }
    </style>
</head>
<body>
    <canvas id="canvas"></canvas>
    <div id="error"></div>
    <script>
        const canvas = document.getElementById('canvas');
        const errorDiv = document.getElementById('error');
        
        let device = null;
        let context = null;
        let pipeline = null;
        let vertexBuffer = null;
        let currentShaderCode = '';

        async function initWebGPU() {
            console.log('navigator.gpu:', navigator.gpu);
            
            if (!navigator.gpu) {
                showError('WebGPU is not supported in this environment');
                return false;
            }

            try {
                const adapter = await navigator.gpu.requestAdapter();
                if (!adapter) {
                    showError('Failed to get GPU adapter');
                    return false;
                }

                device = await adapter.requestDevice();
                
                context = canvas.getContext('webgpu');
                const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
                
                context.configure({
                    device: device,
                    format: canvasFormat,
                    alphaMode: 'opaque'
                });

                createVertexBuffer();
                
                console.log('WebGPU initialized successfully');
                return true;
            } catch (error) {
                showError('WebGPU initialization failed: ' + error.message);
                return false;
            }
        }

        function createVertexBuffer() {
            const vertices = new Float32Array([
                -1.0, -1.0,
                 1.0, -1.0,
                -1.0,  1.0,
                -1.0,  1.0,
                 1.0, -1.0,
                 1.0,  1.0,
            ]);

            vertexBuffer = device.createBuffer({
                size: vertices.byteLength,
                usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
                mappedAtCreation: true
            });

            new Float32Array(vertexBuffer.getMappedRange()).set(vertices);
            vertexBuffer.unmap();
        }

        function createPipeline(shaderCode) {
            try {
                const shaderModule = device.createShaderModule({
                    code: shaderCode
                });

                const pipelineDescriptor = {
                    layout: 'auto',
                    vertex: {
                        module: shaderModule,
                        entryPoint: 'vs_main',
                        buffers: [{
                            arrayStride: 8,
                            attributes: [{
                                shaderLocation: 0,
                                offset: 0,
                                format: 'float32x2'
                            }]
                        }]
                    },
                    fragment: {
                        module: shaderModule,
                        entryPoint: 'fs_main',
                        targets: [{
                            format: navigator.gpu.getPreferredCanvasFormat()
                        }]
                    },
                    primitive: {
                        topology: 'triangle-list'
                    }
                };

                pipeline = device.createRenderPipeline(pipelineDescriptor);
                hideError();
                return true;
            } catch (error) {
                showError('Shader compilation error: ' + error.message);
                return false;
            }
        }

        function render() {
            if (!device || !pipeline) {
                return;
            }

            const commandEncoder = device.createCommandEncoder();
            const textureView = context.getCurrentTexture().createView();

            const renderPassDescriptor = {
                colorAttachments: [{
                    view: textureView,
                    clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
                    loadOp: 'clear',
                    storeOp: 'store'
                }]
            };

            const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
            passEncoder.setPipeline(pipeline);
            passEncoder.setVertexBuffer(0, vertexBuffer);
            passEncoder.draw(6, 1, 0, 0);
            passEncoder.end();

            device.queue.submit([commandEncoder.finish()]);
        }

        function showError(message) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            console.error(message);
        }

        function hideError() {
            errorDiv.style.display = 'none';
        }

        function resizeCanvas() {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = canvas.clientWidth * dpr;
            canvas.height = canvas.clientHeight * dpr;
            if (pipeline) {
                render();
            }
        }

        window.addEventListener('resize', resizeCanvas);

        window.addEventListener('message', event => {
            const message = event.data;
            
            if (message.command === 'updateShader') {
                currentShaderCode = message.code;
                
                if (device && currentShaderCode) {
                    if (createPipeline(currentShaderCode)) {
                        render();
                    }
                }
            }
        });

        initWebGPU().then(success => {
            if (success) {
                resizeCanvas();
            }
        });
    </script>
</body>
</html>`;
}

export function deactivate() {}