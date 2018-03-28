import { IndoorMap } from "./base/IndoorMapNew";
// import { IndoorMap } from "./base/IndoorMap";

var indoorMap = new IndoorMap({
	dataUrl: 'assets/data/mall.1.json',
	// dataUrl: 'assets/data/testMapData.json',
	selectable: true,
 	mapDiv: ""
});

console.log('start compile !')