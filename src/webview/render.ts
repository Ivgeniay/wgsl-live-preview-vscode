import { WebGPUContext } from './core/webgpu-context';
import { ResourceFactory } from './core/resource-factory';
import { UniformManager } from './rendering/uniform-manager';
import { ShaderCompiler } from './shaders/shader-compiler';
import { Pipeline } from './rendering/pipeline';
import { Renderer } from './rendering/renderer';
import { ErrorDisplay } from './ui/error-display';
import { CanvasManager } from './ui/canvas-manager';
import { MouseInput } from './input/mouse-input';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const errorDiv = document.getElementById('error') as HTMLDivElement;

let context: WebGPUContext;
let factory: ResourceFactory;
let uniformManager: UniformManager;
let compiler: ShaderCompiler;
let pipeline: Pipeline;
let renderer: Renderer;
let errorDisplay: ErrorDisplay;
let canvasManager: CanvasManager;
let mouseInput: MouseInput;

let currentShaderCode: string = '';

window.addEventListener('message', async (event) => {
    const message = event.data;
    console.log('Received message:', message);

    if (message.command === 'updateShader') {
        currentShaderCode = message.code;
        console.log('Shader code received, length:', currentShaderCode.length);

        if (context) {
            console.log('Context ready, compiling immediately');
            await handleShaderUpdate(currentShaderCode);
        } else {
            console.log('Context not ready, shader will be compiled after init');
        }
    }
});

async function initialize(): Promise<boolean> {
    try {
        context = await WebGPUContext.initialize(canvas);
        factory = new ResourceFactory(context);
        uniformManager = new UniformManager(context, factory);
        compiler = new ShaderCompiler(context);
        pipeline = new Pipeline(context, compiler, uniformManager);
        renderer = new Renderer(context, pipeline, uniformManager);
        errorDisplay = new ErrorDisplay(errorDiv);
        canvasManager = new CanvasManager(canvas);
        mouseInput = new MouseInput(canvas);

        const vertices = ResourceFactory.createFullscreenQuadVertices();
        const vertexBuffer = factory.createVertexBuffer(vertices);
        renderer.setVertexBuffer(vertexBuffer);

        setupEventHandlers();

        console.log('Application initialized successfully');
        return true;

    } catch (error: any) {
        errorDisplay.show('Initialization failed: ' + error.message);
        return false;
    }
}

function setupEventHandlers(): void {
    canvasManager.onResize(() => {
        if (pipeline.isReady()) {
            renderer.render();
        }
    });

    mouseInput.onMove((x, y) => {
        uniformManager.updateMousePosition(x, y);
    });

    mouseInput.onClick((x, y) => {
        uniformManager.updateMouseClick(x, y);
    });

    mouseInput.onButtonChange((buttons) => {
        uniformManager.updateMouseButtons(buttons);
    });

    // window.addEventListener('message', async (event) => {
    //     const message = event.data;
    //     console.log('Received message:', message);

    //     if (message.command === 'updateShader') {
    //         currentShaderCode = message.code; 
    //         console.log('Shader code received, length:', currentShaderCode.length);
    //         console.log('Context initialized:', !!context);

    //         if (context) {
    //             await handleShaderUpdate(currentShaderCode);
    //         } else {
    //             console.log('Context not ready, shader will be compiled after init');
    //         }
    //     }
    // });
}

async function handleShaderUpdate(shaderCode: string): Promise<void> {
    const success = await pipeline.create(shaderCode);

    if (success) {
        errorDisplay.hide();
        
        if (!renderer.isRendering()) {
            renderer.startRenderLoop();
        }
    } else {
        errorDisplay.show('Failed to create pipeline. Check shader for errors.');
    }
}

initialize().then(async (success) => {
    if (success) {
        canvasManager.resize();

        if (currentShaderCode) {
            console.log('Compiling shader received before initialization');
            await handleShaderUpdate(currentShaderCode);
        } else {
            console.log('No shader code to compile');
        }
    }
});