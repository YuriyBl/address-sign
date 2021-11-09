import * as THREE from 'three';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { createWall } from './wall/wall';
import { Color, plates, Size } from './plates/plates';
import { FontProvider } from './fontsProvider';
import { BACKLIGHT_PRICE_PER_CM, BLOOM_SCENE, PRICE_PER_CM } from './utils/const';
import meshSize from './utils/meshSize';
import { fragmentShader, vertexShader } from './utils/shaders';

export interface IAppInput {
	plateIndex: number;
	num: string;
	name: string[];
	hasBacklight: boolean;
	backlightIsOn: boolean;
	showDimensions: boolean;
	colorId: number;
	fontId: number;
	sizeId: number;
}

export class App {
	viewDOM: HTMLElement;
	renderer: THREE.WebGLRenderer;
	camera: THREE.PerspectiveCamera;
	controls: OrbitControls;
	scene: THREE.Scene;

	bloomLayer: THREE.Layers;
	bloomComposer: EffectComposer;
	finalComposer: EffectComposer;

	darkMaterial = new THREE.MeshBasicMaterial({ color: 'black' });
	materials: { [key: string]: THREE.Material | THREE.Material[] } = {};

	plate: THREE.Mesh;
	backlightMeshGlowing: THREE.Mesh;
	backlightMesh: THREE.Mesh;
	dimensionsArrowsGroup: THREE.Group;

	input: IAppInput = {
		plateIndex: 0,
		num: '12',
		name: ['Cooper', 'Road'],
		hasBacklight: true,
		backlightIsOn: false,
		showDimensions: false,
		colorId: 0,
		fontId: 0,
		sizeId: 1,
	};

	constructor(viewDOM: HTMLElement) {
		this.renderDOM();

		this.viewDOM = viewDOM;
		this.renderer = this.createRenderer();
		this.camera = this.createCamera();
		this.controls = this.createControls();
		this.scene = this.createScene();
		this.createLights();
		this.createWall();

		this.plate = new THREE.Mesh();
		this.backlightMesh = new THREE.Mesh();
		this.backlightMeshGlowing = new THREE.Mesh();
		this.dimensionsArrowsGroup = new THREE.Group();
		this.applyChanges();

		const [bloomLayer, bloomComposer, finalComposer] = this.createBloom();
		this.bloomLayer = bloomLayer;
		this.bloomComposer = bloomComposer;
		this.finalComposer = finalComposer;
	}

	createRenderer(): THREE.WebGLRenderer {
		const renderer = new THREE.WebGLRenderer({
			antialias: true,
			powerPreference: 'high-performance',
			alpha: true,
		});
		renderer.setClearColor(0x393939, 0.14);
		// renderer.outputEncoding = THREE.sRGBEncoding
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(this.viewDOM.clientWidth, this.viewDOM.clientHeight);
		this.viewDOM.appendChild(renderer.domElement);
		return renderer;
	}

	createCamera(): THREE.PerspectiveCamera {
		const aspect = this.viewDOM.clientWidth / this.viewDOM.clientHeight;
		const camera = new THREE.PerspectiveCamera(75, aspect, 4, 2000);
		camera.position.set(-20, 5, 40);
		return camera;
	}

	createControls(): OrbitControls {
		const controls = new OrbitControls(this.camera, this.viewDOM);
		controls.maxDistance = 100;
		controls.minDistance = 10;
		controls.minPolarAngle = Math.PI / 4;
		controls.maxPolarAngle = (3 * Math.PI) / 4;
		controls.minAzimuthAngle = -Math.PI / 3;
		controls.maxAzimuthAngle = Math.PI / 3;
		controls.enablePan = false;

		return controls;
	}

	createScene() {
		const scene = new THREE.Scene();
		return scene;
	}

