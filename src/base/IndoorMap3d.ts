/**
 * indoor3D 绘图相关
 */

import * as THREE from 'three';

import { Mall } from "../base/Mall";
import { Label } from "../base/Label";
import { IndoorMapLoader } from "../utils/IndoorMapLoader";
import { IndoorScence } from './IndoorScence'

// import { OrbitControls } from '../utils/OrbitControl';
// import { OrbitControls } from '../THREE/OrbitControls.js';
import { Default3dTheme } from "../theme/Default3dTheme";
import { ParseModel } from "../utils/ParseModel";
import { Rect } from "./Rect";
import { Room } from './Room';


export class IndoorMap3d {
	// rootEle: HTMLElement;
	// canvasEle: HTMLCanvasElement;
	theme: any;
	// canvasWidth: number;
	// canvasWidthHalf: number;
	// canvasHeight: number;
	// canvasHeightHalf: number;

	indoorScence: IndoorScence;

	mall: Mall; // 3d整栋建筑物
	selectedObj: Room; // 被选中的room
	viewChanged: boolean = true; // 场景是否改变
	showNames: boolean = true; // 是否显示房屋名称标注
	isShowPubPoints: boolean = true; // 是否显示公共设施标注
	selectionListener: Function;

	// 初始化场景，相机，灯光
	constructor(indoorScence: IndoorScence) {
		this.indoorScence = indoorScence;

		// this.rootEle = rootEle;
		// this.canvasEle = canvasEle;
		// // 继承自父级
		// this.canvasWidth = this.rootEle.clientWidth;
		// this.canvasWidthHalf = this.canvasWidth / 2;
		// this.canvasHeight = this.rootEle.clientHeight;
		// this.canvasHeightHalf = this.canvasHeight / 2;

		// // 渲染场景
		// this.scene = new THREE.Scene();

		// // 渲染器
		// this.renderer = new THREE.WebGLRenderer({
		// 	antialias: true,  // 反锯齿
		// 	canvas: this.canvasEle
		// });
		// this.renderer.autoClear = true;
		// this.renderer.setSize(this.rootEle.clientWidth, this.rootEle.clientHeight);

		// // 相机
		// this.camera = new THREE.PerspectiveCamera(50, this.canvasWidth / this.canvasHeight, 0.1, 2000);

		// // 在屏幕中显示坐标
		// var axes = new THREE.AxesHelper(1200);
		// this.scene.add(axes);

		// // controls 地图平移旋转缩放 操作工具
		// this.controls = new OrbitControls(this.camera, this.canvasEle);
		// this.controls.enableKeys = true;

		// this.controls.addEventListener('change', () => {
		// 	this.renderer.render(this.scene, this.camera);
		// });


		// // 白色平行光源  左前上方
		// var light = new THREE.DirectionalLight(0xffffff);
		// light.position.set(-500, 500, -500);
		// this.scene.add(light);

		// // 白色平行光源  右后上方
		// var light = new THREE.DirectionalLight(0xffffff);
		// light.position.set(500, 500, 500);
		// this.scene.add(light);

		// this.animate();
	}


	// 定时更新场景
	// animate() {
	// 	requestAnimationFrame(this.animate.bind(this));
	// 	this.controls.update();
	// 	if (this.viewChanged) {
	// 		this.renderer.clear();
	// 		this.renderer.render(this.scene, this.camera);
	// 		// 更新labels
	// 		if (this.showNames || this.isShowPubPoints) {
	// 			this.updateLabels();
	// 		}
	// 	}
	// 	this.viewChanged = false;
	// }

	// 设置主题，重新解析json绘制地图
	setTheme(theme: any) {
		if (this.theme == null) {
			this.theme = theme
		} else if (this.theme != theme) {
			this.theme = theme;
			this.init(this.mall); //parse
		}
		return this;
	}

	// 获取当前主题
	getTheme() {
		return this.theme;
	}

	// 加载json，渲染地图，把Mall加载到this
	load(fileName: string, callback?: Function) {
		var loader = new IndoorMapLoader();
		loader.load(fileName, (mall: Mall) => {
			this.init(mall);
			if (callback) {
				callback();
			}
		});
	}

	// 用mall初始化indoormap，把Mall加载到this
	init(mall: Mall) {
		if (this.theme == null) {
			this.theme = new Default3dTheme();
		}
		this.mall = mall;

		this.indoorScence.scene.add(this.mall);
		this.indoorScence.renderer.setClearColor(this.theme.background);
		this.indoorScence.rootEle.style.background = this.theme.background;

		var initFloor = this.mall.jsonData.data.building.DefaultFloor;
		if (initFloor == 0) {
			this.showAllFloors();
		} else {
			this.showFloor(initFloor);
		}
	}

