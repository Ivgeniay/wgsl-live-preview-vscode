export class WebGPUContext {
    private static instance: WebGPUContext | null = null;

    private _device: GPUDevice | null = null;
    private _context: GPUCanvasContext | null = null;
    private _canvas: HTMLCanvasElement;
    private _canvasFormat: GPUTextureFormat;

    private constructor(canvas: HTMLCanvasElement) {
        this._canvas = canvas;
        this._canvasFormat = navigator.gpu.getPreferredCanvasFormat();
    }

    static async initialize(canvas: HTMLCanvasElement): Promise<WebGPUContext> {
        if (WebGPUContext.instance) {
            return WebGPUContext.instance;
        }

        const context = new WebGPUContext(canvas);
        await context.initWebGPU();
        WebGPUContext.instance = context;
        return context;
    }

    static getInstance(): WebGPUContext {
        if (!WebGPUContext.instance) {
            throw new Error('WebGPUContext not initialized. Call initialize() first.');
        }
        return WebGPUContext.instance;
    }

    private async initWebGPU(): Promise<void> {
        if (!navigator.gpu) {
            throw new Error('WebGPU is not supported in this environment');
        }

        console.log('Requesting adapter...');
        const adapter = await navigator.gpu.requestAdapter();
        console.log('Adapter:', adapter);

        if (!adapter) {
            throw new Error('Failed to get GPU adapter');
        }

        this._device = await adapter.requestDevice();

        this._context = this._canvas.getContext('webgpu');
        if (!this._context) {
            throw new Error('Failed to get WebGPU context');
        }

        this._context.configure({
            device: this._device,
            format: this._canvasFormat,
            alphaMode: 'opaque'
        });

        console.log('WebGPU initialized successfully');
    }

    get device(): GPUDevice {
        if (!this._device) {
            throw new Error('Device not initialized');
        }
        return this._device;
    }

    get context(): GPUCanvasContext {
        if (!this._context) {
            throw new Error('Context not initialized');
        }
        return this._context;
    }

    get canvas(): HTMLCanvasElement {
        return this._canvas;
    }

    get canvasFormat(): GPUTextureFormat {
        return this._canvasFormat;
    }

    static dispose(): void {
        WebGPUContext.instance = null;
    }
}