	createLights() {
		const lightMult = 0.4;

		const light = new THREE.AmbientLight('#ffffff', lightMult * 0.5);
		this.scene.add(light);

		var light1 = new THREE.SpotLight('#ffffff', lightMult * 1.5);
		light1.position.set(35, 60, 60);
		light1.angle = Math.PI / 4;
		this.scene.add(light1);

		var light2 = new THREE.SpotLight('#ffffff', lightMult * 0.5);
		light2.position.set(-35, 60, 60);
		light2.angle = Math.PI / 4;
		this.scene.add(light2);
	}

	createWall() {
		const wall = createWall(plates[this.input.plateIndex].params.depth!);
		this.scene.add(wall);
	}

	async createPlate() {
		const signParts = await plates[this.input.plateIndex].generate(this.input);
		const [newPlate, newBacklightMeshGlowing, newBacklightMesh, newDimensionsArrowsGroup] = signParts;

		this.scene.remove(this.plate, this.backlightMeshGlowing, this.backlightMesh, this.dimensionsArrowsGroup);

		this.plate = newPlate;
		this.backlightMeshGlowing = newBacklightMeshGlowing;
		this.backlightMesh = newBacklightMesh;
		this.dimensionsArrowsGroup = newDimensionsArrowsGroup;
		this.scene.add(this.plate);

		this.toggleBacklight();
		this.toggleDimensions();
	}

	createBloom(): [THREE.Layers, EffectComposer, EffectComposer] {
		const bloomLayer = new THREE.Layers();
		bloomLayer.set(BLOOM_SCENE);

		const renderScene = new RenderPass(this.scene, this.camera);
		const bloomPass = new UnrealBloomPass(new THREE.Vector2(this.viewDOM.clientWidth, this.viewDOM.clientHeight), 1, 1, 0);

		const bloomComposer = new EffectComposer(this.renderer);
		bloomComposer.renderToScreen = false;
		bloomComposer.addPass(renderScene);
		bloomComposer.addPass(bloomPass);

		const finalPass = new ShaderPass(
			new THREE.ShaderMaterial({
				uniforms: {
					baseTexture: { value: null },
					bloomTexture: { value: bloomComposer.renderTarget2.texture },
				},
				vertexShader: vertexShader,
				fragmentShader: fragmentShader,
				defines: {},
			}),
			'baseTexture'
		);
		finalPass.needsSwap = true;

		const finalComposer = new EffectComposer(this.renderer);
		finalComposer.addPass(renderScene);
		finalComposer.addPass(finalPass);

		this.scene.traverse(this.disposeMaterial);

		return [bloomLayer, bloomComposer, finalComposer];
	}

	darkenNonBloomed() {
		this.scene.traverse((obj: any) => {
			if (obj.isMesh && this.bloomLayer.test(obj.layers) === false) {
				const mesh = obj as THREE.Mesh;
				this.materials[mesh.uuid] = mesh.material;
				mesh.material = this.darkMaterial;
			}
		});
	}

	restoreMaterials() {
		this.scene.traverse((obj: any) => {
			if (this.materials[obj.uuid]) {
				obj.material = this.materials[obj.uuid];
				delete this.materials[obj.uuid];
			}
		});
	}

	disposeMaterial(obj: any) {
		if (obj.material) {
			obj.material.dispose();
		}
	}

	onWindowResize() {
		this.camera.aspect = this.viewDOM.clientWidth / this.viewDOM.clientHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(this.viewDOM.clientWidth, this.viewDOM.clientHeight);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.render();
	}

	render() {
		this.darkenNonBloomed();
		this.bloomComposer.render();
		this.restoreMaterials();
		this.finalComposer.render();
	}

	update() {
		this.controls.update();
		this.render();
		requestAnimationFrame(() => this.update());
	}

	toggleBacklight(backlightIsOn?: boolean) {
		if (backlightIsOn != undefined) this.input.backlightIsOn = backlightIsOn;

		if (this.input.hasBacklight && this.input.backlightIsOn) {
			this.scene.remove(this.backlightMesh);
			this.scene.add(this.backlightMeshGlowing);
		} else {
			this.scene.remove(this.backlightMeshGlowing);
			this.scene.add(this.backlightMesh);
		}
	}

