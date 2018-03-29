

import { GeoJSON } from './GeoJSON';
import { Rect } from '../base/Rect';

import * as THREE from 'three';

export class ParseGeoJson {


	constructor() { }

	parse(json: GeoJSON): Rect[] {
		if (json.type !== 'FeatureCollection') {
			console.error('geojson type字段不符合要求！');
			return [];
		}

		let mallData: Rect[] = [];
		json.features.forEach(element => {
			let tempBox: any;
			tempBox = {};
			tempBox.floor = element.properties.floor;
			tempBox.height = element.properties.height;
			tempBox.center = element.properties.center;			
			tempBox.arrVector2 = [];
			element.geometry.coordinates.forEach((rings: Array<any>) => {
				rings.forEach(point => {
					tempBox.arrVector2.push(new THREE.Vector2(point[0], point[1]));
				});
			});
			mallData.push(tempBox);
		})
		return mallData;
	}

}