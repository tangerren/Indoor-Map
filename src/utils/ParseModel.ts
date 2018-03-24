import * as THREE from 'three'
import { Mall } from '../base/Mall';
import { Floor } from '../base/Floor';
import { Room } from '../base/Room';
import { Label } from "../base/Label";
import { Theme } from '../base/Theme';
import { GeomUtil } from '../utils/GeomUtil';
import { DataParse } from '../utils/DataParse';
import { Default3dTheme } from '../theme/Default3dTheme';
import { Default2dTheme } from '../theme/Default2dTheme';
import { Rect } from '../base/Rect';

//-----------------------------the Parser class 处理JSON，绘制楼层房屋 ---------------------------------------

export class ParseModel {

	static mall: Mall;
	static theme: Default3dTheme;
	static spriteMaterials: any; // 公共设施材质（已经加载了图片）

	static parse(json: any, theme?: Default3dTheme) {
		this.mall = new Mall(json);
		// this.mall.curFloorId = json.data.building.DefaultFloor;

		// 设置主题样式
		if (this.theme == undefined) {
			this.theme = new Default3dTheme();
		}
		let scale = 0.1; // 绘图比例（10倍）

		//floor geometry  绘制每一个层楼和楼层上的房间
		for (let i = 0; i < json.data.Floors.length; i++) {
			let floor = new Floor();
			let floorData = json.data.Floors[i];
			floorData.rect = GeomUtil.getBoundingRect(floorData.Outline[0][0]);
			if (!floorData.High || floorData.High == 0 || floorData.High == undefined) { //if it's 0, set to 50.0
				floorData.High = 5; //如果计算结果是0，默认使用50（floor.High=5）
			}

			// 绘制第 i 层楼Floor
			floor.height = floorData.High / scale;
			// 累加层高
			this.mall.height += floor.height;

			let floorPoints = DataParse.parsePoints(floorData.Outline[0][0]);
			let floorShape = new THREE.Shape(floorPoints);
			let floorGeometry = new THREE.ShapeGeometry(floorShape);
			let floorMesh = new THREE.Mesh(floorGeometry, new THREE.MeshBasicMaterial(this.theme.floor));
			floorMesh.position.set(0, 0, -5); // 地板高度
			floor.add(floorMesh);

			floor.floorId = floorData._id;

			// 绘制第 i 层楼的 第 j 间Room
			for (let j = 0; j < floorData.FuncAreas.length; j++) {

				let roomData = floorData.FuncAreas[j];
				// roomData.rect = GeomUtil.getBoundingRect(roomData.Outline[0][0]);

				let roomPoints = DataParse.parsePoints(roomData.Outline[0][0]);
				let roomShape = new THREE.Shape(roomPoints);

				// 挤一个盒子出来（房间壳子）
				let roomExtrudeSettings = {
					amount: floor.height,
					bevelEnabled: false
				};
				let roomGeometry = new THREE.ExtrudeGeometry(roomShape, roomExtrudeSettings);
				let roomMaterial = new THREE.MeshLambertMaterial(this.theme.room(roomData.Type, roomData.Category));
				let roomMesh = new Room(roomGeometry, roomMaterial);
				roomMesh.type = 'solidroom';
				roomMesh.roomId = roomData._id;
				floor.add(roomMesh);

				// top wireframe 房子顶部的线条

				let roomGeometryL = new THREE.Geometry().setFromPoints(roomPoints);
				let roomWire = new THREE.Line(roomGeometryL, new THREE.LineBasicMaterial(this.theme.strokeStyle));
				roomWire.position.set(0, 0, floor.height);
				floor.add(roomWire);
			}

			this.mall.add(floor);
			this.mall.floors.push(floor);
		}

		// 创建 建筑物整个轮廓
		let buildingData = json.data.building;
		let buildingPoints = DataParse.parsePoints(buildingData.Outline[0][0]);
		this.mall.FrontAngle = buildingData.FrontAngle;

		if (buildingPoints.length > 0) {
			let mallShape = new THREE.Shape(buildingPoints);
			let buildingExtrudeSettings = {
				amount: this.mall.height,
				bevelEnabled: false
			};
			let mallGeometry = new THREE.ExtrudeGeometry(mallShape, buildingExtrudeSettings);
			let buildingMesh = new THREE.Mesh(mallGeometry, new THREE.MeshBasicMaterial(this.theme.building));

			this.mall.building = buildingMesh;
		}

		this.mall.add(this.mall.building)

		// 缩放malll，然后将mall旋转至水平面
		this.mall.scale.set(scale, scale, scale);
		this.mall.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);

