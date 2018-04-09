/**
 * IndoorMap HTML元素
 */

import { Detector } from '../utils/Detector';
import { DomUtil } from '../utils/DomUtil';
import { IndoorScence } from './IndoorScence'
import { Mall } from './Mall'
import { ImParam } from './ImParam';
import '../assets/css/indoor3D.css'
import { Box } from './Box';

export class IndoorMap {

	indoorScence: IndoorScence;
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

		this.indoorScence = new IndoorScence(this.rootEle, this.canvasEle);
		this.indoorScence.loadData(options.dataUrl, [this.creatFloorEle.bind(this)]);
		this.indoorScence.setSelectable(options.selectable);
	}

	/**
	 * 创建楼层选择元素
	 * @param boxs 当前geojson解析结果
	 */
	creatFloorEle(boxs: Box[]) {
		if (boxs == undefined || boxs.length == 0) {
			console.error('the data has not been loaded yet. please call this function in callback');
			return null;
		}

		this.floorEle = document.createElement('ul');
		this.floorEle.className = 'floors-ele';
		let floors = (boxs[0] as Mall).floors;
		for (let i = 0; i <= floors; i++) {
			let li = document.createElement('li');
			li.innerText = i === 0 ? 'All' : i.toString();
			this.floorEle.appendChild(li);
			li.onclick = (e) => { this.indoorScence.drawFloor(i); this.updateFloorEle(e.target as HTMLElement) }
		}
		this.rootEle.appendChild(this.floorEle);
	}

	/**
	 * 更新楼层选择元素的样式
	 * @param target 当前选中的元素
	 */
	updateFloorEle(target: HTMLElement) {
		let floorsEle = document.getElementsByClassName('floors-ele')[0];
		if (this.rootEle == null) {
			return;
		}

		for (let i = 0; i < floorsEle.children.length; i++) {
			floorsEle.children[i].className = '';
		}

		target.className = 'selected';
	}

	setSelectListen(callback: Function) {
		this.indoorScence.selectionListener = callback;
	}
}