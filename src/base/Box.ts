/**
 * Box 代表场景中绘制的所有立方体盒子
 */

export interface Box {
	type: string; // 地板 、楼层 Floor、房间 Room
	id: string;
	floor: number;
	floors?: number;
	floorHeight?: number;
	center: Array<number>;
	roomType?: string;
	currentHex: number;
	arrVector2: Array<THREE.Vector2>;
}