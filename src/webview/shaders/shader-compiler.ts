import { WebGPUContext } from '../core/webgpu-context';

export interface ShaderCompilationResult {
    success: boolean;
    module?: GPUShaderModule;
    error?: string;
}

export class ShaderCompiler {
    private context: WebGPUContext;

    constructor(context: WebGPUContext) {
        this.context = context;
    }

    async compile(shaderCode: string): Promise<ShaderCompilationResult> {
        try {
            console.log('Compiling shader, length:', shaderCode.length);

            const shaderModule = this.context.device.createShaderModule({
                code: shaderCode
            });

            const compilationInfo = await shaderModule.getCompilationInfo();

            for (const message of compilationInfo.messages) {
                if (message.type === 'error') {
                    const errorText = `Shader compilation error at line ${message.lineNum}:${message.linePos}: ${message.message}`;
                    console.error(errorText);
                    return {
                        success: false,
                        error: errorText
                    };
                }
            }

            console.log('Shader compiled successfully');
            return {
                success: true,
                module: shaderModule
            };

        } catch (error: any) {
            console.error('Shader compilation error:', error);
            return {
                success: false,
                error: `Shader compilation error: ${error.message}`
            };
        }
    }

    getCompilationInfoText(compilationInfo: GPUCompilationInfo): string {
        const messages = compilationInfo.messages
            .map(msg => `[${msg.type}] Line ${msg.lineNum}:${msg.linePos} - ${msg.message}`)
            .join('\n');
        
        return messages || 'No compilation messages';
    }
}