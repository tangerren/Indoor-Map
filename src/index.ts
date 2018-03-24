import { IndoorMap } from './base/IndoorMap'
import { IndoorMapLoader } from './utils/IndoorMapLoader'
import { IndoorMap3d } from "./base/IndoorMap3d";
import { Mall } from "./base/Mall";
import './assets/css/indoor3D.css';

/**
 * 初始化three场景及其容器
 */
var indoorMap = new IndoorMap3d({});
indoorMap.load('assets/data/testMapData.json');
indoorMap.setSelectable(true)