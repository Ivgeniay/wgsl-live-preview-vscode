import { WebGPUContext } from '../core/webgpu-context';
import { ResourceFactory } from '../core/resource-factory';

export interface UniformData {
    time: number;
    timeDelta: number;
    frame: number;
    resolution: { width: number; height: number };
    mouse: { x: number; y: number };
    mouseClick: { x: number; y: number };
    mouseButtons: number;
}

export class UniformManager {
    private context: WebGPUContext;
    private factory: ResourceFactory;
    
    private uniformBuffer: GPUBuffer;
    private bindGroup: GPUBindGroup | null = null;
    private bindGroupLayout: GPUBindGroupLayout;

    private startTime: number;
    private lastFrameTime: number;
    private frameCount: number;

    private mouseState: {
        x: number;
        y: number;
        clickX: number;
        clickY: number;
        buttons: number;
    };

    constructor(context: WebGPUContext, factory: ResourceFactory) {
        this.context = context;
        this.factory = factory;

        this.uniformBuffer = this.factory.createUniformBuffer(48);
        this.bindGroupLayout = this.createBindGroupLayout();

        this.startTime = performance.now();
        this.lastFrameTime = performance.now();
        this.frameCount = 0;

        this.mouseState = {
            x: 0,
            y: 0,
            clickX: 0,
            clickY: 0,
            buttons: 0
        };
    }

    private createBindGroupLayout(): GPUBindGroupLayout {
        return this.context.device.createBindGroupLayout({
            entries: [{
                binding: 0,
                visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                buffer: {
                    type: 'uniform'
                }
            }]
        });
    }

    createBindGroup(): void {
        try {
            this.bindGroup = this.context.device.createBindGroup({
                layout: this.bindGroupLayout,
                entries: [{
                    binding: 0,
                    resource: {
                        buffer: this.uniformBuffer
                    }
                }]
            });
            console.log('Bind group created');
        } catch (error) {
            console.warn('Could not create bind group (shader may not use wgsl_globals):', error);
            this.bindGroup = null;
        }
    }

    update(canvas: HTMLCanvasElement): void {
        const currentTime = performance.now();
        const time = (currentTime - this.startTime) / 1000.0;
        const timeDelta = (currentTime - this.lastFrameTime) / 1000.0;
        this.lastFrameTime = currentTime;

        const data = new ArrayBuffer(48);
        const view = new DataView(data);

        view.setFloat32(0, time, true);
        view.setFloat32(4, timeDelta, true);
        view.setUint32(8, this.frameCount, true);

        view.setFloat32(16, canvas.width, true);
        view.setFloat32(20, canvas.height, true);
        view.setFloat32(24, this.mouseState.x, true);
        view.setFloat32(28, this.mouseState.y, true);

        view.setFloat32(32, this.mouseState.clickX, true);
        view.setFloat32(36, this.mouseState.clickY, true);
        view.setUint32(40, this.mouseState.buttons, true);

        this.context.device.queue.writeBuffer(this.uniformBuffer, 0, data);

        this.frameCount++;
    }

    updateMousePosition(x: number, y: number): void {
        this.mouseState.x = x;
        this.mouseState.y = y;
    }

    updateMouseClick(x: number, y: number): void {
        this.mouseState.clickX = x;
        this.mouseState.clickY = y;
    }

    updateMouseButtons(buttons: number): void {
        this.mouseState.buttons = buttons;
    }

    getBindGroup(): GPUBindGroup | null {
        return this.bindGroup;
    }

    getBindGroupLayout(): GPUBindGroupLayout {
        return this.bindGroupLayout;
    }

    getUniformData(): UniformData {
        const currentTime = performance.now();
        const time = (currentTime - this.startTime) / 1000.0;
        const timeDelta = (currentTime - this.lastFrameTime) / 1000.0;

        return {
            time,
            timeDelta,
            frame: this.frameCount,
            resolution: {
                width: this.context.canvas.width,
                height: this.context.canvas.height
            },
            mouse: {
                x: this.mouseState.x,
                y: this.mouseState.y
            },
            mouseClick: {
                x: this.mouseState.clickX,
                y: this.mouseState.clickY
            },
            mouseButtons: this.mouseState.buttons
        };
    }

    reset(): void {
        this.startTime = performance.now();
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
    }
}