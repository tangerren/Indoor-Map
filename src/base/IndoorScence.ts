/**
 * Indoor-Map 场景
 */

import * as THREE from 'three';
// import { OrbitControls } from '../utils/OrbitControl';
import { OrbitControls } from '../THREE/OrbitControls.js';
import { Vector3 } from 'three';


export class IndoorScence {
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

	viewChanged: boolean = true; // 场景是否改变
	showNames: boolean = true; // 是否显示房屋名称标注
	isShowPubPoints: boolean = true; // 是否显示公共设施标注
	selectionListener: Function;

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

		this.animate();
	}

	// 定时更新场景
	animate() {
		requestAnimationFrame(this.animate.bind(this));
		this.controls.update();
		if (this.viewChanged) {
			this.renderer.clear();
			this.renderer.render(this.scene, this.camera);
			// 更新labels
			if (this.showNames || this.isShowPubPoints) {
				// this.updateLabels();
			}
		}
		this.viewChanged = false;
	}
}