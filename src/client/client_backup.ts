// import * as THREE from 'three'
// import Stats from 'three/examples/jsm/libs/stats.module'

// import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
// import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
// import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
// import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
// import { CSG } from './utils/CSGMesh'
// import { createWall } from './wall';
// import meshSize from './utils/meshSize';
// import { roundedRectGeometry } from './utils/roundedRect';


// // LAYERS
// const ENTIRE_SCENE = 0, BLOOM_SCENE = 1;

// const bloomLayer = new THREE.Layers();
// bloomLayer.set(BLOOM_SCENE);


// // RENDERER
// const preview = document.getElementById('preview') ?? document.body
// const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance', alpha: true })
// renderer.setPixelRatio(1);
// renderer.setSize(preview.clientWidth, preview.clientHeight)
// renderer.toneMapping = THREE.ReinhardToneMapping;
// preview.appendChild(renderer.domElement)


// // CAMERA
// const camera = new THREE.PerspectiveCamera(75, preview.clientWidth / preview.clientHeight, 1, 150)
// // camera.position.x = 5
// // camera.position.y = 20
// // camera.position.z = 25
// camera.position.x = -20
// camera.position.y = 5
// camera.position.z = 40


// // CONTROLS
// const controls = new OrbitControls(camera, renderer.domElement)


// // SCENE
// const scene = new THREE.Scene()
// scene.background = null

// const renderScene = new RenderPass(scene, camera);

// const bloomPass = new UnrealBloomPass(new THREE.Vector2(preview.clientWidth, preview.clientHeight), 1, 1, 0);

// const bloomComposer = new EffectComposer(renderer);
// bloomComposer.renderToScreen = false;
// bloomComposer.addPass(renderScene);
// bloomComposer.addPass(bloomPass);

// const finalPass = new ShaderPass(
//     new THREE.ShaderMaterial({
//         uniforms: {
//             baseTexture: { value: null },
//             bloomTexture: { value: bloomComposer.renderTarget2.texture }
//         },
//         vertexShader: document.getElementById('vertexshader')?.textContent ?? '',
//         fragmentShader: document.getElementById('fragmentshader')?.textContent ?? '',
//         defines: {}
//     }), "baseTexture"
// );
// finalPass.needsSwap = true;

// const finalComposer = new EffectComposer(renderer);
// finalComposer.addPass(renderScene);
// finalComposer.addPass(finalPass);

// const raycaster = new THREE.Raycaster();

// scene.traverse(disposeMaterial);


// // LIGHTS

// const light = new THREE.AmbientLight('#ffffff', 0.5);
// scene.add(light);

// var light1 = new THREE.SpotLight('#ffffff', 2)
// light1.position.set(25, 50, 50)
// light1.angle = Math.PI / 4
// light1.penumbra = 0.5
// light1.castShadow = true
// light1.shadow.mapSize.width = 1024
// light1.shadow.mapSize.height = 1024
// light1.shadow.camera.near = 0.5
// light1.shadow.camera.far = 20
// scene.add(light1)

// var light2 = new THREE.SpotLight('#ffffff', 0.8)
// light2.position.set(-25, 50, 50)
// light2.angle = Math.PI / 4
// light2.penumbra = 0.5
// light2.castShadow = true
// light2.shadow.mapSize.width = 1024
// light2.shadow.mapSize.height = 1024
// light2.shadow.camera.near = 0.5
// light2.shadow.camera.far = 20
// scene.add(light2)


// const metalMaterial = new THREE.MeshPhongMaterial({ color: 0x272727, side: THREE.DoubleSide })
// const darkMaterial = new THREE.MeshBasicMaterial({ color: "black" });
// const materials: { [key: string]: THREE.Material | THREE.Material[] } = {};

// export interface IParams {
//     streetNum: string;
//     streetName1: string;
//     streetName2: string;
//     glow: boolean;
//     backplateColor: 'white' | 'yellow';

//     streetNumSize: number;
//     streetNameSize: number;
//     streetNameMargin: number;

