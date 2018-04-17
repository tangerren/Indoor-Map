
import * as THREE from 'three';
import { IndoorScence } from '../base/IndoorScence';

import { Theme } from '../base/Theme';

import { DefaultTheme } from '../themes/DefaultTheme';
import { Vector3 } from 'three';
import { Box } from '../base/Box';
import { Mall } from '../base/Mall';

export class DrawGeoJson {

	/**
	 * 建筑物高度
	 */
	static mallHeight: number;
	/**
	 * 建筑物中心坐标
	 */
	static mallCenter: number[];
	/**
	 * 楼层高度
	 */
	static floorHeight: number;
	/**
	 * 地板形状
	 */
	static floorShape: THREE.Shape;
	/**
	 * 地板高度
	 */
	static baseHeight: number;
	/**
	 * 房间高度
	 */
	static roomHeight: number;

	/**
	 * 相机距离
	 */
	static cameraDistance: number;

	static indoorScence: IndoorScence;
	static theme: DefaultTheme;

	static draw(data: Box[], indoorScence: IndoorScence, isFloor?: boolean) {
		if (this.theme == undefined) {
			this.theme = new DefaultTheme();
		}
		this.indoorScence = indoorScence;
		if (!isFloor) {
			let mall: Mall;
			mall = data[0] as Mall;
			this.mallCenter = mall.center;
			this.floorHeight = 10;
			this.mallHeight = this.floorHeight * (mall.floors + 1);
			this.roomHeight = 7;
			this.baseHeight = 0.2;
			this.cameraDistance = 150;
			this.floorShape = new THREE.Shape(mall.arrVector2);
			//reset the camera to default configuration   重置相机位置、视角、角度
			this.indoorScence.camera.position.set(this.mallCenter[0] - this.cameraDistance, 200, -this.mallCenter[1] + this.cameraDistance);
			this.indoorScence.controls.target = new Vector3(this.mallCenter[0], 20, -this.mallCenter[1]);
		}

		data.forEach(item => {
			// mall+room
			let shape = new THREE.Shape(item.arrVector2);
			// mall  room
			let extrudMallSettings = {
				amount: item.floor == 0 ? this.mallHeight : this.roomHeight,
				bevelEnabled: false
			};
			// 地板
			let extrudeFloorSettings = {
				amount: this.baseHeight,//地板高度,
				bevelEnabled: false
			};
			let boxGeometry = new THREE.ExtrudeGeometry(shape, extrudMallSettings);
			let floorGeometry = new THREE.ExtrudeGeometry(this.floorShape, extrudeFloorSettings);

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
			let floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);

			if (item.floor != 0) {
				boxMesh.type = 'solidroom';
			}

			boxMesh.position.set(0, this.floorHeight * item.floor, 0);
			floorMesh.position.set(0, this.floorHeight * item.floor, 0);

			let boxGeometryL = new THREE.Geometry().setFromPoints(item.arrVector2);
			let boxWire = new THREE.Line(boxGeometryL, new THREE.LineBasicMaterial({
				color: "#5C4433",
				opacity: 0.5,
				transparent: true,
				linewidth: 1
			}));
			boxWire.position.set(0, this.floorHeight * item.floor + this.roomHeight, 0);

			boxMesh.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
			floorMesh.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
			boxWire.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);

			this.indoorScence.scene.add(boxWire);
			this.indoorScence.scene.add(boxMesh);
			this.indoorScence.scene.add(floorMesh);
		})
 	}
}