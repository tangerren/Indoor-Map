
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
		if (this.theme == undefined) {
			this.theme = new Default3dTheme();
		}
		this.indoorScence = indoorScence;
		// this.indoorScence.scene.add(this.mall);
		// [{
		// 	Array<vextor2>,
		// 	floor:
		// 	height:
		// }]
		data.forEach(item => {
			// mall+room
			let shape = new THREE.Shape(item.arrVector2);
			// 地板
			let floorShape = new THREE.Shape(data[0].arrVector2);
			let extrudBoxeSettings = {
				amount: item.height, //楼高或房高
				bevelEnabled: false
			};
			let extrudeFloorSettings = {
				amount: 2,//地板高度,
				bevelEnabled: false
			};
			let boxGeometry = new THREE.ExtrudeGeometry(shape, extrudBoxeSettings);
			let floorGeometry = new THREE.ExtrudeGeometry(floorShape, extrudeFloorSettings);

			let boxMaterial;
			let floorMaterial = new THREE.MeshLambertMaterial(this.theme.floor);
			if (item.floor == 0) {
				boxMaterial = new THREE.MeshLambertMaterial(this.theme.building);
			} else {
				boxMaterial = new THREE.MeshLambertMaterial(this.theme.room('100', 102));
			}

			let boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
			let floorMesh = new THREE.Mesh(floorGeometry, boxMaterial);
			if (item.floor != 0) {
				boxMesh.type = 'solidroom';
			}

			boxMesh.position.set(0, 25 * item.floor, 0);
			floorMesh.position.set(0, 25 * item.floor, 0);

			let boxGeometryL = new THREE.Geometry().setFromPoints(item.arrVector2);
			let boxWire = new THREE.Line(boxGeometryL, new THREE.LineBasicMaterial({
				color: "#5C4433",
				opacity: 0.5,
				transparent: true,
				linewidth: 1
			}));
			boxWire.position.set(0, 25 * item.floor, 0);

			boxMesh.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
			floorMesh.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
			boxWire.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);

			this.indoorScence.scene.add(boxWire);
			this.indoorScence.scene.add(boxMesh);
			this.indoorScence.scene.add(floorMesh);
		})

		//reset the camera to default configuration   重置相机位置、视角、角度
		var camAngle = -0.890338608975752 + Math.PI / 2;
		var camDir = [Math.cos(camAngle), Math.sin(camAngle)];
		var camLen = 500;
		var tiltAngle = 75.0 * Math.PI / 180.0;
	}
}