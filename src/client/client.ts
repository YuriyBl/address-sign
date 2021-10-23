import * as THREE from 'three'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { createWall } from './wall';
import { Color, IPlateInput, plates } from './plates';

export interface IParams {
    streetNum: string;
    streetName1: string;
    streetName2: string;
    glow: boolean;
    backplateColor: 'white' | 'yellow';
}

class App {
    preview: HTMLElement
    renderer: THREE.WebGLRenderer
    camera: THREE.PerspectiveCamera
    controls: OrbitControls
    scene: THREE.Scene

    bloomLayer: THREE.Layers
    bloomComposer: EffectComposer
    finalComposer: EffectComposer

    darkMaterial = new THREE.MeshBasicMaterial({ color: "black" });
    materials: { [key: string]: THREE.Material | THREE.Material[] } = {};

    plateGroup: THREE.Group;
    backlightMesh: THREE.Mesh;

    private ENTIRE_SCENE = 0;
    private BLOOM_SCENE = 1;

    input: IPlateInput = {
        plateIndex: 0,
        num: '12',
        name: ['Cooper', 'Road'],
        glowing: true,
        color: Color.list[1],
        fontId: 1,
        scene: new THREE.Scene,
    }

    constructor() {
        this.preview = document.getElementById('preview') ?? document.body
        this.renderer = this.createRenderer()
        this.camera = this.createCamera()
        this.controls = this.createControls()
        this.scene = this.createScene()
        this.input.scene = this.scene;
        this.createLights()
        this.createWall()

        this.plateGroup = new THREE.Group();
        this.backlightMesh = new THREE.Mesh();
        this.createPlate()

        const [bloomLayer, bloomComposer, finalComposer] = this.createBloom()
        this.bloomLayer = bloomLayer
        this.bloomComposer = bloomComposer
        this.finalComposer = finalComposer
    }

    createRenderer(): THREE.WebGLRenderer {
        const renderer = new THREE.WebGLRenderer({
            antialias: false,
            powerPreference: 'high-performance',
            alpha: true,
        })
        renderer.setPixelRatio(1)
        renderer.setSize(this.preview.clientWidth, this.preview.clientHeight)
        // renderer.toneMapping = THREE.ReinhardToneMapping
        document.getElementById('preview')?.appendChild(renderer.domElement)
        return renderer
    }

    createCamera(): THREE.PerspectiveCamera {
        const aspect = this.renderer.domElement.clientWidth / this.renderer.domElement.clientHeight
        const camera = new THREE.PerspectiveCamera(75, aspect, 1, 250)
        camera.position.set(-20, 5, 40)
        return camera
    }

    createControls(): OrbitControls {
        const controls = new OrbitControls(this.camera, this.renderer.domElement)
        controls.maxDistance = 100
        controls.minDistance = 10
        controls.minPolarAngle = Math.PI / 4
        controls.maxPolarAngle = 3 * Math.PI / 4
        controls.minAzimuthAngle = - Math.PI / 3
        controls.maxAzimuthAngle = Math.PI / 3

        return controls
    }

    createScene() {
        const scene = new THREE.Scene()
        return scene
    }

    createLights() {
        const lightMult = 0.4;

        const light = new THREE.AmbientLight('#ffffff', lightMult * 0.5);
        this.scene.add(light);

        var light1 = new THREE.SpotLight('#ffffff', lightMult * 1.5)
        light1.position.set(35, 60, 60)
        light1.angle = Math.PI / 4
        this.scene.add(light1)

        var light2 = new THREE.SpotLight('#ffffff', lightMult * 0.5)
        light2.position.set(-35, 60, 60)
        light2.angle = Math.PI / 4
        this.scene.add(light2)
    }

    createWall() {
        const wall = createWall(plates[this.input.plateIndex].params.depth!);
        this.scene.add(wall);
    }

