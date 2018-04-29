import { System } from '../utils/System'
import { TYPE } from '../GeoJson/type';

export class DefaultTheme {


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

	room(type?: string) {
		let style;

		switch (type) {
			case TYPE[0]:
				// floor
				style = {
					color: "#4274BB",
					opacity: 0.7,
					transparent: true
				};
				break;
			case TYPE[1]:
				// 电梯
				style = {
					color: "#E60045",
					opacity: 0.7,
					transparent: true
				};
				break;
			case TYPE[2]:
				// 专卖店
				style = {
					color: "#A40282",
					opacity: 0.7,
					transparent: true
				};
				break;
			case TYPE[3]:
				// 3C数码
				style = {
					color: "#AA5C40",
					opacity: 0.7,
					transparent: true
				};
				break;
			case TYPE[4]:
				// 服装店
				style = {
					color: "#67C567",
					opacity: 0.7,
					transparent: true
				};
				break;
			case TYPE[5]:
				// 超市
				style = {
					color: "#FF8400",
					opacity: 0.7,
					transparent: true
				};
				break;
			case TYPE[6]:
				// 商场大楼
				style = {
					color: "#8156FA",
					opacity: 0.7,
					transparent: true
				};
				break;
			case TYPE[7]:
				// 洗手间
				style = {
					color: "#FF84C6",
					opacity: 0.7,
					transparent: true
				};
				break;
			default:
				style = {
					color: "#AAAAAA",
					opacity: 0.7,
					transparent: true
				};
				break;
		}
		return style;
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