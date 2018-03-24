import { Rect } from '../base/Rect';

export class GeomUtil {

	// 获取一系列点的 外包矩形Rect
	static getBoundingRect = function (points: Array<number>) {
		var rect = new Rect();
		//if there are less than 1 point
		if (points.length < 2) {
			return rect;
		}
		let minX: number = 9999999;
		let minY: number = 9999999;
		let maxX: number = -9999999;
		let maxY: number = -9999999;
		for (var i = 0; i < points.length - 1; i += 2) {

			if (points[i] > maxX) {
				maxX = points[i];
			}
			if (points[i] < minX) {
				minX = points[i];
			}
			if (points[i + 1] > maxY) {
				maxY = points[i + 1];
			}
			if (points[i + 1] < minY) {
				minY = points[i + 1];
			}
		}
		rect.tl = [minX, minY];
		rect.br = [maxX, maxY];
		return rect;
	}

}