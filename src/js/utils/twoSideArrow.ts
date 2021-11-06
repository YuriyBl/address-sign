import * as THREE from 'three';

export function twoSideArrowShape(thikness: number, length: number) {
	let x = 0;
	let y = 0;
	const lineLength = length - 2 * (thikness * Math.SQRT2) - 2 * (thikness / Math.SQRT2 - thikness / 2);
	const arrowLength = 1.5 * thikness;

	let shape = new THREE.Shape();
	shape.lineTo((x += arrowLength), (y += arrowLength));
	shape.arc(-thikness / Math.SQRT2 / 2, thikness / Math.SQRT2 / 2, thikness / 2, -Math.PI / 4, (Math.PI * 3) / 4, false);
	shape.lineTo((x = -thikness * Math.SQRT2), (y = 0));
	shape.arc(thikness / 2, -thikness / 2, thikness / Math.SQRT2, (Math.PI * 3) / 4, Math.PI + Math.PI / 4, false);
	y -= thikness;

	shape.lineTo((x += arrowLength + thikness / Math.SQRT2), (y -= arrowLength + thikness / Math.SQRT2));
	shape.arc(thikness / Math.SQRT2 / 2, thikness / Math.SQRT2 / 2, thikness / 2, (-Math.PI * 3) / 4, Math.PI / 4, false);
	shape.lineTo((x = 0), (y = -thikness));
	shape.lineTo((x += lineLength), y);

	shape.lineTo((x -= arrowLength), (y -= arrowLength));
	shape.arc(thikness / Math.SQRT2 / 2, -thikness / Math.SQRT2 / 2, thikness / 2, -Math.PI - Math.PI / 4, -Math.PI / 4, false);
	shape.lineTo((x = lineLength + thikness * Math.SQRT2), (y = -thikness));
	shape.arc(-thikness / 2, thikness / 2, thikness / Math.SQRT2, -Math.PI / 4, Math.PI / 4, false);
	y += thikness;

	shape.lineTo((x -= arrowLength + thikness / Math.SQRT2), (y += arrowLength + thikness / Math.SQRT2));
	shape.arc(-thikness / Math.SQRT2 / 2, -thikness / Math.SQRT2 / 2, thikness / 2, Math.PI / 4, Math.PI + Math.PI / 4, false);
	shape.lineTo((x = lineLength), (y = 0));

	return shape;
}

export function twoSideArrowGeometry(thikness: number, length: number, depth: number) {
	const extrudeSettings = { depth: depth, bevelEnabled: false };
	const shape = twoSideArrowShape(thikness, length);
	const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
	geometry.center();
	return geometry;
}
