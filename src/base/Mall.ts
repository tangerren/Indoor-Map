import * as THREE from "three";

/**
 * 建筑物（集市、商场等），包括多层 [[Floor]]
 */
export class Mall {
	arrVector2: Array<THREE.Vector2>;
	floor: number;
	height: number;
}