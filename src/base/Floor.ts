import * as THREE from 'three';

/**
 * 建筑物楼层
 */
export class Floor extends THREE.Object3D {
	/**
	 * 楼层ID
	 */
	floorId: number;
	/**
	 * 楼层高度
	 */
	height: number;
	/**
	 * 楼层的房屋标注
	 */
	nameSprites: THREE.Object3D;
	/**
	 * 楼层中的公共设施
	 */
	pubPointSprites: THREE.Object3D;
	/**
	 * 初始化Floor
	 */
	constructor() {
		super();
		this.nameSprites = new THREE.Object3D();
		this.pubPointSprites = new THREE.Object3D();
	}
}