	//reset the camera to default configuration   重置相机位置、视角、角度
	setDefaultView() {
		var camAngle = this.mall.FrontAngle + Math.PI / 2;
		var camDir = [Math.cos(camAngle), Math.sin(camAngle)];
		var camLen = 500;
		var tiltAngle = 75.0 * Math.PI / 180.0;
		this.indoorScence.camera.position.set(camDir[1] * camLen, Math.sin(tiltAngle) * camLen, camDir[0] * camLen); //TODO: adjust the position automatically
		this.indoorScence.camera.lookAt(this.indoorScence.scene.position);

		// this.controls.reset();
		this.viewChanged = true;
		return this;
	}

	//set top view 设置相机位置(0, 500, 0)
	setTopView() {
		this.indoorScence.camera.position.set(0, 500, 0);
		return this;
	}

	//TODO:adjust camera to fit the building  缩放到视野范围
	adjustCamera() {
		this.setDefaultView();
	}

	// 使用OrbitControls放大
	zoomIn(zoomScale: number) {
		this.indoorScence.controls.dollyIn(zoomScale);
		this.redraw();
	}

	// 使用OrbitControls缩小
	zoomOut(zoomScale: number) {
		this.indoorScence.controls.dollyOut(zoomScale);
		this.redraw();
	}

	// 显示指定id的楼层，重置相机，绘制公共设施和房间名称标注，设置场景重绘
	showFloor(floorid: number) {
		this.mall.showFloor(floorid);
		this.adjustCamera();
		if (this.isShowPubPoints) {
			ParseModel.createPubPointSprites(floorid);
		}
		if (this.showNames) {
			ParseModel.createNameSprites(floorid);
		}
		this.redraw();
	}

	// 显示所有楼层，重置相机，清空公共设施和房间名称标注
	showAllFloors() {
		this.mall.showAllFloors();
		this.adjustCamera();
		this.clearPubPointSprites();
		this.clearNameSprites();
	}

	//set if the objects are selectable  设置场景中的对象是否可以被选中
	setSelectable(selectable: boolean) {
		if (selectable) {
			this.indoorScence.rayCaster = new THREE.Raycaster();
			this.indoorScence.rootEle.addEventListener('mousedown', this.onSelectObject.bind(this), false);
			this.indoorScence.rootEle.addEventListener('touchstart', this.onSelectObject.bind(this), false);
		} else {
			this.indoorScence.rootEle.removeEventListener('mousedown', this.onSelectObject.bind(this), false);
			this.indoorScence.rootEle.removeEventListener('touchstart', this.onSelectObject.bind(this), false);
		}
		return this;
	}

	//set if the user can pan the camera  设置场景是否可以使用平移缩放
	setMovable(movable: boolean) {
		this.indoorScence.controls.enabled = movable;
		return this;
	}

	//show the labels  设置房屋名称标注显示与否
	showAreaNames(show: boolean) {
		this.showNames = show == undefined ? true : show;
		return this;
	}

	//show pubPoints(entries, ATM, escalator...)  设置公共设施标注显示与否
	showPubPoints(show: boolean) {
		this.isShowPubPoints = show == undefined ? true : show;
		return this;
	}

	//get the selected object 返回当前选中的对象的ID
	getSelectedId() {
		return this.selectedObj.id;
	}

	//the callback function when sth is selected  设置选中时执行自定义函数
	setSelectionListener(callback: Function) {
		this.selectionListener = callback;
		return this;
	}

	// 根据id来选中对象（筛选出要被选中的对象）
	selectById(id: number) {
		var floor = this.mall.getCurFloor();
		for (var i = 0; i < floor.children.length; i++) {
			if (floor.children[i].id && floor.children[i].id == id) {
				if (this.selectedObj) {
					this.selectedObj.material.color.setHex(this.selectedObj.currentHex);
				}
				this.select(floor.children[i] as Room);
			}
		}
	}

	// 高亮选中的对象
	select(obj: Room) {
		obj.currentHex = this.selectedObj.material.color.getHex();
		obj.material.color = new THREE.Color(this.theme.selected);
		console.log(obj.id)
	}

