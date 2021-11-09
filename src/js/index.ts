import { InputField } from './textField';
import '../css/main.sass';

(async function () {
	document.querySelector('.loading-overlay')?.classList.add('show');

	const { App } = await import(/* webpackMode: "lazy" */ './app');

	const viewDOM = document.getElementById('preview') ?? document.body;
	const app = new App(viewDOM);
	app.update();

	new InputField('#street-number', { onValueChange: (v) => app.setNum(v) });
	new InputField('#address-line-1', { onValueChange: (v) => app.setName1(v) });
	new InputField('#address-line-2', { onValueChange: (v) => app.setName2(v) });

	document.querySelector('#types')!.addEventListener('change', (e) => {
		const plateIndex = parseInt((e.target as HTMLInputElement).value);
		app.setPlateIndex(plateIndex);
	});

	document.querySelector('#font')!.addEventListener('change', (e) => {
		const fontId = parseInt((e.target as HTMLInputElement).value);
		app.setFontId(fontId);
	});

	document.querySelector('#backlight-color')!.addEventListener('change', (e) => {
		const colorId = parseInt((e.target as HTMLInputElement).value);
		app.setColorId(colorId);
	});

	document.querySelector('#has-backlight')!.addEventListener('change', (e) => {
		const target = e.target as HTMLInputElement;
		const hasBacklight = target.value == 'yes' && target.checked;
		app.setHasBacklight(hasBacklight);
	});

	document.querySelector('#sizes')!.addEventListener('change', (e) => {
		const sizeId = parseInt((e.target as HTMLInputElement)?.value);
		app.setSizeId(sizeId);
	});

	document.querySelector('#toggle-backlight')?.addEventListener('change', (e) => {
		const backlightIsOn = (e.target as HTMLInputElement).checked;
		app.toggleBacklight(backlightIsOn);
	});
	document.querySelector('#toggle-dimensions')?.addEventListener('change', (e) => {
		const showDimensions = (e.target as HTMLInputElement).checked;
		app.toggleDimensions(showDimensions);
	});

	window.addEventListener('resize', (e) => app.onWindowResize(), false);
})();
