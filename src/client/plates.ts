import * as THREE from 'three';
import meshSize from './utils/meshSize';
import { roundedRectGeometry } from './utils/roundedRect';
import { CSG } from './utils/CSGMesh';
import objectSize from './utils/objectSize';
import { FontProvider } from './fontsProvider';
import { Font } from './fontsProvider';
import { genTextMesh } from './utils/genTextMesh';
import { twoSideArrowGeometry } from './utils/twoSideArrow';
import { UNITS_TO_MM, BLOOM_SCENE } from './utils/const';


class Margin {
    h: number;
    v: number;
    lineSpacing: number;

    constructor(h: number, v: number, lineSpacing?: number) {
        this.h = h;
        this.v = v;
        this.lineSpacing = lineSpacing ?? 0;
    }
}

export class Color {
    public static list: Color[] = [
        new Color('White', 0xffffff, 0xdddddd),
        new Color('Yellow', 0xffe659, 0x826e00),
    ];

    constructor(
        public name: string,
        public value: number,
        public lightValue: number,
    ) { }
}


export interface IPlateInput {
    plateIndex: number;
    num: string;
    name: string[];
    glowing: boolean;
    colorId: number;
    fontId: number;
    scene: THREE.Scene;   // DEBUG ONLY
}

interface IPlateParams {
    height?: number,
    radius?: number;
    numSize: number;
    nameSize: number;
    nameIsTwoLines: boolean;
    depth?: number;
    margin: Margin;
    lineThikness?: number;
    material?: THREE.Material;
}

const DEFAULT_PLATE_PARAMS: IPlateParams = {
    height: 10,
    radius: 1,
    numSize: 6.0,
    nameSize: 2.3,
    nameIsTwoLines: true,
    depth: 0.4,
    margin: new Margin(2, 2),
    lineThikness: 0.4,
    material: new THREE.MeshPhongMaterial({ color: 0x454545, side: THREE.DoubleSide }),
}

class Plate {
    params: IPlateParams;
    generate: (text: IPlateInput) => Promise<[THREE.Mesh, THREE.Mesh, THREE.Mesh, THREE.Group]>;

    constructor(params: IPlateParams, generate: (params: IPlateParams) => (text: IPlateInput) => Promise<[THREE.Mesh, THREE.Mesh, THREE.Mesh, THREE.Group]>) {
        this.params = { ...DEFAULT_PLATE_PARAMS, ...params };
        this.generate = generate(this.params);
    }

    static genNumText(font: Font, input: IPlateInput, params: IPlateParams): [THREE.Mesh, THREE.Vector3] {
        const numTextMesh = genTextMesh({
            text: input.num,
            font: font.content!,
            size: font.getRealSize(params.numSize),
            depth: params.depth!,
        })
        const numTextSize = meshSize(numTextMesh)
        numTextMesh.translateZ(-params.depth! / 2)

        return [numTextMesh, numTextSize]
    }

    static genNameText(font: Font, input: IPlateInput, params: IPlateParams): [THREE.Mesh, THREE.Vector3] {
        let nameTextCSG = new CSG();
        if (params.nameIsTwoLines) {
            const name1TextMesh = genTextMesh({
                text: input.name[0],
                font: font.content!,
                size: font.getRealSize(params.nameSize),
                depth: params.depth!,
            })
            const name2TextMesh = genTextMesh({
                text: input.name[1],
                font: font.content!,
                size: font.getRealSize(params.nameSize),
                depth: params.depth!,
            })

            name1TextMesh.translateY(params.margin.lineSpacing + params.nameSize)
            name1TextMesh.translateZ(-params.depth! / 2)
            name2TextMesh.translateZ(-params.depth! / 2)

            nameTextCSG = nameTextCSG.union(CSG.fromMesh(name1TextMesh));
            nameTextCSG = nameTextCSG.union(CSG.fromMesh(name2TextMesh));
        } else {
            const nameTextMesh = new THREE.Mesh(
                new THREE.TextBufferGeometry(input.name.join(' '), { font: font.content!, size: params.nameSize, height: params.depth, curveSegments: 5 }),
            )
            nameTextMesh.translateZ(-params.depth! / 2)

            nameTextCSG = nameTextCSG.union(CSG.fromMesh(nameTextMesh));
        }

        const nameTextMesh = CSG.toMesh(nameTextCSG, new THREE.Matrix4())
        const nameTextSize = meshSize(nameTextMesh);

        return [nameTextMesh, nameTextSize];
    }

