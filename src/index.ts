import { IndoorMap } from "./base/IndoorMap";
// import './assets/css/indoor3D.css';

var indoorMap = new IndoorMap({
	data: 'assets/data/testMapData.json',
	selectable: true,
	floorControl: true
});

console.log('start compile !')