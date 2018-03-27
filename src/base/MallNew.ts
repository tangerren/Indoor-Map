import { Floor } from "./Floor";
import { GeoJSON } from "../GeoJson/GeoJSON";
import { DrawGeoJson } from "../GeoJson/DrawGeoJson";
import { ParseGeoJson } from "../GeoJson/ParseGeoJson";
import { IndoorScence } from '../base/IndoorScence';

import * as THREE from "three";

/**
 * 建筑物（集市、商场等），包括多层 [[Floor]]
 */
export class Mall extends THREE.Object3D {

	/**
	 * 初始化建筑物的json数据
	 */
	jsonData: any;
	/**
	 * 建筑物外轮廓，只有在显示左右楼层的情况下在可见
	 */
	building: THREE.Mesh;
	/**
	 * 初始化建筑物包含的楼层
	 */
	floors: Array<Floor> = [];
	/**
	 * 当前选中的楼层ID
	 */
	curFloorId: number = 0;
	/**
	 * 默认视角
	 */
	FrontAngle: number;

	private scence: IndoorScence;
	/**
	 * 初始化建筑物
	 * @param jsonData 建筑物信息JSON
	 */
	constructor(url: string, scence: IndoorScence) {
		super();
		this.loadData(url);
		this.scence = scence;
	}

	private loadData(url: string) {
		var loader = new THREE.FileLoader();
		loader.load(url, (geoJSON) => {
			let parse = new ParseGeoJson();
			this.jsonData = parse.parse(JSON.parse(geoJSON));
			DrawGeoJson.draw(this.jsonData, this.scence);
		}, (xhr) => {
			console.log((xhr.loaded / xhr.total * 100) + '% loaded');
		}, (err) => {
			console.log(err);
		})
	}

	/**
	 * 获取建筑物id，JSON中的 Mall 字段
	 */
	getBuildingId(): number {
		var mallid = this.jsonData.data.building.Mall;
		return mallid ? mallid : -1;
	}

	/**
	 * 获取默认楼层id，json中的 DefaultFloor 字段
	 */
	getDefaultFloorId(): number {
		return this.jsonData.data.building.DefaultFloor;
	}

	/**
	 * 获取当前显示楼层id 
	 */
	getCurFloorId(): number {
		return this.curFloorId;
	}

	/**
	 * 获取建筑物楼层总数
	 */
	getFloorNum(): number {
		return this.jsonData.data.Floors.length;
	}

	/**
	 * 根据楼层层数level，获取第level楼层
	 * @param level 楼层层数，应该大于0并小于楼层总数
	 * @returns 返回对应的的楼层[[Floor]]
	 */
	getFloor(level: number): Floor | null {
		if (level < 1) {
			throw Error("输入的楼层数应该大于0！")
		}
		if (level > this.jsonData.data.Floors.length) {
			throw Error("输入的楼层数超出建筑物总楼层！")
		}
		let floor = null;
		for (var i = 0; i < this.floors.length; i++) {
			if (this.floors[i].floorId == level - 1) {
				floor = this.floors[i];
				break;
			}
		}
		return floor;
	}

	/**
	 * 获取当前正在显示的楼层
	 */
	getCurFloor(): Floor {
		if (this.curFloorId == 0) {
			throw Error("当前没有正在显示的楼层")
		}
		return <Floor>this.getFloor(this.curFloorId);
	}

	/**
	 * 根据楼层数leve，获取第level层楼的JSON信息
	 * @param level  楼层层数，应该大于0并小于楼层总数
	 * @returns 返回对应的的楼层JSON信息
	 */
	getFloorJson(level: number): any {
		if (level < 1) {
			throw Error("输入的楼层数应该大于0！")
		}
		if (level > this.jsonData.data.Floors.length) {
			throw Error("输入的楼层数超出建筑物总楼层！")
		}
		var floorsJson = this.jsonData.data.Floors;
		for (var i = 0; i < floorsJson.length; i++) {
			if (floorsJson[i]._id == level - 1) {
				return floorsJson[i];
			}
		}
	}

	/**
	 * 显示指定id的楼层
	 * @param level 
	 */
	showFloor(level: number): void {
		if (level < 1) {
			throw Error("输入的楼层数应该大于0！")
		}
		if (level > this.jsonData.data.Floors.length) {
			throw Error("输入的楼层数超出建筑物总楼层！")
		}
		this.curFloorId = level;
		// 清空Mall（标注和floor）
		this.children = [];
		for (var i = 0; i < this.floors.length; i++) {
			if (this.floors[i].floorId == level) {
				//显示指定楼层
				this.floors[i].position.set(0, 0, 0);
				this.add(this.floors[i]);
			} else {
				// 移除其他楼层
				this.remove(this.floors[i]);
			}
		}
	}

	/**
	 * 显示所有楼层
	 */
	showAllFloors() {
		this.curFloorId = 0;
		this.add(this.building);
		var offset = 4; // 楼层高度间隔
		for (var i = 0; i < this.floors.length; i++) {
			this.floors[i].position.set(0, 0, i * this.floors[i].height * offset);
			// if (i == 4) {
			//     this.floors[i].position.set(0, -300, i * this.floors[i].height * offset);
			// } else {
			// }
			this.add(this.floors[i]);
		}
		this.building.scale.set(1, 1, offset);
	}
}