    static genLine(params: IPlateParams): THREE.Mesh {
        const lineMesh = new THREE.Mesh(
            new THREE.BoxBufferGeometry(params.lineThikness, params.numSize, params.depth),
        )
        lineMesh.position.set(params.lineThikness! / 2, params.numSize / 2, 0)

        return lineMesh;
    }

    static genPlates(plateWidth: number, plateHeight: number, engraveGroup: THREE.Group, params: IPlateParams, input: IPlateInput): [THREE.Mesh, THREE.Mesh, THREE.Mesh] {
        const plateMesh = new THREE.Mesh(
            roundedRectGeometry(plateWidth, plateHeight, params.depth!, params.radius!),
        )

        const backPlateMesh = new THREE.Mesh(
            roundedRectGeometry(plateWidth, plateHeight, params.depth!, params.radius!),
        )
        backPlateMesh.position.set(0, 0, -params.depth!)

        const plateCSG = CSG.fromMesh(plateMesh)
        const backPlateCSG = CSG.fromMesh(backPlateMesh)
        const toEngraveCSG = CSG.fromGroup(engraveGroup)
        let engravedPlateCSG = plateCSG.subtract(toEngraveCSG)
        engravedPlateCSG = engravedPlateCSG.union(backPlateCSG)
        const engravedPlateMesh = CSG.toMesh(engravedPlateCSG, new THREE.Matrix4(), params.material)
        engravedPlateMesh.name = 'plateMesh'

        const backlightMeshGlowing = new THREE.Mesh(
            roundedRectGeometry(plateWidth - 1, plateHeight - 1, 0.01, params.radius!),
            new THREE.MeshPhongMaterial({ color: Color.list[input.colorId].lightValue })
        )
        backlightMeshGlowing.name = 'backlightMeshGlowing'
        backlightMeshGlowing.position.set(0, 0, -params.depth! / 2)
        backlightMeshGlowing.layers.enable(BLOOM_SCENE);

        const backlightMesh = new THREE.Mesh(
            roundedRectGeometry(plateWidth - 1, plateHeight - 1, 0.01, params.radius!),
            new THREE.MeshPhongMaterial({ color: Color.list[input.colorId].value })
        )
        backlightMesh.name = 'backlightMesh'
        backlightMesh.position.set(0, 0, -params.depth! / 2)

        return [engravedPlateMesh, backlightMeshGlowing, backlightMesh];
    }

    static async genDimensionsArrows(width: number, height: number) {
        const dimensionsArrows = new THREE.Group()

        const horizontalArrow = new THREE.Mesh(twoSideArrowGeometry(0.25, width, 0.05), new THREE.MeshPhongMaterial())
        horizontalArrow.translateY(height / 2 + 1.5)
        const horizontalText = genTextMesh({
            text: Math.floor(width * UNITS_TO_MM).toFixed(2) + ' mm',
            font: (await FontProvider.getInstance().getDimensionsFont()).content!,
            size: 0.8,
            depth: 0.05
        })
        horizontalText.material = new THREE.MeshPhongMaterial()
        const horizontalTextSize = meshSize(horizontalText)
        horizontalText.translateY(height / 2 + 2)
        horizontalText.translateX(-horizontalTextSize.x / 2)

        const verticalArrow = new THREE.Mesh(twoSideArrowGeometry(0.25, height, 0.05), new THREE.MeshPhongMaterial())
        verticalArrow.translateX(-width / 2 - 1.5)
        verticalArrow.rotateZ(Math.PI / 2)
        const verticalText = genTextMesh({
            text: (height * UNITS_TO_MM).toFixed(2) + ' mm',
            font: (await FontProvider.getInstance().getDimensionsFont()).content!,
            size: 0.8,
            depth: 0.05
        })
        verticalText.material = new THREE.MeshPhongMaterial()
        const verticalTextSize = meshSize(verticalText)
        verticalText.translateX(-width / 2 - 2)
        verticalText.translateY(-verticalTextSize.x / 2)
        verticalText.rotateZ(Math.PI / 2)

        dimensionsArrows.add(horizontalArrow, horizontalText, verticalArrow, verticalText)

        return dimensionsArrows
    }
}

