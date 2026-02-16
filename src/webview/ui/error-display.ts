export class ErrorDisplay {
    private errorDiv: HTMLDivElement;

    constructor(errorDiv: HTMLDivElement) {
        this.errorDiv = errorDiv;
    }

    show(message: string): void {
        this.errorDiv.textContent = message;
        this.errorDiv.style.display = 'block';
        console.error(message);
    }

    hide(): void {
        this.errorDiv.style.display = 'none';
    }

    isVisible(): boolean {
        return this.errorDiv.style.display === 'block';
    }
}