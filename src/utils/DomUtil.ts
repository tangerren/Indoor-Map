import { Browser } from './Browser';

export class DomUtil {

	// CSS3 transform 转换结果
	TRANSFORM = this.testProp(["transform", "WebkitTransform", "OTransform", "MozTransform", "msTransform"]);
	// CSS3 transition 变换过程
	TRANSITION = this.testProp(["webkitTransition", "transition", "OTransition", "MozTransition", "msTransition"]);
	TRANSITION_END = "webkitTransition" === this.TRANSITION || "OTransition" === this.TRANSITION ? this.TRANSITION + "End" : "transitionend";

	// 根据 [width,height] 创建根元素
	// TODO:  后续优化为 创建任意指定属性、类型的元素
	static createRootEle(size: Array<number>): HTMLElement {
		let rootEle = document.createElement('div');
		rootEle.style.width = size[0] + 'px';
		rootEle.style.height = size[1] + 'px';
		rootEle.style.top = '0px';
		rootEle.style.left = '0px';
		rootEle.style.position = 'absolute';
		rootEle.style.overflow = "hidden"
		rootEle.id = 'indoor3d';
		document.body.appendChild(rootEle);
		document.body.style.margin = '0';
		return rootEle;
	}

	// 根据 [width,height] 创建根元素
	// TODO:  后续优化为 创建任意指定属性、类型的元素
	static createCanvasEle(pEle: HTMLElement): HTMLCanvasElement {
		let canvasEle = document.createElement('canvas');
		canvasEle.style.width = '100%';
		canvasEle.style.height = '100%';
		pEle.appendChild(canvasEle);

		createLogoEle(pEle);

		return canvasEle;

		function createLogoEle(pEle: HTMLElement): HTMLElement {
			let logoEle = document.createElement('a');
			logoEle.innerText = "三维室内地图";
			logoEle.style.color = "red";
			logoEle.style.width = '100px';
			logoEle.style.height = '20px';
			logoEle.style.bottom = '10px';
			logoEle.style.right = '20px';
			logoEle.style.position = 'absolute';
			pEle.appendChild(logoEle);
			return logoEle;
		}
	}

	// 获取 元素 与 浏览器左侧 的距离
	getElementLeft(element: HTMLElement) {
		var actualLeft = element.offsetLeft;
		var current = <HTMLElement>element.offsetParent;
		while (current !== null) {
			actualLeft += current.offsetLeft;
			current = <HTMLElement>current.offsetParent;
		}
		return actualLeft;
	}

	// 获取 元素 与 浏览器顶部 的距离
	// TODO  类型完善
	getElementTop(element: any) {

		var actualTop = element.offsetTop;
		var current = element.offsetParent;
		while (current !== null) {
			actualTop += current.offsetTop;
			current = current.offsetParent;
		}
		return actualTop;
	}

	// 获取 point 的3d转换描述
	// TODO:  类型完善
	getTranslateString(point: any) {
		var dim = Browser.webkit3d;
		return "translate" + (dim ? "3d" : "") + "(" + point[0] + "px," + point[1] + "px" + ((dim ? ",0" : "") + ")");
		// translate3d(110px,120px,0)
		// translate(110px,120px)
	}

	// 获取元素在浏览器中的位置
	// TODO  类型完善
	getPos(element: any) {
		return element._idm_pos ? element._idm_pos : [this.getElementLeft(element), this.getElementTop(element)];
	}

	// 设置元素在浏览器中的位置
	// TODO  类型完善
	setPos(element: any, point: any) {
		element._idm_pos = point;
		Browser.any3d ? element.style[this.TRANSFORM] = this.getTranslateString(point) : (element.style.left = point[0] + "px", element.style.top = point[1] + "px")
		//element.style.transform = translate3d(110px,120px,0);
		// 或者
		//element.style.left = point[0] + "px";
		//element.style.top = point[1] + "px";
	}

	// 检测 css3 中 TRANSFORM 支持性
	// TODO  类型完善
	testProp(props: any) {
		for (var c = document.documentElement.style, i = 0; i < props.length; i++)
			if (props[i] in c) return props[i];
		return false;
	}

}