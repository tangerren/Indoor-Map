
import * as THREE from 'three';
import { IndoorScence } from '../base/IndoorScence';

import { Theme } from '../base/Theme';

import { Default3dTheme } from '../theme/Default3dTheme';
import { Default2dTheme } from '../theme/Default2dTheme';
import { Vector3 } from 'three';

export class DrawGeoJson {

	static indoorScence: IndoorScence;
	static theme: Default3dTheme;

	static draw(data: Array<any>, indoorScence: IndoorScence) {
		this.indoorScence = indoorScence;
		// this.indoorScence.scene.add(this.mall);
		// [{
		// 	Array<vextor2>,
		// 	floor:
		// 	height:
		// }]
		data.forEach(item => {
			let shape = new THREE.Shape(item.arrVector2);
			let geometry = new THREE.ShapeGeometry(shape);
			let floorMesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
				color: "#D3D3D3",
				opacity: 0.7,
				transparent: true
			}));

			let extrudeSettings = {
				amount: item.height,
				bevelEnabled: false
			};
			let roomGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
			let roomMaterial = new THREE.MeshLambertMaterial({
				color: "#1f77b4",
				opacity: 0.7,
				transparent: true
			});
			let roomMesh = new THREE.Mesh(roomGeometry, roomMaterial);
			roomMesh.type = 'solidroom';

			let roomGeometryL = new THREE.Geometry().setFromPoints(item.arrVector2);
			let roomWire = new THREE.Line(roomGeometryL, new THREE.LineBasicMaterial({
				color: "#5C4433",
				opacity: 0.5,
				transparent: true,
				linewidth: 1
			}));
			roomWire.position.set(0, 0, 0);
			// if (item.floor == 0) {
			// } else {
			floorMesh.position.set(0, 0, 5 * item.floor); // 地板高度
			// }
			roomWire.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
			floorMesh.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
			roomMesh.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);

			this.indoorScence.scene.add(floorMesh);
			this.indoorScence.scene.add(roomWire);
			this.indoorScence.scene.add(roomMesh);
		})

		//reset the camera to default configuration   重置相机位置、视角、角度
		var camAngle = -0.890338608975752 + Math.PI / 2;
		var camDir = [Math.cos(camAngle), Math.sin(camAngle)];
		var camLen = 500;
		var tiltAngle = 75.0 * Math.PI / 180.0;
	}
}