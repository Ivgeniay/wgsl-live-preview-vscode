import { WebGPUContext } from '../core/webgpu-context';
import { ShaderCompiler } from '../shaders/shader-compiler';
import { UniformManager } from './uniform-manager';

export interface PipelineConfig {
    vertexEntryPoint?: string;
    fragmentEntryPoint?: string;
    vertexBufferLayout?: GPUVertexBufferLayout[];
    topology?: GPUPrimitiveTopology;
}

export class Pipeline {
    private context: WebGPUContext;
    private compiler: ShaderCompiler;
    private uniformManager: UniformManager;

    private pipeline: GPURenderPipeline | null = null;
    private pipelineLayout: GPUPipelineLayout | null = null;

    constructor(
        context: WebGPUContext,
        compiler: ShaderCompiler,
        uniformManager: UniformManager
    ) {
        this.context = context;
        this.compiler = compiler;
        this.uniformManager = uniformManager;
    }

    async create(shaderCode: string, config?: PipelineConfig): Promise<boolean> {
        const compilationResult = await this.compiler.compile(shaderCode);

        if (!compilationResult.success || !compilationResult.module) {
            return false;
        }

        try {
            this.pipelineLayout = this.createPipelineLayout();

            const vertexBufferLayout: GPUVertexBufferLayout = config?.vertexBufferLayout?.[0] || {
                arrayStride: 8,
                attributes: [{
                    shaderLocation: 0,
                    offset: 0,
                    format: 'float32x2'
                }]
            };

            const pipelineDescriptor: GPURenderPipelineDescriptor = {
                layout: this.pipelineLayout,
                vertex: {
                    module: compilationResult.module,
                    entryPoint: config?.vertexEntryPoint || 'vs_main',
                    buffers: [vertexBufferLayout]
                },
                fragment: {
                    module: compilationResult.module,
                    entryPoint: config?.fragmentEntryPoint || 'fs_main',
                    targets: [{
                        format: this.context.canvasFormat
                    }]
                },
                primitive: {
                    topology: config?.topology || 'triangle-list'
                }
            };

            this.pipeline = this.context.device.createRenderPipeline(pipelineDescriptor);
            
            this.uniformManager.createBindGroup();
            
            console.log('Pipeline created successfully');
            return true;

        } catch (error: any) {
            console.error('Pipeline creation error:', error);
            return false;
        }
    }

    private createPipelineLayout(): GPUPipelineLayout {
        const bindGroupLayout = this.uniformManager.getBindGroupLayout();

        return this.context.device.createPipelineLayout({
            bindGroupLayouts: [null, null, null, bindGroupLayout]
        });
    }

    getPipeline(): GPURenderPipeline | null {
        return this.pipeline;
    }

    isReady(): boolean {
        return this.pipeline !== null;
    }

    destroy(): void {
        this.pipeline = null;
        this.pipelineLayout = null;
    }
}