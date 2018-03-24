import * as THREE from 'three'

export class Room extends THREE.Mesh {
	roomId: number;
	roomType: string;
	currentHex: number;
	material: THREE.MeshLambertMaterial;
	constructor(geom: THREE.ExtrudeGeometry, material: THREE.MeshLambertMaterial) {
		super(geom, material);
	}
}
