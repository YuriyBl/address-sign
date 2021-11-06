import { App } from './app';
import '../css/main.sass';

const viewDOM = document.getElementById('preview') ?? document.body;
const app = new App(viewDOM);
app.update();

window.addEventListener('resize', (e) => app.onWindowResize(), false);
document.getElementById('apply')?.addEventListener('click', (e) => app.applyChanges());
document.getElementById('toggle-backlight')?.addEventListener('change', (e) => app.toggleBacklight());
document.getElementById('toggle-dimensions')?.addEventListener('change', (e) => app.toggleDimensions());
