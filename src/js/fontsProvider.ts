import * as THREE from 'three';
import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader';
import meshSize from './utils/meshSize';

export class Font {
	constructor(
		private path: string,
		public name: string,
		private fixSizeMultiplier?: number,
		public lowerCaseHeight?: number,
		public content?: THREE.Font
	) {}

	isLoaded = () => !!this.content;

	getRealSize = (size: number) => size * this.fixSizeMultiplier!;
	getLowerCaseHeight = (size: number) => size * this.lowerCaseHeight!;

	load(): Promise<Font> {
		return new Promise((resolve, reject) => {
			new TTFLoader().load(this.path, (json) => {
				this.content = new THREE.Font(json);
				this.computeHelpers();

				resolve(this);
			});
		});
	}

	private computeHelpers() {
		const fixMesh = new THREE.Mesh(new THREE.TextBufferGeometry('0', { font: this.content!, size: 1, curveSegments: 5 }));
		this.fixSizeMultiplier = 1 / meshSize(fixMesh).y;

		const lowerCaseMesh = new THREE.Mesh(new THREE.TextBufferGeometry('o', { font: this.content!, size: 1, curveSegments: 5 }));
		this.lowerCaseHeight = meshSize(lowerCaseMesh).y;
	}
}

export class FontProvider {
	private static instance: FontProvider;
	dimensionsFont = new Font(require('assets/fonts/roboto/Roboto-Medium.ttf'), 'Roboto');
	fonts = [
		new Font(require('assets/fonts/post-no-bills/postnobillscolombo-medium.ttf'), 'Post No Bills Colombo'),
		new Font(require('assets/fonts/magettas/Magettas-Regular.ttf'), 'Magettas'),
		new Font(require('assets/fonts/bravo/Bravo-Regular.ttf'), 'Bravo Stencil'),
		new Font(require('assets/fonts/allerta-stencil/AllertaStencil-Regular.ttf'), 'Allerta Stencil'),
	];

	async getFont(id: number): Promise<Font> {
		const font = this.fonts[id];
		if (!font.isLoaded()) await font.load();
		return font;
	}

	async getDimensionsFont(): Promise<Font> {
		if (!this.dimensionsFont.isLoaded()) await this.dimensionsFont.load();
		return this.dimensionsFont;
	}

	static getInstance(): FontProvider {
		if (!FontProvider.instance) {
			FontProvider.instance = new FontProvider();
		}
		return FontProvider.instance;
	}
}
