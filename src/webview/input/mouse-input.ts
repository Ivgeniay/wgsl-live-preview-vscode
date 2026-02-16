export interface MouseState {
    x: number;
    y: number;
    clickX: number;
    clickY: number;
    buttons: number;
}

export class MouseInput {
    private canvas: HTMLCanvasElement;
    private state: MouseState;
    
    private onMoveCallback?: (x: number, y: number) => void;
    private onClickCallback?: (x: number, y: number) => void;
    private onButtonChangeCallback?: (buttons: number) => void;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.state = {
            x: 0,
            y: 0,
            clickX: 0,
            clickY: 0,
            buttons: 0
        };

        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    private handleMouseMove(e: MouseEvent): void {
        const rect = this.canvas.getBoundingClientRect();
        this.state.x = (e.clientX - rect.left) / rect.width;
        this.state.y = 1.0 - (e.clientY - rect.top) / rect.height;

        if (this.onMoveCallback) {
            this.onMoveCallback(this.state.x, this.state.y);
        }
    }

    private handleMouseDown(e: MouseEvent): void {
        const rect = this.canvas.getBoundingClientRect();
        this.state.clickX = (e.clientX - rect.left) / rect.width;
        this.state.clickY = 1.0 - (e.clientY - rect.top) / rect.height;

        if (e.button === 0) this.state.buttons |= 1;
        if (e.button === 1) this.state.buttons |= 4;
        if (e.button === 2) this.state.buttons |= 2;

        if (this.onClickCallback) {
            this.onClickCallback(this.state.clickX, this.state.clickY);
        }

        if (this.onButtonChangeCallback) {
            this.onButtonChangeCallback(this.state.buttons);
        }
    }

    private handleMouseUp(e: MouseEvent): void {
        if (e.button === 0) this.state.buttons &= ~1;
        if (e.button === 1) this.state.buttons &= ~4;
        if (e.button === 2) this.state.buttons &= ~2;

        if (this.onButtonChangeCallback) {
            this.onButtonChangeCallback(this.state.buttons);
        }
    }

    onMove(callback: (x: number, y: number) => void): void {
        this.onMoveCallback = callback;
    }

    onClick(callback: (x: number, y: number) => void): void {
        this.onClickCallback = callback;
    }

    onButtonChange(callback: (buttons: number) => void): void {
        this.onButtonChangeCallback = callback;
    }

    getState(): MouseState {
        return { ...this.state };
    }
}