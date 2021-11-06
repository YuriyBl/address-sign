import * as THREE from 'three';

interface IGenTextMeshParameters {
	font: THREE.Font;
	text: string;
	size: number;
	depth: number;
}

export function genTextMesh(parameters: IGenTextMeshParameters): THREE.Mesh {
	const textGeometryParameters = {
		font: parameters.font,
		size: parameters.size,
		height: parameters.depth,
		curveSegments: 5,
	};

	const textMesh = new THREE.Mesh(new THREE.TextBufferGeometry(parameters.text, textGeometryParameters));

	const fixMesh = new THREE.Mesh(new THREE.TextBufferGeometry(parameters.text[0], textGeometryParameters));

	fixMesh.geometry.computeBoundingBox();
	const fixPos = fixMesh.geometry.boundingBox!.min;
	textMesh.position.set(-fixPos.x, -fixPos.y, -fixPos.z);

	return textMesh;
}
