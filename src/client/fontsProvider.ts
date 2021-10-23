import * as THREE from 'three';
import meshSize from './utils/meshSize';

export class Font {
    constructor(
        private path: string,
        public name: string,
        private fixSizeMultiplier?: number,
        public lowerCaseHeight?: number,
        public content?: THREE.Font,
    ) { }

    isLoaded = () => !!this.content;

    getRealSize = (size: number) => size * this.fixSizeMultiplier!;
    getLowerCaseHeight = (size: number) => size * this.lowerCaseHeight!;

    load(): Promise<Font> {
        return new Promise((resolve, reject) => {
            new THREE.FontLoader().load(this.path, (font) => {
                this.content = font;
                this.computeHelpers()

                resolve(this);
            });
        })
    }

    private computeHelpers() {
        const fixMesh = new THREE.Mesh(
            new THREE.TextBufferGeometry('0', { font: this.content!, size: 1, curveSegments: 5, }),
        )
        this.fixSizeMultiplier = 1 / meshSize(fixMesh).y

        const lowerCaseMesh = new THREE.Mesh(
            new THREE.TextBufferGeometry('o', { font: this.content!, size: 1, curveSegments: 5, }),
        )
        this.lowerCaseHeight = meshSize(lowerCaseMesh).y
    }
}

export class FontProvider {
    private static instance: FontProvider;
    private fonts = [
        new Font('fonts/Magettas_Regular.json', 'Magettas'),
        new Font('fonts/Post_No_Bills_Colombo_Medium.json', 'Post No Bills Colombo'),
    ];

    async getFont(id: number): Promise<Font> {
        const font = this.fonts[id];
        if (!font.isLoaded()) await font.load();
        return font;
    }

    static getInstance(): FontProvider {
        if (!FontProvider.instance) {
            FontProvider.instance = new FontProvider();
        }
        return FontProvider.instance;
    }
}