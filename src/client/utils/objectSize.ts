import * as THREE from 'three'

export default function objectSize(obj: THREE.Object3D) {
    const box = new THREE.Box3().setFromObject(obj);
    const objectSize = box.getSize(new THREE.Vector3());
    return objectSize;
}