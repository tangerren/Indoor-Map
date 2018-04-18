/**
 * 建筑物属性
 */
export class Properties {
	/**
	 * 建筑物或者房间的中心点
	 */
	center: number[];
	/**
	 * 高度，房间高、楼层高或者建筑物高
	 */
	floorHeight?: number;
	/**
	 * 名称，用于显示label
	 */
	name?: string;
	/**
	 * 建筑物类型，可以是洗手间、超市、商店等
	 */
	type: string;
	/**
	 * 楼层数，第几层
	 */
	floor: number;
	/**
	 * 共几层
	 */
	floors?: number;
	/**
	 * 建筑物的唯一标识ID
	 */
	id: string;
}