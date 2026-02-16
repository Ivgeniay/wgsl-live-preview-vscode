import { WebGPUContext } from './webgpu-context';

export class ResourceFactory {
    private context: WebGPUContext;

    constructor(context: WebGPUContext) {
        this.context = context;
    }

    createVertexBuffer(vertices: Float32Array): GPUBuffer {
        const device = this.context.device;

        const buffer = device.createBuffer({
            size: vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true
        });

        new Float32Array(buffer.getMappedRange()).set(vertices);
        buffer.unmap();

        return buffer;
    }

    createUniformBuffer(size: number): GPUBuffer {
        const device = this.context.device;

        const buffer = device.createBuffer({
            size: size,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        console.log('Uniform buffer created, size:', size);
        return buffer;
    }

    createStorageBuffer(size: number, data?: ArrayBuffer): GPUBuffer {
        const device = this.context.device;

        const buffer = device.createBuffer({
            size: size,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
            mappedAtCreation: !!data
        });

        if (data) {
            new Uint8Array(buffer.getMappedRange()).set(new Uint8Array(data));
            buffer.unmap();
        }

        console.log('Storage buffer created, size:', size);
        return buffer;
    }

    createIndexBuffer(indices: Uint16Array | Uint32Array): GPUBuffer {
        const device = this.context.device;

        const buffer = device.createBuffer({
            size: indices.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true
        });

        if (indices instanceof Uint16Array) {
            new Uint16Array(buffer.getMappedRange()).set(indices);
        } else {
            new Uint32Array(buffer.getMappedRange()).set(indices);
        }
        
        buffer.unmap();

        return buffer;
    }

    static createFullscreenQuadVertices(): Float32Array {
        return new Float32Array([
            -1.0, -1.0,
             1.0, -1.0,
            -1.0,  1.0,
            -1.0,  1.0,
             1.0, -1.0,
             1.0,  1.0,
        ]);
    }

    static createFullscreenQuadVerticesWithUV(): Float32Array {
        return new Float32Array([
            -1.0, -1.0,  0.0, 0.0,
            1.0, -1.0,  1.0, 0.0,
            -1.0,  1.0,  0.0, 1.0,
            -1.0,  1.0,  0.0, 1.0,
            1.0, -1.0,  1.0, 0.0,
            1.0,  1.0,  1.0, 1.0,
        ]);
    }
}