	toggleDimensions(showDimensions?: boolean) {
		if (showDimensions != undefined) this.input.showDimensions = showDimensions;

		if (this.input.showDimensions) {
			this.scene.add(this.dimensionsArrowsGroup);
		} else {
			this.scene.remove(this.dimensionsArrowsGroup);
		}
	}

	updatePrice() {
		const basePrice = plates[this.input.plateIndex].params.basePrice!;
		const plateSize = meshSize(this.plate);
		const sizePrice = Math.round(plateSize.x * plateSize.y * PRICE_PER_CM);
		const backlightPrice = this.input.hasBacklight ? Math.round(plateSize.x * plateSize.y * BACKLIGHT_PRICE_PER_CM) : 0;

		document.querySelector('#base-price')!.innerHTML = basePrice.toString();
		document.querySelector('#size-price')!.innerHTML = sizePrice.toString();
		document.querySelector('#backlight-price')!.innerHTML = backlightPrice.toString();
		(document.querySelector('#backlight-tr') as HTMLElement).style.display = this.input.hasBacklight ? 'table-row' : 'none';

		document.querySelector('#total-price')!.innerHTML = (basePrice + sizePrice + backlightPrice).toString();
	}

	setNum(num: string) {
		this.input.num = num;
		this.applyChanges();
	}

	setName1(name: string) {
		this.input.name[0] = name;
		this.applyChanges();
	}

	setName2(name: string) {
		this.input.name[1] = name;
		this.applyChanges();
	}

	setPlateIndex(plateIndex: number) {
		this.input.plateIndex = plateIndex;
		this.applyChanges();
	}

	setFontId(fontId: number) {
		this.input.fontId = fontId;
		this.applyChanges();
	}

	setHasBacklight(hasBacklight: boolean) {
		this.input.hasBacklight = hasBacklight;
		this.toggleBacklight();
		this.renderDOM();
		this.updatePrice();
	}

	setColorId(colorId: number) {
		this.input.colorId = colorId;
		this.applyChanges();
	}

	setSizeId(sizeId: number) {
		this.input.sizeId = sizeId;
		this.applyChanges();
	}

	async applyChanges() {
		await this.createPlate();
		this.renderDOM();
		this.updatePrice();
	}

	renderDOM() {
		const fontSelector = document.getElementById('font') as HTMLInputElement;
		fontSelector.innerHTML = FontProvider.getInstance()
			.fonts.map((f, i) => `<option value="${i}" ${i == this.input.fontId ? 'selected="selected"' : ''}>${f.name}</option>`)
			.join('\n');

		(document.getElementById('street-number') as HTMLInputElement).value = this.input.num;
		(document.getElementById('address-line-1') as HTMLInputElement).value = this.input.name[0];
		(document.getElementById('address-line-2') as HTMLInputElement).value = this.input.name[1];
		(document.getElementById('toggle-backlight') as HTMLInputElement).checked = this.input.backlightIsOn;

		const colorSelector = document.getElementById('backlight-color') as HTMLInputElement;
		colorSelector.innerHTML = Color.list
			.map((c, i) => `<option value="${i}" ${i == this.input.colorId ? 'selected="selected"' : ''}>${c.name}</option>`)
			.join('\n');

		const sizes = document.querySelector('#sizes') as HTMLElement;
		sizes.innerHTML = Size.list
			.map(
				(s, i) => `
							<div class="option">
									<input type="radio" name="size" id="size-${s.name}" value="${i}" ${i == this.input.sizeId ? 'checked="checked"' : ''}'>
									<label for="size-${s.name}">${s.name}</label>
							</div>
							`
			)
			.join('\n');

		(document.querySelector('input[name="backlight"][value="yes"]') as HTMLInputElement).checked = this.input.hasBacklight;
		(document.getElementById('toggle-backlight') as HTMLInputElement).disabled = !this.input.hasBacklight;
	}
}
