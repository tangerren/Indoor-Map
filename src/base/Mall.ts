import * as THREE from "three";
import { Box } from './Box'
/**
 * 建筑物（集市、商场等），包括多层 [[Floor]]
 */
export interface Mall extends Box {
	arrVector2: Array<THREE.Vector2>;
	floor: number;
	floors: number;
	center: Array<number>;
} 