import * as THREE from 'three'
import { Mall } from "../base/Mall";
import { ParseModel } from './ParseModel';

export class IndoorMapLoader extends THREE.Loader {

	constructor() {
		super();
		THREE.Loader.call(this);
	}

	load(url: string, callback: Function, callbackProgress?: Function) {
		let self = this;
		let length: Number = 0; // 加载进度
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (xhr.readyState === xhr.DONE) {
				// 处理加载结束
				if (xhr.status === 200 || xhr.status === 0) {
					if (xhr.responseText) {
						let json = JSON.parse(xhr.responseText);
						// 用请求到的json创建Mall，把Mall传给回调函数
						callback(ParseModel.parse(json));
					} else {
						console.error('IndoorMapLoader: "' + url + '" seems to be unreachable or the file is empty.');
					}
				} else {
					console.error('IndoorMapLoader: Couldn\'t load "' + url + '" (' + xhr.status + ')');
				}
			} else if (xhr.readyState === xhr.LOADING) {
				// 处理加载进度
				if (callbackProgress) {
					if (length === 0) {
						length = +(xhr.getResponseHeader('Content-Length') + '');
					}
					callbackProgress({
						total: length,
						loaded: xhr.responseText.length
					});
				}
			} else if (xhr.readyState === xhr.HEADERS_RECEIVED) {
				if (callbackProgress !== undefined) {
					length = +(xhr.getResponseHeader('Content-Length') + '');
				}
			}
		};
		xhr.open('GET', url, true);
		xhr.withCredentials = false;
		xhr.send(null);
	}
}

