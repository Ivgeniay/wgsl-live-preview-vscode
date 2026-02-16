export class CanvasManager {
    private canvas: HTMLCanvasElement;
    private resizeCallback?: () => void;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.setupResizeListener();
    }

    private setupResizeListener(): void {
        window.addEventListener('resize', () => {
            this.resize();
            if (this.resizeCallback) {
                this.resizeCallback();
            }
        });
    }

    resize(): void {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.canvas.clientWidth * dpr;
        this.canvas.height = this.canvas.clientHeight * dpr;
        console.log('Canvas resized:', this.canvas.width, 'x', this.canvas.height);
    }

    onResize(callback: () => void): void {
        this.resizeCallback = callback;
    }

    getSize(): { width: number; height: number } {
        return {
            width: this.canvas.width,
            height: this.canvas.height
        };
    }

    getClientSize(): { width: number; height: number } {
        return {
            width: this.canvas.clientWidth,
            height: this.canvas.clientHeight
        };
    }
}