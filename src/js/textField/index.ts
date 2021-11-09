export class InputField {
	private inputElement: HTMLInputElement;
	private currentValue: string;
	private isWaiting: boolean;
	private timeout?: ReturnType<typeof setTimeout>;
	public onValueChange?: (value: string) => void;
	public onWaitingChange?: (isWaiting: boolean) => void;

	public value = () => this.currentValue;

	constructor(
		querySelector: string,
		args?: {
			onValueChange?: (value: string) => void;
			onWaitingChange?: (isWaiting: boolean) => void;
		}
	) {
		this.inputElement = document.querySelector(querySelector) as HTMLInputElement;
		this.inputElement.addEventListener('input', (e) => this.onInput(e));
		this.currentValue = this.inputElement.value;
		this.onValueChange = args?.onValueChange;
		this.isWaiting = false;
		this.onWaitingChange = args?.onWaitingChange;
	}

	public destroy() {
		this.inputElement.removeEventListener('input', (e) => this.onInput(e));
		if (this.timeout) clearTimeout(this.timeout);
	}

	private updateValue() {
		const newValue = this.inputElement.value;
		if (newValue !== this.currentValue) {
			this.currentValue = newValue;
			if (this.onValueChange) this.onValueChange(this.currentValue);
		}
	}

	private updateIsWaiting(isWaiting: boolean) {
		if (isWaiting !== this.isWaiting) {
			this.isWaiting = isWaiting;
			if (this.onWaitingChange) this.onWaitingChange(this.isWaiting);
		}
	}

	private createTimeout() {
		this.updateIsWaiting(true);
		this.timeout = setTimeout(() => {
			this.timeout = undefined;
			this.updateIsWaiting(false);
			this.updateValue();
		}, 1000);
	}

	private onInput(e: Event) {
		if (this.timeout) {
			clearTimeout(this.timeout);
			this.createTimeout();
		} else {
			this.createTimeout();
		}
	}
}
