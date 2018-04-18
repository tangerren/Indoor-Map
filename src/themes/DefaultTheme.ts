import { System } from '../utils/System'
import { Theme } from "../base/Theme";

export class DefaultTheme extends Theme {
	constructor() {
		super();
		this.room = super.room;
	}
	// 样式名称
	name = "default";

	// 场景背景色
	background = "#F2F2F2";

	// 房间被选中的样式
	selectedColor = "#39FAFA";

	// 建筑物样式
	building = {
		color: "#000000",
		opacity: 0.1,
		transparent: true,
		depthTest: false
	}

	// 楼层样式
	floor = {
		color: "#E0E0E0",
		opacity: 1,
		transparent: false
	}


	// 房间结构线样式
	strokeStyle = {
		color: "#5C4433",
		opacity: 0.5,
		transparent: true,
		linewidth: 1
	}

	// 字体样式
	fontStyle = {
		color: "#231815",
		fontsize: 40,
		fontface: "Helvetica, MicrosoftYaHei "
	}

	// 图标路径
	pubPointImg = {
		"11001": System.imgPath + "/toilet.png",
		"11002": System.imgPath + "/ATM.png",
		"21001": System.imgPath + "/stair.png",
		"22006": System.imgPath + "/entry.png",
		"21002": System.imgPath + "/escalator.png",
		"21003": System.imgPath + "/lift.png"
	}
}