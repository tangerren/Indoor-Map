

import { GeoJSON } from './GeoJSON';
import { Geometry } from './Geometry';
import { Properties } from './Properties';

import * as THREE from 'three';

export class ParseGeoJson {

	mallData: Array<any>;

	constructor() { }

	parse(json: GeoJSON) {
		if (json.type !== 'FeatureCollection') {
			console.error('geojson type字段不符合要求！');
			return;
		}

		this.mallData = [];
		json.features.forEach(element => {
			let tempBox: any;
			tempBox = {};
			tempBox.floor = element.properties.floor;
			tempBox.height = element.properties.height;
			tempBox.arrVector2 = [];
			element.geometry.coordinates.forEach((rings: Array<any>) => {
				rings.forEach(point => {
					tempBox.arrVector2.push(new THREE.Vector2(point[0], point[1]));
				})
			});
			this.mallData.push(tempBox);
		})
		console.log(this.mallData);
		return this.mallData;
	}

}