		return this.mall;
	}

	// 创建第i层的房屋名称
	static createNameSprites(floorId: number) {
		var funcAreaJson = this.mall.getFloorJson(floorId).FuncAreas;
		for (var i = 0; i < funcAreaJson.length; i++) {
			var sprite = this.makeTextSprite(funcAreaJson[i].Name_en, this.theme.fontStyle);
			sprite.oriX = funcAreaJson[i].Center[0];
			sprite.oriY = funcAreaJson[i].Center[1];
			this.mall.floors[floorId].nameSprites.add(sprite);
		}
		this.mall.add(this.mall.floors[floorId].nameSprites)
	}

	// 创建第i层公共设施标注
	static createPubPointSprites(floorId: number) {
		if (!this.spriteMaterials || !this.spriteMaterials.isLoaded) {
			this.loadSprites();
		}
		var pubPointsJson = this.mall.getFloorJson(floorId).PubPoint;
		var imgWidth, imgHeight;
		for (var i = 0; i < pubPointsJson.length; i++) {
			var spriteMat = this.spriteMaterials[pubPointsJson[i].Type];
			if (spriteMat !== undefined) {
				imgWidth = 30, imgHeight = 30;
				var sprite = new Label(spriteMat);
				sprite.scale.set(imgWidth, imgHeight, 1);
				sprite.oriX = pubPointsJson[i].Outline[0][0][0];
				sprite.oriY = pubPointsJson[i].Outline[0][0][1];
				sprite.width = imgWidth;
				sprite.height = imgHeight;
				this.mall.floors[floorId].pubPointSprites.add(sprite);
			}
		}
	}

	// 加载公共设施图片
	private static loadSprites() {
		let textureLoder = new THREE.TextureLoader()
		if (!this.spriteMaterials || this.spriteMaterials.length == 0) {
			this.spriteMaterials = {};
			var images: any = this.theme.pubPointImg;
			for (var key in images) {
				var texture = textureLoder.load(images[key], undefined);
				var material = new THREE.SpriteMaterial({
					map: texture
				});
				this.spriteMaterials[key] = material;
			}
		}
		this.spriteMaterials.isLoaded = true;
	}

	// update sprites   更新 总是朝向相机位的对象（Sprites） 的位置，遮挡检测
	static updateSprites(spritelist: any, projectMatrix: THREE.Matrix4, WH: Array<number>) {
		for (var i = 0; i < spritelist.children.length; i++) {
			var sprite = spritelist.children[i];
			// oriX是自定义属性（表示中心点）
			var vec = new THREE.Vector3(sprite.oriX * 0.1, 0, -sprite.oriY * 0.1);
			vec.applyMatrix4(projectMatrix); //  ???  新版方法名称 已替换为 applyMatrix4 方法

			var x = Math.round(vec.x * WH[0]);
			// var x = Math.round(vec.x * this.canvasWidthHalf);
			var y = Math.round(vec.y * WH[1]);
			// var y = Math.round(vec.y * this.canvasHeightHalf);
			sprite.position.set(x, y, 1);

			//check collision with the former sprites   冲突、碰撞、遮挡检测
			var visible = true; //当前标签是否可见（没有被遮挡）
			var visibleMargin: number = 5;
			for (var j = 0; j < i; j++) {
				var img = sprite.material.map.image;
				if (!img) { //if img is undefined (the img has not loaded)
					visible = false;
					break;
				}

				var imgWidthHalf1 = sprite.width / 2;
				var imgHeightHalf1 = sprite.height / 2;
				var rect1 = new Rect(sprite.position.x - imgWidthHalf1, sprite.position.y - imgHeightHalf1, sprite.position.x + imgHeightHalf1, sprite.position.y + imgHeightHalf1);

				var sprite2 = spritelist.children[j];
				var sprite2Pos = sprite2.position;
				var imgWidthHalf2 = sprite2.width / 2;
				var imgHeightHalf2 = sprite2.height / 2;
				var rect2 = new Rect(sprite2Pos.x - imgWidthHalf2, sprite2Pos.y - imgHeightHalf2, sprite2Pos.x + imgHeightHalf2, sprite2Pos.y + imgHeightHalf2);

				if (sprite2.visible && rect1.isCollide(rect2)) {
					visible = false;
					break;
				}

				rect1.tl[0] -= visibleMargin;
				rect1.tl[1] -= visibleMargin;
				rect2.tl[0] -= visibleMargin;
				rect2.tl[1] -= visibleMargin;

				if (sprite.visible == false && rect1.isCollide(rect2)) {
					visible = false;
					break;
				}
			}
			sprite.visible = visible;
		}
	}


	private static makeTextSprite(message: string, parameters: any) {
		if (parameters === undefined) parameters = {};
		// 设置字体样式
		var fontface = parameters.hasOwnProperty("fontface") ?
			parameters["fontface"] : "Arial";

		var fontsize = parameters.hasOwnProperty("fontsize") ?
			parameters["fontsize"] : 18;

		var borderThickness = parameters.hasOwnProperty("borderThickness") ?
			parameters["borderThickness"] : 2;

		var borderColor = parameters.hasOwnProperty("borderColor") ?
			parameters["borderColor"] : {
				r: 0,
				g: 0,
				b: 0,
				a: 1.0
			};

		var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
			parameters["backgroundColor"] : {
				r: 255,
				g: 255,
				b: 255,
				a: 1.0
			};

		var fontColor = parameters.hasOwnProperty("color") ?
			parameters["color"] : "#000000";

		//var spriteAlignment = parameters.hasOwnProperty("alignment") ?
		//	parameters["alignment"] : THREE.SpriteAlignment.topLeft;

		var spriteAlignment = new THREE.Vector2(0, 0);

		// 设置字体内容样式
		var canvas = document.createElement('canvas');
		var context: CanvasRenderingContext2D = <CanvasRenderingContext2D>canvas.getContext('2d');
		context.font = "Bold " + fontsize + "px " + fontface;
		// get size data (height depends only on font size)
		var metrics = context.measureText(message);
		// 背景色（源代码被注释掉）
		context.fillStyle = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
		// 字体颜色
		context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";
		// 边框线
		// context.lineWidth = borderThickness;
		// context.strokeRect(borderThickness / 2, borderThickness / 2, metrics.width + borderThickness, fontsize * 1.4 + borderThickness);
		// text color
		context.fillStyle = fontColor;
		// 填充文字Canvas
		context.fillText(message, borderThickness, fontsize + borderThickness);

		// canvas contents will be used for a texture  把Canvas元素作为材质使用
		let texture = new THREE.Texture(canvas);
		texture.needsUpdate = true;

		// 使用包含文字内容的canvas创建一个 SpriteMaterial
		var spriteMaterial = new THREE.SpriteMaterial({
			map: texture
		});
		// 创建一个永远面向相机的面
		var sprite = new Label(spriteMaterial);
		sprite.scale.set(100, 50, 1.0);
		sprite.width = metrics.width;
		sprite.height = fontsize * 1.4;
		return sprite;
	}
}