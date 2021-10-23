import { IParams } from 'client';
import * as THREE from 'three'

export function createWall(plateDepth: number): THREE.Group {
    const depth = plateDepth * 1.5;
    const wall = new THREE.Group();

    const down = 10;
    const loader = new THREE.TextureLoader();
    loader.load('img/brick.jpg', function (texture) {
        const wallMesh = new THREE.Mesh(
            new THREE.BoxBufferGeometry(100, 50, 10),
            new THREE.MeshPhongMaterial({
                map: texture,
            })
        );
        wallMesh.position.set(0, 0 - down, -5 - depth);
        wallMesh.name = 'wall';

        wall.add(wallMesh);
    })

    loader.load('img/brick_narrow.jpg', function (texture) {
        const pole1 = new THREE.Mesh(
            new THREE.BoxBufferGeometry(20, 55, 20),
            new THREE.MeshPhongMaterial({
                map: texture,
            })
        );
        pole1.position.set(-50, 2.5 - down, -5 - depth);
        pole1.name = 'pole';

        const pole2 = new THREE.Mesh(
            new THREE.BoxBufferGeometry(20, 55, 20),
            new THREE.MeshPhongMaterial({
                map: texture,
            })
        );
        pole2.position.set(50, 2.5 - down, -5 - depth);
        pole2.name = 'pole';

        wall.add(pole1);
        wall.add(pole2);
    })

    loader.load('img/concrete.jpg', function (texture) {
        const poleUpper1 = new THREE.Mesh(
            new THREE.BoxBufferGeometry(23, 2.5, 23),
            new THREE.MeshPhongMaterial({
                map: texture,
            })
        );
        poleUpper1.position.set(-50, 30 - down, -5 - depth);
        poleUpper1.name = 'wall';

        const cone1 = new THREE.Mesh(
            new THREE.ConeBufferGeometry(16, 5, 4),
            new THREE.MeshPhongMaterial({
                map: texture,
            })
        );
        cone1.rotateY(Math.PI / 4);
        cone1.position.set(-50, 33.75 - down, -5 - depth);
        cone1.name = 'cone';

        const poleUpper2 = new THREE.Mesh(
            new THREE.BoxBufferGeometry(23, 2.5, 23),
            new THREE.MeshPhongMaterial({
                map: texture,
            })
        );
        poleUpper2.position.set(50, 30 - down, -5 - depth);
        poleUpper2.name = 'wall';

        const cone2 = new THREE.Mesh(
            new THREE.ConeBufferGeometry(16, 5, 4),
            new THREE.MeshPhongMaterial({
                map: texture,
            })
        );
        cone2.rotateY(Math.PI / 4);
        cone2.position.set(50, 33.75 - down, -5 - depth);
        cone2.name = 'cone';

        wall.add(poleUpper1);
        wall.add(cone1);
        wall.add(poleUpper2);
        wall.add(cone2);
    })

    return wall;
}