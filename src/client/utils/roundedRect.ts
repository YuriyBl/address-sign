import * as THREE from 'three'

export function roundedRectShape(width: number, height: number, radius: number) {
    let x = 0, y = 0;
    let shape = new THREE.Shape();
    shape.moveTo(x, y + radius);
    shape.lineTo(x, y + height - radius);
    shape.quadraticCurveTo(x, y + height, x + radius, y + height);
    shape.lineTo(x + width - radius, y + height);
    shape.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
    shape.lineTo(x + width, y + radius);
    shape.quadraticCurveTo(x + width, y, x + width - radius, y);
    shape.lineTo(x + radius, y);
    shape.quadraticCurveTo(x, y, x, y + radius);

    return shape;
}

export function roundedRectGeometry(width: number, height: number, depth: number, radius: number) {
    const extrudeSettings = { depth: depth, bevelEnabled: false };
    const shape = roundedRectShape(width, height, radius);
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center()
    return geometry;
}