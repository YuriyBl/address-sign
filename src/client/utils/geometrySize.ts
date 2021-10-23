import * as THREE from 'three'

export default function geometrySize(geometry: THREE.BufferGeometry) {
    geometry.computeBoundingBox()
    const box = geometry.boundingBox ?? new THREE.Box3();
    const geometrySize = box.getSize(new THREE.Vector3());
    return geometrySize;
}