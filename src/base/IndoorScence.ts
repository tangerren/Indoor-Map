/**
 * Indoor-Map 场景
 */

import * as THREE from 'three';
// import { OrbitControls } from '../utils/OrbitControl';
import { OrbitControls } from '../THREE/OrbitControls.js';
import { Vector3 } from 'three';
import { ParseGeoJson } from '../GeoJson/ParseGeoJson';
import { DrawGeoJson } from '../GeoJson/DrawGeoJson';

import * as Stats from 'stats.js'
import { Box } from './Box.js';
import { Room } from './Room.js';

export class IndoorScence {

	boxs: Box[];
	private parseGeoJson: ParseGeoJson;
	stats: Stats;

	rootEle: HTMLElement;
	canvasEle: HTMLCanvasElement;
	// theme: any;
	canvasWidth: number;
	canvasWidthHalf: number;
	canvasHeight: number;
	canvasHeightHalf: number;

	scene: THREE.Scene; // 3d地图渲染场景
	renderer: THREE.WebGLRenderer; // 2、3d地图渲染场景渲染器
	camera: THREE.PerspectiveCamera; // 3d地图渲染场景视点相机
	controls: OrbitControls; // 3d 缩放旋转平移控制器 OrbitControls
	rayCaster: THREE.Raycaster;

	sceneChanged: boolean = true; // 场景是否改变
	showNames: boolean = true; // 是否显示房屋名称标注
	isShowPubPoints: boolean = true; // 是否显示公共设施标注
	selectionListener: Function | undefined;
	selectedObj: Room;

	// 初始化场景，相机，灯光
	constructor(rootEle: HTMLElement, canvasEle: HTMLCanvasElement) {
		this.rootEle = rootEle;
		this.canvasEle = canvasEle;
		this.canvasWidth = this.rootEle.clientWidth;
		this.canvasWidthHalf = this.canvasWidth / 2;
		this.canvasHeight = this.rootEle.clientHeight;
		this.canvasHeightHalf = this.canvasHeight / 2;

		// 渲染场景
		this.scene = new THREE.Scene();

		// 渲染器
		this.renderer = new THREE.WebGLRenderer({
			antialias: true,  // 反锯齿
			canvas: this.canvasEle
		});
		this.renderer.autoClear = true;
		this.renderer.setSize(this.rootEle.clientWidth, this.rootEle.clientHeight);
		this.renderer.setClearColor("#F2F2F2");

		// 相机
		this.camera = new THREE.PerspectiveCamera(50, this.canvasWidth / this.canvasHeight, 0.1, 2000);

		// 在屏幕中显示坐标
		var axes = new THREE.AxesHelper(1200);
		this.scene.add(axes);

		// controls 地图平移旋转缩放 操作工具
		this.controls = new OrbitControls(this.camera, this.canvasEle);
		this.controls.enableKeys = true;

		this.controls.addEventListener('change', () => {
			this.renderer.render(this.scene, this.camera);
		});

		// 白色平行光源  左前上方
		var light = new THREE.DirectionalLight(0xffffff);
		light.position.set(-500, 500, -500);
		this.scene.add(light);

		// 白色平行光源  右后上方
		var light = new THREE.DirectionalLight(0xffffff);
		light.position.set(500, 500, 500);
		this.scene.add(light);

		this.stats = new Stats();
		this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
		document.body.appendChild(this.stats.dom);

		this.animate();
	}

	// 定时更新场景
	animate() {
		this.stats.begin();
		requestAnimationFrame(this.animate.bind(this));
		if (this.sceneChanged) {
			this.controls.update();
			this.renderer.clear();
			this.renderer.render(this.scene, this.camera);
			// 更新labels
			if (this.showNames || this.isShowPubPoints) {
				// this.updateLabels();
			}
		}
		this.sceneChanged = false;
		this.stats.end();

	}

