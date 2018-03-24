import { System } from '../base/System'
import { Theme } from "../base/Theme";

export class Default2dTheme extends Theme {
	constructor() {
		super();
		this.room = super.room;
	}

	name: "test"; //theme's name
	background: "#F2F2F2"; //background color

	//building's style
	building: {
		color: "#000000",
		opacity: 0.1,
		transparent: true,
		depthTest: false
	}

	//floor's style
	floor: {
		color: "#E0E0E0",
		opacity: 1,
		transparent: false
	}

	//selected room's style
	selected: "#ffff55"

	//room wires' style
	strokeStyle: {
		color: "#666666",
		opacity: 0.5,
		transparent: true,
		linewidth: 1
	}

	fontStyle: {
		opacity: 1,
		textAlign: "center",
		textBaseline: "middle",
		color: "#333333",
		fontsize: 13,
		fontface: "'Lantinghei SC', 'Microsoft YaHei', 'Hiragino Sans GB', 'Helvetica Neue', Helvetica, STHeiTi, Arial, sans-serif  "
	}

	pubPointImg = {
		"11001": System.imgPath + "/toilet.png",
		"11002": System.imgPath + "/ATM.png",
		"21001": System.imgPath + "/stair.png",
		"22006": System.imgPath + "/entry.png",
		"21002": System.imgPath + "/escalator.png",
		"21003": System.imgPath + "/lift.png"
	}
}