//     depth: number;
//     plateHeight: number;
//     plateRadius: number;

//     lineThikness: number;
//     lineHeight: () => number;

//     ENTIRE_SCENE: 0;
//     BLOOM_SCENE: 1;
// }

// const params: IParams = {
//     streetNum: '12',
//     streetName1: 'Cooper',
//     streetName2: 'Road',
//     glow: false,
//     backplateColor: 'white',

//     streetNumSize: 5,
//     streetNameSize: 2.5,
//     streetNameMargin: 0.5,

//     depth: 0.5,
//     plateHeight: 9,
//     plateRadius: 1,

//     lineThikness: 0.4,
//     lineHeight: () => params.streetNameSize * 2 + params.streetNameMargin * 2,

//     ENTIRE_SCENE: 0,
//     BLOOM_SCENE: 1,
// };

// function createPlate(params: IParams) {
//     const loader = new THREE.FontLoader();
//     loader.load('fonts/Magettas_Regular.json', function (font) {

//         const streetNumMargin = getStreetNumMargin(font, params.streetNumSize, params.depth);

//         const streetNumTextMesh = new THREE.Mesh(
//             new THREE.TextBufferGeometry(params.streetNum, {
//                 font: font,
//                 size: params.streetNumSize,
//                 height: params.depth,
//                 curveSegments: 5
//             }),
//             new THREE.MeshPhongMaterial({ color: 0x0000ff })
//         )
//         const streetNumTextSize = meshSize(streetNumTextMesh)


//         const streetName1TextMesh = new THREE.Mesh(
//             new THREE.TextBufferGeometry(params.streetName1, {
//                 font: font,
//                 size: params.streetNameSize,
//                 height: params.depth,
//                 curveSegments: 5
//             }),
//             new THREE.MeshPhongMaterial({ color: 0x0000ff })
//         )
//         const streetName1TextSize = meshSize(streetName1TextMesh);


//         const streetName2TextMesh = new THREE.Mesh(
//             new THREE.TextBufferGeometry(params.streetName2, {
//                 font: font,
//                 size: params.streetNameSize,
//                 height: params.depth,
//                 curveSegments: 5
//             }),
//             new THREE.MeshPhongMaterial({ color: 0x0000ff })
//         )
//         const streetName2TextSize = meshSize(streetName2TextMesh);


//         const magicNumber = 0.5;   // street num text position correction
//         const magicNumber2 = 0.3;  // street name text position correction

//         const streetNumWidth = streetNumTextSize.x + streetNumMargin * 2
//         const streetNameWidth = streetName1TextSize.x > streetName2TextSize.x ? streetName1TextSize.x : streetName2TextSize.x
//         const plateWidth = streetNameWidth + streetNumWidth + params.lineThikness + streetNumMargin * 2 + magicNumber;
//         const plateStart = -plateWidth / 2;

//         streetNumTextMesh.position.set(plateStart + streetNumMargin, -params.streetNumSize / 2, -params.depth / 2)
//         streetName1TextMesh.position.set(plateStart + streetNumWidth + params.lineThikness + streetNumMargin + magicNumber2, params.streetNameMargin, -params.depth / 2)
//         streetName2TextMesh.position.set(plateStart + streetNumWidth + params.lineThikness + streetNumMargin + magicNumber2, -params.streetNameSize - params.streetNameMargin, -params.depth / 2)


//         const lineMesh = new THREE.Mesh(
//             new THREE.BoxBufferGeometry(params.lineThikness, params.lineHeight(), params.depth),
//             new THREE.MeshPhongMaterial({ color: 0xff0000 })
//         )
//         lineMesh.position.set(plateStart + streetNumWidth + magicNumber, 0, 0)

//         const plateMesh = new THREE.Mesh(
//             roundedRectGeometry(plateWidth, params.plateHeight, params.depth, params.plateRadius),
//             new THREE.MeshPhongMaterial({ color: 0xff0000 })
//         )

