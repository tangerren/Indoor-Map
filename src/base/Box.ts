export interface Box {
	arrVector2: Array<THREE.Vector2>;
	floor: number;
	center: Array<number>;
	type: string; // 地板 、楼层 Floor、房间 Room
}