	// 加载json文件，并解析为特定格式，然后绘制
	loadData(url: string, callBacks?: Array<Function>) {
		var loader = new THREE.FileLoader();
		loader.load(url, (geoJSON) => {
			this.parseGeoJson = new ParseGeoJson();
			this.boxs = this.parseGeoJson.parse(JSON.parse(geoJSON));
			DrawGeoJson.draw(this.boxs, this);
			this.reDraw();
			if (callBacks) {
				callBacks.forEach(element => {
					element(this.boxs);
				});
			}
		}, (xhr) => {
			console.log((xhr.loaded / xhr.total * 100) + '% loaded');
		}, (err) => {
			console.log(err);
		})
	}

	// 绘制指定楼层
	drawFloor(floor: number) {
		this.reDraw();
		this.clearObj();
		if (floor === 0) {
			DrawGeoJson.draw(this.boxs, this);
			return;
		}
		let floorBoxs: Box[]; floorBoxs = [];
		this.boxs.forEach(ele => {
			if (floor === ele.floor) {
				floorBoxs.push(ele);
			}
		});
		DrawGeoJson.draw(floorBoxs, this, floor === 0 ? false : true);
	}

	// 清空场景中绘制的对象
	clearObj() {
		let lights = [];
		while (this.scene.children.length) {
			if (this.scene.children[0].type === 'DirectionalLight') {
				lights.push(this.scene.children[0]);
			}
			this.scene.remove(this.scene.children[0]);
		}
		lights.forEach(element => {
			this.scene.add(element);
		});
	}

	//set if the objects are selectable  设置场景中的对象是否可以被选中
	setSelectable(selectable: boolean) {
		if (selectable) {
			this.rayCaster = new THREE.Raycaster();
			this.rootEle.addEventListener('mousedown', this.onSelectObject.bind(this), false);
			this.rootEle.addEventListener('touchstart', this.onSelectObject.bind(this), false);
		} else {
			this.rootEle.removeEventListener('mousedown', this.onSelectObject.bind(this), false);
			this.rootEle.removeEventListener('touchstart', this.onSelectObject.bind(this), false);
		}
		return this;
	}

	// 当场景元素设置为“可选”。鼠标点击或者触摸屏点击时执行函数，来处理xxxxxxxxxx选中
	onSelectObject(event: Event) {
		this.reDraw();
		// 查找相交的对象
		event.preventDefault();
		var mouse = new THREE.Vector2();
		if (event.type == "touchstart") {
			mouse.x = ((<TouchEvent>event).touches[0].clientX / this.canvasEle.clientWidth) * 2 - 1;
			mouse.y = -((<TouchEvent>event).touches[0].clientY / this.canvasEle.clientHeight) * 2 + 1;
		} else {
			mouse.x = ((<MouseEvent>event).clientX / this.canvasEle.clientWidth) * 2 - 1;
			mouse.y = -((<MouseEvent>event).clientY / this.canvasEle.clientHeight) * 2 + 1;
		}
		var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
		vector.unproject(this.camera);

		this.rayCaster.set(this.camera.position, vector.sub(this.camera.position).normalize());

		let intersects = this.rayCaster.intersectObjects(this.scene.children);

		// 有可选中的obj
		if (intersects.length > 0) {
			// 选择的元素不是当前选中的obj
			if (this.selectedObj != intersects[0].object) {
				// 恢复为以前的颜色
				if (this.selectedObj) {
					this.selectedObj.material.color.setHex(this.selectedObj.currentHex);
				}
				for (var i = 0; i < intersects.length; i++) {
					this.selectedObj = intersects[i].object as Room;
					if (this.selectedObj.type && this.selectedObj.type == "solidroom") {
						// 存储当前颜色
						this.selectedObj.currentHex = this.selectedObj.material.color.getHex();
						// 设置新的选中颜色
						this.selectedObj.material.color = new THREE.Color("#0CF5F7");
						if (this.selectionListener) {
							this.selectionListener(this.selectedObj.id); //notify the listener
						}
						break;
					} else {
						(this.selectedObj as any) = null;
					}
				}
			}
		} else {
			if (this.selectedObj) {
				this.selectedObj.material.color.setHex(this.selectedObj.currentHex);
			}
			(this.selectedObj as any) = null;
			if (this.selectionListener) {
				this.selectionListener(); //notify the listener
			}
		}
	}

	/**
	 * 标识重新场景改变，出发animate重新绘制
	 */
	reDraw() {
		this.sceneChanged = true;
	}
}