//         const backPlateMesh = new THREE.Mesh(
//             roundedRectGeometry(plateWidth, params.plateHeight, params.depth, params.plateRadius),
//             new THREE.MeshPhongMaterial({ color: 0xff0000 })
//         )
//         backPlateMesh.position.set(0, 0, -params.depth)

//         const backplateColor = params.backplateColor == 'yellow' ? 0xc2a827 : 0xffffff
//         const glowingPlateMesh = new THREE.Mesh(
//             roundedRectGeometry(plateWidth - 1, params.plateHeight - 1, 0.01, params.plateRadius),
//             new THREE.MeshPhongMaterial({ color: backplateColor })
//         )
//         glowingPlateMesh.name = 'glowingPlateMesh'
//         glowingPlateMesh.position.set(0, 0, -params.depth / 2)
//         if (params.glow)
//             glowingPlateMesh.layers.enable(BLOOM_SCENE);

//         plateMesh.updateMatrix()
//         backPlateMesh.updateMatrix()
//         streetNumTextMesh.updateMatrix()
//         streetName1TextMesh.updateMatrix()
//         streetName2TextMesh.updateMatrix()
//         lineMesh.updateMatrix()

//         const plateCSG = CSG.fromMesh(plateMesh)
//         const backPlateCSG = CSG.fromMesh(backPlateMesh)
//         const streetNumTextCSG = CSG.fromMesh(streetNumTextMesh)
//         const streetName1TextCSG = CSG.fromMesh(streetName1TextMesh)
//         const streetName2TextCSG = CSG.fromMesh(streetName2TextMesh)
//         const lineCSG = CSG.fromMesh(lineMesh)

//         let engravedPlateCSG = plateCSG.subtract(streetNumTextCSG)
//         engravedPlateCSG = engravedPlateCSG.subtract(streetName1TextCSG)
//         engravedPlateCSG = engravedPlateCSG.subtract(streetName2TextCSG)
//         engravedPlateCSG = engravedPlateCSG.subtract(lineCSG)
//         engravedPlateCSG = engravedPlateCSG.union(backPlateCSG)
//         const engravedPlateMesh = CSG.toMesh(engravedPlateCSG, new THREE.Matrix4())
//         engravedPlateMesh.name = 'plateMesh'
//         engravedPlateMesh.material = metalMaterial

//         // scene.add(streetNumTextMesh);
//         // scene.add(streetName1TextMesh);
//         // scene.add(streetName2TextMesh);

//         // CLEAR EXISTING MESHES
//         const existingPlateMeshes: THREE.Mesh[] = [];
//         scene.traverse((e) => {
//             if (e instanceof THREE.Mesh && (e.name != 'wall' && e.name != 'cone' && e.name != 'pole')) {
//                 existingPlateMeshes.push(e)
//             }
//         })
//         existingPlateMeshes.forEach((e) => {
//             scene.remove(e)
//             e.geometry.dispose()
//         })

//         scene.add(engravedPlateMesh)
//         scene.add(glowingPlateMesh)
//     })
// }


// window.addEventListener('resize', onWindowResize, false)
// function onWindowResize() {
//     camera.aspect = preview.clientWidth / preview.clientHeight
//     camera.updateProjectionMatrix()
//     renderer.setSize(preview.clientWidth, preview.clientHeight)
//     render()
// }

// const stats = Stats()
// document.body.appendChild(stats.dom)

// function animate() {
//     requestAnimationFrame(animate)

//     controls.update()

//     render()

//     stats.update()
// }

// function darkenNonBloomed(obj: any) {
//     if (obj.isMesh && bloomLayer.test(obj.layers) === false) {
//         const mesh = obj as THREE.Mesh
//         materials[mesh.uuid] = mesh.material;
//         mesh.material = darkMaterial;
//     }
// }

// function restoreMaterial(obj: any) {
//     if (materials[obj.uuid]) {
//         obj.material = materials[obj.uuid];
//         delete materials[obj.uuid];
//     }
// }

