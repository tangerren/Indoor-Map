import { Properties } from './properties'

/**
 * GeoJSON 中的 geometry 属性，包含要素类型、坐标点、属性字段信息
 */
export class Geometry {
	/**
	 * 要素类型（"Point", "MultiPoint", "LineString", "MultiLineString", "Polygon", "MultiPolygon"）
	 */
	type: string;
	/**
	 * 坐标信息（不同类型的要素，坐标点组织方式不同）
	 */
	coordinates: Array<Object>;
	/**
	 * 属性字段信息
	 */
	properties: Properties;
}