export const plates = [
    new Plate({
        numSize: 6.0,
        nameSize: 2.3,
        nameIsTwoLines: true,
        margin: new Margin(2, 2, 1.5)
    }, (params) => async (input: IPlateInput): Promise<[THREE.Mesh, THREE.Mesh, THREE.Mesh, THREE.Group]> => {
        const font = await FontProvider.getInstance().getFont(input.fontId);

        const [numTextMesh, numTextSize] = Plate.genNumText(font, input, params);
        const [nameTextMesh, nameTextSize] = Plate.genNameText(font, input, params);
        const lineMesh = Plate.genLine(params);

        let marginLeft = 0;
        let engraveGroup = new THREE.Group();

        marginLeft += params.margin.h;
        numTextMesh.translateX(marginLeft)
        marginLeft += numTextSize.x + params.margin.h;
        lineMesh.translateX(marginLeft)
        marginLeft += params.lineThikness! + params.margin.h;
        nameTextMesh.translateX(marginLeft)
        marginLeft += nameTextSize.x + params.margin.h;

        let plateWidth = marginLeft;

        engraveGroup.add(numTextMesh, nameTextMesh, lineMesh)
        engraveGroup.traverse((o) => { o.translateX(-plateWidth / 2); o.translateY(-params.numSize / 2) })

        const [engravedPlateMesh, backlightMeshGlowing, backlightMesh] = Plate.genPlates(plateWidth, params.height!, engraveGroup, params, input);

        const dimensionsArrows = await Plate.genDimensionsArrows(plateWidth, params.height!);

        return [engravedPlateMesh, backlightMeshGlowing, backlightMesh, dimensionsArrows];
    }),
    new Plate({
        numSize: 6.0,
        nameSize: 3.5,
        nameIsTwoLines: false,
        margin: new Margin(2, 2)
    }, (params) => async (input: IPlateInput): Promise<[THREE.Mesh, THREE.Mesh, THREE.Mesh, THREE.Group]> => {
        const font = await FontProvider.getInstance().getFont(input.fontId);

        const [numTextMesh, numTextSize] = Plate.genNumText(font, input, params);
        const [nameTextMesh, nameTextSize] = Plate.genNameText(font, input, params);
        const lineMesh = Plate.genLine(params);

        let marginLeft = 0;
        let engraveGroup = new THREE.Group();

        marginLeft += params.margin.h;
        numTextMesh.translateX(marginLeft)
        marginLeft += numTextSize.x + params.margin.h;
        lineMesh.translateX(marginLeft)
        marginLeft += params.lineThikness! + params.margin.h;
        nameTextMesh.translateX(marginLeft)
        nameTextMesh.translateY((params.numSize / 2) - (font.getLowerCaseHeight(params.nameSize) / 2))
        console.log(font.lowerCaseHeight! * params.nameSize, font.getLowerCaseHeight(params.nameSize))

        marginLeft += nameTextSize.x + params.margin.h;

        let plateWidth = marginLeft;

        engraveGroup.add(numTextMesh, nameTextMesh, lineMesh)
        engraveGroup.traverse((o) => { o.translateX(-plateWidth / 2); o.translateY(-params.numSize / 2) })

        const [engravedPlateMesh, backlightMeshGlowing, backlightMesh] = Plate.genPlates(plateWidth, params.height!, engraveGroup, params, input);

        const dimensionsArrows = await Plate.genDimensionsArrows(plateWidth, params.height!);
        return [engravedPlateMesh, backlightMeshGlowing, backlightMesh, dimensionsArrows];
    }),
    new Plate({
        height: 9.5,
        numSize: 5.0,
        nameSize: 1.5,
        nameIsTwoLines: false,
        margin: new Margin(1.5, 1, 0.4)
    }, (params) => async (input: IPlateInput): Promise<[THREE.Mesh, THREE.Mesh, THREE.Mesh, THREE.Group]> => {
        const font = await FontProvider.getInstance().getFont(input.fontId);

        const [numTextMesh, numTextSize] = Plate.genNumText(font, input, params);
        const [nameTextMesh, nameTextSize] = Plate.genNameText(font, input, params);

        let engraveGroup = new THREE.Group();
        let plateWidth = params.margin.h * 2 + (nameTextSize.x > numTextSize.x ? nameTextSize.x : numTextSize.x);

        numTextMesh.translateX(plateWidth / 2 - numTextSize.x / 2)
        numTextMesh.translateY(params.nameSize / 2 + params.margin.lineSpacing)
        nameTextMesh.translateX(plateWidth / 2 - nameTextSize.x / 2)
        nameTextMesh.translateY(-params.nameSize / 2 - params.margin.lineSpacing)

        engraveGroup.add(numTextMesh, nameTextMesh)
        engraveGroup.traverse((o) => { o.translateX(-plateWidth / 2); o.translateY(-params.numSize / 2) })

        const [engravedPlateMesh, backlightMeshGlowing, backlightMesh] = Plate.genPlates(plateWidth, params.height!, engraveGroup, params, input);

        const dimensionsArrows = await Plate.genDimensionsArrows(plateWidth, params.height!);
        return [engravedPlateMesh, backlightMeshGlowing, backlightMesh, dimensionsArrows];
    }),
    new Plate({
        height: 9.5,
        numSize: 5.0,
        nameSize: 1.5,
        nameIsTwoLines: false,
        margin: new Margin(1.5, 1, 0.4)
    }, (params) => async (input: IPlateInput): Promise<[THREE.Mesh, THREE.Mesh, THREE.Mesh, THREE.Group]> => {
        const font = await FontProvider.getInstance().getFont(input.fontId);

        const [numTextMesh, numTextSize] = Plate.genNumText(font, input, params);
        const [nameTextMesh, nameTextSize] = Plate.genNameText(font, input, params);

        let engraveGroup = new THREE.Group();
        let plateWidth = params.margin.h * 2 + (nameTextSize.x > numTextSize.x ? nameTextSize.x : numTextSize.x);

        numTextMesh.translateX(plateWidth - numTextSize.x - params.margin.h)
        numTextMesh.translateY(params.nameSize / 2 + params.margin.lineSpacing)
        nameTextMesh.translateX(plateWidth - nameTextSize.x - params.margin.h)
        nameTextMesh.translateY(-params.nameSize / 2 - params.margin.lineSpacing)

        engraveGroup.add(numTextMesh, nameTextMesh)
        engraveGroup.traverse((o) => { o.translateX(-plateWidth / 2); o.translateY(-params.numSize / 2) })

        const [engravedPlateMesh, backlightMeshGlowing, backlightMesh] = Plate.genPlates(plateWidth, params.height!, engraveGroup, params, input);

        const dimensionsArrows = await Plate.genDimensionsArrows(plateWidth, params.height!);
        return [engravedPlateMesh, backlightMeshGlowing, backlightMesh, dimensionsArrows];
    }),
    new Plate({
        height: 8.0,
        numSize: 5.0,
        nameSize: 0,
        nameIsTwoLines: false,
        margin: new Margin(2, 2)
    }, (params) => async (input: IPlateInput): Promise<[THREE.Mesh, THREE.Mesh, THREE.Mesh, THREE.Group]> => {
        const plateGroup = new THREE.Group();
        const font = await FontProvider.getInstance().getFont(input.fontId);

        const [numTextMesh, numTextSize] = Plate.genNumText(font, input, params);

        let engraveGroup = new THREE.Group();
        let plateWidth = params.margin.h * 2 + numTextSize.x;

        numTextMesh.translateX(plateWidth / 2 - numTextSize.x / 2)

        engraveGroup.add(numTextMesh)
        engraveGroup.traverse((o) => { o.translateX(-plateWidth / 2); o.translateY(-params.numSize / 2) })

        const [engravedPlateMesh, backlightMeshGlowing, backlightMesh] = Plate.genPlates(plateWidth, params.height!, engraveGroup, params, input);

        const dimensionsArrows = await Plate.genDimensionsArrows(plateWidth, params.height!);
        return [engravedPlateMesh, backlightMeshGlowing, backlightMesh, dimensionsArrows];
    }),
]