/**
 * IndoorMap HTML元素
 */

import { Detector } from '../utils/Detector';
import { DomUtil } from '../utils/DomUtil';
import { IndoorScence } from './IndoorScenceNew'
import { Mall } from './MallNew'
import { ImParam } from './ImParam';
import '../assets/css/indoor3D.css'

export class IndoorMap {

	/**
	 * indoorMap的DOM根元素
	 */
	private rootEle: HTMLElement;

	/**
	 * 绘制内容的Canvas元素
	 */
	private canvasEle: HTMLCanvasElement;

	/**
	 *  楼层选择器 DOM 元素
	 */
	private floorEle: HTMLElement;

	/**
	 * 当前选中的楼层选择器 DOM 元素
	 */
	private floorSelectedEle: HTMLElement;


	private mall: Mall;
	/**
	 * 初始化IndoorMap
	 * @param options IndoorMap初始化参数
	 */
	constructor(options: ImParam) {
		if (!Detector.webgl) {
			console.error("浏览器不支持WebGL 3D");
			return;
		}
		console.info("浏览器支持WebGL 3D");

		// 解析参数，创建绘制容器div
		if (options.mapDiv != '') {
			// 指定了绘制容器DOM 的 id
			this.rootEle = <HTMLElement>document.getElementById(options.mapDiv);
			this.rootEle.style.background = "#F2F2F2";
		} else {
			this.rootEle = DomUtil.createRootEle([window.innerWidth, window.innerHeight]);
		}

		this.canvasEle = DomUtil.createCanvasEle(this.rootEle);

		let indoorScence = new IndoorScence(this.rootEle, this.canvasEle);
		this.mall = new Mall(options.dataUrl, indoorScence);
	}

}