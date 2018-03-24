import * as THREE from 'three'

/**
 * 对象标注
 */
export class Label extends THREE.Sprite {
	/**
	 * 中心点X坐标
	 */
	oriX: number;
	/**
	* 中心点Y坐标
	*/
	oriY: number;
	/**
 	* 宽度
 	*/
	width: number;
	/**
 	* 高度
 	*/
	height: number;
	/**
	 * 创建对象标注
	 * @param spriteMaterial 标注的材质
	 */
	constructor(spriteMaterial: THREE.SpriteMaterial) {
		super(spriteMaterial);
	}
}