// function disposeMaterial(obj: any) {
//     if (obj.material) {
//         obj.material.dispose();
//     }
// }

// function render() {
//     // render scene with bloom
//     scene.traverse(darkenNonBloomed);
//     bloomComposer.render();
//     scene.traverse(restoreMaterial);

//     // render the entire scene, then render bloom scene on top
//     finalComposer.render();

//     // renderer.render(scene, camera)
// }

// scene.add(createWall(params))
// createPlate(params)
// animate()

// document.getElementById('apply')?.addEventListener('click', (e) => {
//     params.streetNum = (document.getElementById('street-number') as HTMLInputElement)?.value;
//     params.streetName1 = (document.getElementById('address-line-1') as HTMLInputElement)?.value;
//     params.streetName2 = (document.getElementById('address-line-2') as HTMLInputElement)?.value;
//     const backlightOn = (document.getElementById('backlight-color') as HTMLInputElement)?.value != 'no'
//     if (backlightOn) {
//         params.glow = (document.getElementById('backlight-on') as HTMLInputElement)?.checked;
//         params.backplateColor = (document.getElementById('backlight-color') as HTMLInputElement)?.value == 'white' ? 'white' : 'yellow';
//     } else {
//         params.glow = false;
//         params.backplateColor = 'white';
//     }

//     createPlate(params)
// })




// class App {
//     renderer: THREE.WebGLRenderer
//     camera: THREE.Camera
//     controls: OrbitControls
//     scene: THREE.Scene

//     bloomLayer: THREE.Layers
//     bloomComposer: EffectComposer
//     finalComposer: EffectComposer

//     metalMaterial = new THREE.MeshPhongMaterial({ color: 0x272727, side: THREE.DoubleSide })
//     darkMaterial = new THREE.MeshBasicMaterial({ color: "black" });
//     materials: { [key: string]: THREE.Material | THREE.Material[] } = {};

//     params: IParams = {
//         streetNum: '12',
//         streetName1: 'Cooper',
//         streetName2: 'Road',
//         glow: false,
//         backplateColor: 'white',

//         streetNumSize: 5,
//         streetNameSize: 2.5,
//         streetNameMargin: 0.5,

//         depth: 0.5,
//         plateHeight: 9,
//         plateRadius: 1,

//         lineThikness: 0.4,
//         lineHeight: () => this.params.streetNameSize * 2 + this.params.streetNameMargin * 2,

//         ENTIRE_SCENE: 0,
//         BLOOM_SCENE: 1,
//     };

//     constructor() {
//         this.renderer = this.createRenderer()
//         this.camera = this.createCamera()
//         this.controls = this.createControls()
//         this.scene = this.createScene()
//         this.createLights()
//         this.createWall()

//         const [bloomLayer, bloomComposer, finalComposer] = this.createBloom()
//         this.bloomLayer = bloomLayer
//         this.bloomComposer = bloomComposer
//         this.finalComposer = finalComposer
//     }

//     createRenderer(): THREE.WebGLRenderer {
//         const renderer = new THREE.WebGLRenderer({
//             antialias: false,
//             powerPreference: 'high-performance',
//             alpha: true,
//         })
//         renderer.setPixelRatio(1)
//         renderer.setSize(preview.clientWidth, preview.clientHeight)
//         renderer.toneMapping = THREE.ReinhardToneMapping
//         document.getElementById('preview')?.appendChild(renderer.domElement)
//         return renderer
//     }

//     createCamera(): THREE.Camera {
//         const aspect = this.renderer.domElement.clientWidth / this.renderer.domElement.clientHeight
//         const camera = new THREE.PerspectiveCamera(75, aspect, 1, 150)
//         camera.position.set(-20, 5, 40)
//         return camera
//     }

//     createControls(): OrbitControls {
//         const controls = new OrbitControls(this.camera, this.renderer.domElement)
//         return controls
//     }

//     createScene() {
//         const scene = new THREE.Scene()
//         return scene
//     }