	// 当场景元素设置为“可选”。鼠标点击或者触摸屏点击时执行函数，来处理xxxxxxxxxx选中
	onSelectObject(event: Event) {
		// 查找相交的对象
		event.preventDefault();
		var mouse = new THREE.Vector2();
		if (event.type == "touchstart") {
			mouse.x = ((<TouchEvent>event).touches[0].clientX / this.indoorScence.canvasEle.clientWidth) * 2 - 1;
			mouse.y = -((<TouchEvent>event).touches[0].clientY / this.indoorScence.canvasEle.clientHeight) * 2 + 1;
		} else {
			mouse.x = ((<MouseEvent>event).clientX / this.indoorScence.canvasEle.clientWidth) * 2 - 1;
			mouse.y = -((<MouseEvent>event).clientY / this.indoorScence.canvasEle.clientHeight) * 2 + 1;
		}
		var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
		vector.unproject(this.indoorScence.camera);

		this.indoorScence.rayCaster.set(this.indoorScence.camera.position, vector.sub(this.indoorScence.camera.position).normalize());

		let intersects = this.indoorScence.rayCaster.intersectObjects(this.mall.children[0].children);

		if (intersects.length > 0) {
			if (this.selectedObj != intersects[0].object) {
				if (this.selectedObj) {
					this.selectedObj.material.color.setHex(this.selectedObj.currentHex);
				}
				for (var i = 0; i < intersects.length; i++) {
					this.selectedObj = intersects[i].object as Room;
					if (this.selectedObj.type && this.selectedObj.type == "solidroom") {
						this.select(this.selectedObj);
						if (this.selectionListener) {
							this.selectionListener(this.selectedObj.id); //notify the listener
						}
						break;
					} else {
						(this.selectedObj as any) = null;
					}
					if (this.selectedObj == null && this.selectionListener != null) {
						this.selectionListener(-1);
					}
				}
			}
		} else {
			if (this.selectedObj) {
				this.selectedObj.material.color.setHex(this.selectedObj.currentHex);
			}
			(this.selectedObj as any) = null;
			if (this.selectionListener) {
				this.selectionListener(-1); //notify the listener
			}
		}
		this.redraw();
	}

	// 标识场景已被修改，在定时更新中会触发场景重绘
	redraw() {
		// 设置为true，在定时更新中会触发场景重绘
		this.viewChanged = true;
	}

	// 更新商店名称、公共设施
	updateLabels() {
		if (this.mall == null || this.indoorScence.controls == null || !this.viewChanged) {
			return;
		}
		var curFloor = this.mall.getCurFloor();
		if (curFloor == null) {
			return;
		}
		var projectMatrix = null;
		// 更新商店名称
		if (this.showNames) {
			if (curFloor.nameSprites != undefined) {
				// 计算变换矩阵
				projectMatrix = new THREE.Matrix4();
				projectMatrix.multiplyMatrices(this.indoorScence.camera.projectionMatrix, this.indoorScence.camera.matrixWorldInverse);
				ParseModel.updateSprites(curFloor.nameSprites, projectMatrix, [this.indoorScence.canvasWidthHalf, this.indoorScence.canvasHeightHalf]);
			}

		}
		// 更新公共设施
		if (this.isShowPubPoints) {
			if (curFloor.pubPointSprites != undefined) {
				if (!projectMatrix) {
					// 计算变换矩阵
					projectMatrix = new THREE.Matrix4();
					projectMatrix.multiplyMatrices(this.indoorScence.camera.projectionMatrix, this.indoorScence.camera.matrixWorldInverse);
				}
				ParseModel.updateSprites(curFloor.pubPointSprites, projectMatrix, [this.indoorScence.canvasWidthHalf, this.indoorScence.canvasHeightHalf]);
			}
		}
		this.viewChanged = false;
	};

	// 清空房屋名称标注
	clearNameSprites() {
		var curFloor = this.mall.getCurFloor();
		if (curFloor == null) {
			return;
		}
		if (curFloor.nameSprites == null) {
			return;
		}
		curFloor.nameSprites.children.forEach(function (ss: THREE.Object3D) {
			curFloor.nameSprites.remove(ss);
		})
		curFloor.nameSprites.children.length = 0;
	}

	// 清空公共设施标注
	clearPubPointSprites() {
		var curFloor = this.mall.getCurFloor();
		if (curFloor == null) {
			return;
		}
		if (curFloor.pubPointSprites == null) {
			return;
		}
		curFloor.pubPointSprites.children.forEach(function (ss: THREE.Object3D) {
			this.pubPointSprites.remove(ss);
		})
		curFloor.pubPointSprites.children.length = 0;
	}

	// 重新设置地图容器大，渲染器场景适应
	resize(width: number, height: number) {
		this.indoorScence.camera.aspect = width / height;
		this.indoorScence.camera.updateProjectionMatrix();

		this.indoorScence.renderer.setSize(width, height);
		this.viewChanged = true;
	}
}