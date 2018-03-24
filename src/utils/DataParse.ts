import * as THREE from 'three';

export class DataParse {
	//  把json中的坐标数组转换为 THREE.Vector2
	static parsePoints(pointArray: Array<number>): Array<THREE.Vector2> {

		let shapePoints: Array<THREE.Vector2> = [];
		for (var i = 0; i < pointArray.length; i += 2) {
			var point = new THREE.Vector2(pointArray[i], pointArray[i + 1]);
			if (i > 0) {
				var lastpoint = shapePoints[shapePoints.length - 1];
				// 去除重复点
				if (point.x != lastpoint.x || point.y != lastpoint.y) {
					shapePoints.push(point);
				}
			} else {
				shapePoints.push(point);
			}
		}
		return shapePoints;
	}
}