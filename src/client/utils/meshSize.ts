import * as THREE from 'three';

export default function meshSize(mesh: THREE.Mesh) {
	const box = new THREE.Box3().setFromObject(mesh);
	const meshSize = box.getSize(new THREE.Vector3());
	return meshSize;
}