    async createPlate() {
        const [newPlateGroup, newBacklightMesh] = await plates[this.input.plateIndex].generate(this.input)

        this.plateGroup.traverse((e) => {
            if (e instanceof THREE.Mesh) e.geometry.dispose();
        })
        this.scene.remove(this.plateGroup);

        this.plateGroup = newPlateGroup;
        this.backlightMesh = newBacklightMesh;
        this.scene.add(this.plateGroup);
    }

    createBloom(): [THREE.Layers, EffectComposer, EffectComposer] {
        const bloomLayer = new THREE.Layers();
        bloomLayer.set(this.BLOOM_SCENE);

        const renderScene = new RenderPass(this.scene, this.camera);
        const width = this.renderer.domElement.clientWidth
        const height = this.renderer.domElement.clientHeight
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 1, 1, 0);

        const bloomComposer = new EffectComposer(this.renderer);
        bloomComposer.renderToScreen = false;
        bloomComposer.addPass(renderScene);
        bloomComposer.addPass(bloomPass);

        const finalPass = new ShaderPass(
            new THREE.ShaderMaterial({
                uniforms: {
                    baseTexture: { value: null },
                    bloomTexture: { value: bloomComposer.renderTarget2.texture }
                },
                vertexShader: document.getElementById('vertexshader')?.textContent ?? '',
                fragmentShader: document.getElementById('fragmentshader')?.textContent ?? '',
                defines: {}
            }), "baseTexture"
        );
        finalPass.needsSwap = true;

        const finalComposer = new EffectComposer(this.renderer);
        finalComposer.addPass(renderScene);
        finalComposer.addPass(finalPass);

        this.scene.traverse(this.disposeMaterial);

        return [bloomLayer, bloomComposer, finalComposer]
    }

    darkenNonBloomed() {
        this.scene.traverse((obj: any) => {
            if (obj.isMesh && this.bloomLayer.test(obj.layers) === false) {
                const mesh = obj as THREE.Mesh
                this.materials[mesh.uuid] = mesh.material;
                mesh.material = this.darkMaterial;
            }
        })
    }

    restoreMaterials() {
        this.scene.traverse((obj: any) => {
            if (this.materials[obj.uuid]) {
                obj.material = this.materials[obj.uuid];
                delete this.materials[obj.uuid];
            }
        })
    }

    disposeMaterial(obj: any) {
        if (obj.material) {
            obj.material.dispose();
        }
    }

    onWindowResize() {
        this.camera.aspect = this.preview.clientWidth / this.preview.clientHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(this.preview.clientWidth, this.preview.clientHeight)
        this.render()
    }

    applyChanges() {
        this.input.plateIndex = parseInt((document.querySelector('input[name="type"]:checked') as HTMLInputElement)?.value)
        this.input.num = (document.getElementById('street-number') as HTMLInputElement)?.value;

        if (plates[this.input.plateIndex].params.nameIsTwoLines) {
            this.input.name = [
                (document.getElementById('address-line-1') as HTMLInputElement)?.value,
                (document.getElementById('address-line-2') as HTMLInputElement)?.value,
            ]
        } else {
            this.input.name = [
                (document.getElementById('address-line-1') as HTMLInputElement)?.value,
            ]
        }
        const backlightOn = (document.getElementById('backlight-color') as HTMLInputElement)?.value != 'no'
        if (backlightOn) {
            this.input.glowing = (document.getElementById('backlight-on') as HTMLInputElement)?.checked;
            this.input.color = Color.list[parseInt((document.getElementById('backlight-color') as HTMLInputElement)?.value)]
        } else {
            this.input.glowing = false;
            this.input.color = Color.list[0];
        }

        this.createPlate();
    }

    render() {
        this.darkenNonBloomed()
        this.bloomComposer.render();
        this.restoreMaterials()
        this.finalComposer.render();
    }

    update() {
        this.controls.update()
        this.render()
        requestAnimationFrame(() => this.update())
    }
}

const app = new App();
app.update();

window.addEventListener('resize', (e) => app.onWindowResize(), false)
document.getElementById('apply')?.addEventListener('click', (e) => app.applyChanges())