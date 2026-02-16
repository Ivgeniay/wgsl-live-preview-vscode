import { WebGPUContext } from '../core/webgpu-context';
import { Pipeline } from './pipeline';
import { UniformManager } from './uniform-manager';

export class Renderer {
    private context: WebGPUContext;
    private pipeline: Pipeline;
    private uniformManager: UniformManager;

    private vertexBuffer: GPUBuffer | null = null;
    private isRunning: boolean = false;
    private animationFrameId: number | null = null;

    constructor(
        context: WebGPUContext,
        pipeline: Pipeline,
        uniformManager: UniformManager
    ) {
        this.context = context;
        this.pipeline = pipeline;
        this.uniformManager = uniformManager;
    }

    setVertexBuffer(buffer: GPUBuffer): void {
        this.vertexBuffer = buffer;
    }

    render(): void {
        if (!this.pipeline.isReady() || !this.vertexBuffer) {
            console.log('Cannot render: pipeline or vertex buffer not ready');
            return;
        }

        this.uniformManager.update(this.context.canvas);

        const commandEncoder = this.context.device.createCommandEncoder();
        const textureView = this.context.context.getCurrentTexture().createView();

        const renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [{
                view: textureView,
                clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
                loadOp: 'clear',
                storeOp: 'store'
            }]
        };

        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.setPipeline(this.pipeline.getPipeline()!);

        const bindGroup = this.uniformManager.getBindGroup();
        if (bindGroup) {
            passEncoder.setBindGroup(3, bindGroup);
        }

        passEncoder.setVertexBuffer(0, this.vertexBuffer);
        passEncoder.draw(6, 1, 0, 0);
        passEncoder.end();

        this.context.device.queue.submit([commandEncoder.finish()]);
    }

    startRenderLoop(): void {
        if (this.isRunning) {
            return;
        }

        this.isRunning = true;
        const loop = () => {
            if (!this.isRunning) {
                return;
            }

            if (this.pipeline.isReady()) {
                this.render();
            }

            this.animationFrameId = requestAnimationFrame(loop);
        };

        loop();
        console.log('Render loop started');
    }

    stopRenderLoop(): void {
        this.isRunning = false;
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        console.log('Render loop stopped');
    }

    isRendering(): boolean {
        return this.isRunning;
    }
}