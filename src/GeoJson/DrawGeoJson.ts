
import * as THREE from 'three';
import { IndoorScence } from '../base/IndoorScence';

import { Theme } from '../base/Theme';

import { Default3dTheme } from '../theme/Default3dTheme';
import { Default2dTheme } from '../theme/Default2dTheme';
import { Vector3 } from 'three';
import { Rect } from '../base/Rect';

export class DrawGeoJson {

	static indoorScence: IndoorScence;
	static theme: Default3dTheme;

	static draw(data: Rect[], indoorScence: IndoorScence) {
		if (this.theme == undefined) {
			this.theme = new Default3dTheme();
		}
		this.indoorScence = indoorScence;

		let center = data[0].center;
		let baseHeight = 0.2;
		let mallHeight = data[0].height;
		let floorHeight = data[1].height;
		let floorCellHeight = 5;
		let cameraDistance = 150;

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
				amount: baseHeight,//地板高度,
				bevelEnabled: false
			};
			let boxGeometry = new THREE.ExtrudeGeometry(shape, extrudBoxeSettings);
			let floorGeometry = new THREE.ExtrudeGeometry(floorShape, extrudeFloorSettings);

			let boxMaterial;
			let floorMaterial = new THREE.MeshLambertMaterial(this.theme.floor);
			if (item.floor == 0) {
				boxMaterial = new THREE.MeshLambertMaterial(this.theme.building);
			} else {
				// boxMaterial = new THREE.MeshLambertMaterial(this.theme.room('100', 102));
				boxMaterial = new THREE.MeshLambertMaterial({
					color: new THREE.Color(Math.random(), Math.random(), Math.random()),
					opacity: 0.8,
					transparent: true
				});
			}

			let boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
			let floorMesh = new THREE.Mesh(floorGeometry, boxMaterial);
			if (item.floor != 0) {
				boxMesh.type = 'solidroom';
			}

			boxMesh.position.set(0, (floorHeight + floorCellHeight) * item.floor, 0);
			floorMesh.position.set(0, (floorHeight + floorCellHeight) * item.floor, 0);

			let boxGeometryL = new THREE.Geometry().setFromPoints(item.arrVector2);
			let boxWire = new THREE.Line(boxGeometryL, new THREE.LineBasicMaterial({
				color: "#5C4433",
				opacity: 0.5,
				transparent: true,
				linewidth: 1
			}));
			boxWire.position.set(0, (floorHeight + floorCellHeight) * item.floor, 0);

			boxMesh.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
			floorMesh.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
			boxWire.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);

			this.indoorScence.scene.add(boxWire);
			this.indoorScence.scene.add(boxMesh);
			this.indoorScence.scene.add(floorMesh);
		})

		//reset the camera to default configuration   重置相机位置、视角、角度
		this.indoorScence.camera.position.set(center[0] - cameraDistance, 200, -center[1] + cameraDistance);
		this.indoorScence.controls.target = new Vector3(center[0], 20, -center[1]);

	}
}