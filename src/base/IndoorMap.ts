/**
 * indoor3D DOM相关
 */

import { Detector } from '../utils/Detector';
import { DomUtil } from '../utils/DomUtil';
import { IndoorMap3d } from './IndoorMap3d'

export class IndoorMap {

	/**
	 * indoorMap的DOM根元素
	 */
	rootEle: HTMLElement;

	/**
	 * 绘制内容的Canvas元素
	 */
	canvasEle: HTMLCanvasElement;

	/**
	 *  楼层选择器 DOM 元素
	 */
	floorEle: HTMLElement;

	/**
	 * 当前选中的楼层选择器 DOM 元素
	 */
	floorSelectedEle: HTMLElement;

	/**
	 * @param options IndoorMap初始化参数
	 */
	constructor(options: any) {
		// 根据传浏览器支持webgl的结果来确定是否绘制
		if (!Detector.webgl) {
			console.error("浏览器不支持WebGL 3D");
			return;
		}
		console.info("浏览器支持WebGL 3D");

		// 解析参数，创建绘制容器div
		if (options != undefined) {
			// 如果指定了绘制容器DOM 的 id
			if (options.hasOwnProperty('mapDiv')) {
				this.rootEle = <HTMLElement>document.getElementById(options.mapDiv);
			} else if (options.hasOwnProperty('size') && options.size.length == 2) {
				// 如果没有指定绘制容器DOM，但是制定了绘制区域的范围大小
				this.rootEle = DomUtil.createRootEle(options.size);
			} else {
				// 如果二者都没有指定，则在body追加div，全屏绘制显示
				this.rootEle = DomUtil.createRootEle([window.innerWidth, window.innerHeight]);
			}
		} else {
			console.log('传入data参数！！！')
			return;
		}

		this.canvasEle = DomUtil.createCanvasEle(this.rootEle);
		// TODO  初始化 logo，追加到rootEle右下角
		DomUtil.createLogoEle(this.rootEle);

		let indoor3d = new IndoorMap3d(this.rootEle, this.canvasEle);
		indoor3d.load(options.data);
		if (options.hasOwnProperty('selectable')) {
			indoor3d.setSelectable(options.selectable);
		}
		if (options.hasOwnProperty('floorControl') && options.floorControl == true) {
			this.createFloorEle(indoor3d);
		}
	}

	// 设置选中的楼层选择器的样式
	updateFloorEle(indoorMap: IndoorMap3d) {
		if (this.rootEle == null) {
			return;
		}
		var ulChildren = this.rootEle.children;
		if (ulChildren.length == 0) {
			return;
		}
		if (this.floorSelectedEle != null) {
			this.floorSelectedEle.className = '';
		}
		let curid = indoorMap.mall.getCurFloorId();
		if (curid == 0) {
			this.floorSelectedEle = <HTMLElement>this.rootEle.children[0];
		} else {
			for (let i = 0; i < ulChildren.length; i++) {
				if ((<HTMLElement>ulChildren[i]).innerText == indoorMap.mall.getCurFloorId().toString()) {
					this.floorSelectedEle = <HTMLElement>ulChildren[i];
				}
			}
		}
		if (this.floorSelectedEle != null) {
			this.floorSelectedEle.className = 'selected';
		}
	}

	getMapDiv() {
		return this.rootEle;
	}

	getFloorEle(): HTMLElement {
		return this.floorEle;
	}

	// 创建楼层选择器DOM元素
	createFloorEle(indoorMap: IndoorMap3d) {
		if (indoorMap == undefined || indoorMap.mall == null) {
			console.error('the data has not been loaded yet. please call this function in callback');
			return null;
		}
		//create the ul list
		this.floorEle = document.createElement('ul');
		this.floorEle.className = 'floorsUI';

		var li = document.createElement('li');
		li.innerText = "All";
		this.floorEle.appendChild(li);
		li.onclick = () => (
			indoorMap.showAllFloors()
		)

		var floors = indoorMap.mall.jsonData.data.Floors;
		let self = this;
		for (var i = 0; i < floors.length; i++) {
			(function (arg) {
				li = document.createElement('li');
				li.innerText = floors[arg].Name;
				self.floorEle.appendChild(li);
				li.onclick = function () {
					indoorMap.showFloor(floors[arg]._id)
				}
			})(i);
		}
		this.rootEle.appendChild(this.floorEle);
	}
}