//     createLights() {
//         const light = new THREE.AmbientLight('#ffffff', 0.5);
//         this.scene.add(light);

//         var light1 = new THREE.SpotLight('#ffffff', 2)
//         light1.position.set(25, 50, 50)
//         light1.angle = Math.PI / 4
//         light1.penumbra = 0.5
//         light1.castShadow = true
//         light1.shadow.mapSize.width = 1024
//         light1.shadow.mapSize.height = 1024
//         light1.shadow.camera.near = 0.5
//         light1.shadow.camera.far = 20
//         this.scene.add(light1)

//         var light2 = new THREE.SpotLight('#ffffff', 0.8)
//         light2.position.set(-25, 50, 50)
//         light2.angle = Math.PI / 4
//         light2.penumbra = 0.5
//         light2.castShadow = true
//         light2.shadow.mapSize.width = 1024
//         light2.shadow.mapSize.height = 1024
//         light2.shadow.camera.near = 0.5
//         light2.shadow.camera.far = 20
//         this.scene.add(light2)
//     }

//     createWall() {
//         const wall = createWall(params);
//         scene.add(wall);
//     }

//     createBloom(): [THREE.Layers, EffectComposer, EffectComposer] {
//         const bloomLayer = new THREE.Layers();
//         bloomLayer.set(this.params.BLOOM_SCENE);

//         const renderScene = new RenderPass(this.scene, this.camera);
//         const width = this.renderer.domElement.clientWidth
//         const height = this.renderer.domElement.clientHeight
//         const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 1, 1, 0);

//         const bloomComposer = new EffectComposer(this.renderer);
//         bloomComposer.renderToScreen = false;
//         bloomComposer.addPass(renderScene);
//         bloomComposer.addPass(bloomPass);

//         const finalPass = new ShaderPass(
//             new THREE.ShaderMaterial({
//                 uniforms: {
//                     baseTexture: { value: null },
//                     bloomTexture: { value: bloomComposer.renderTarget2.texture }
//                 },
//                 vertexShader: document.getElementById('vertexshader')?.textContent ?? '',
//                 fragmentShader: document.getElementById('fragmentshader')?.textContent ?? '',
//                 defines: {}
//             }), "baseTexture"
//         );
//         finalPass.needsSwap = true;

//         const finalComposer = new EffectComposer(this.renderer);
//         finalComposer.addPass(renderScene);
//         finalComposer.addPass(finalPass);

//         return [bloomLayer, bloomComposer, finalComposer]
//     }

//     darkenNonBloomed() {
//         this.scene.traverse((obj: any) => {
//             if (obj.isMesh && this.bloomLayer.test(obj.layers) === false) {
//                 const mesh = obj as THREE.Mesh
//                 this.materials[mesh.uuid] = mesh.material;
//                 mesh.material = this.darkMaterial;
//             }
//         })
//     }

//     restoreMaterials() {
//         this.scene.traverse((obj: any) => {
//             if (this.materials[obj.uuid]) {
//                 obj.material = this.materials[obj.uuid];
//                 delete this.materials[obj.uuid];
//             }
//         })
//     }

//     render() {
//         this.darkenNonBloomed()
//         this.bloomComposer.render();
//         this.restoreMaterials()
//         this.finalComposer.render();
//     }

//     update() {
//         requestAnimationFrame(this.update)
//         this.controls.update()
//         this.render()
//     }
// }

// export function getStreetNumMargin(font: THREE.Font, streetNumSize: number, depth: number) {
//     const streetNumMarginMesh = new THREE.Mesh(
//         new THREE.TextBufferGeometry('5', {
//             font: font,
//             size: streetNumSize,
//             height: depth,
//             curveSegments: 5
//         }),
//         new THREE.MeshPhongMaterial({ color: 0x0000ff })
//     )
//     const streetNumMarginSize = meshSize(streetNumMarginMesh)
//     const streetNumMargin = streetNumMarginSize.x / 2;
//     return streetNumMargin;
// }

// // const app = new App();
// // app.update()