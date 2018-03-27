import { IndoorMap } from "./base/IndoorMapNew";
// import { IndoorMap } from "./base/IndoorMap";

var indoorMap = new IndoorMap({
	dataUrl: 'assets/data/mall.json',
	// dataUrl: 'assets/data/testMapData.json',
	selectable: true,
 	mapDiv: ""
});

console.log('start compile !')