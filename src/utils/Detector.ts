declare global {
	interface Window { CanvasRenderingContext2D: any; }
	interface Window { WebGLRenderingContext: any; }
	interface Window { Worker: any; }
	interface Window { File: any; }
	interface Window { FileReader: any; }
	interface Window { FileList: any; }
}

window.CanvasRenderingContext2D = window.CanvasRenderingContext2D || null;
window.WebGLRenderingContext = window.WebGLRenderingContext || null;
window.Worker = window.Worker || null;
window.File = window.File || null;
window.FileReader = window.FileReader || null;
window.FileList = window.FileList || null;

export class Detector {

	static webgl: boolean = Detector.isWebGL();
	canvas: boolean = !!window.CanvasRenderingContext2D;
	workers: boolean = !!window.Worker;
	fileapi: boolean = !!(window.File && window.FileReader && window.FileList && window.Blob);

	static isWebGL(): boolean {
		try {
			return !!window.WebGLRenderingContext && !!document.createElement('canvas').getContext('experimental-webgl');
		} catch (e) {
			return false;
		}
	}


	getWebGLErrorMessage() {

		var element = document.createElement('div');
		element.id = 'webgl-error-message';
		element.style.fontFamily = 'monospace';
		element.style.fontSize = '13px';
		element.style.fontWeight = 'normal';
		element.style.textAlign = 'center';
		element.style.background = '#fff';
		element.style.color = '#000';
		element.style.padding = '1.5em';
		element.style.width = '400px';
		element.style.margin = '5em auto 0';

		if (!Detector.webgl) {
			element.innerHTML = window.WebGLRenderingContext ? [
				'Your graphics card does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br />',
				'Find out how to get it <a href="http://get.webgl.org/" style="color:#000">here</a>.'
			].join('\n') : [
				'Your browser does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br/>',
				'Find out how to get it <a href="http://get.webgl.org/" style="color:#000">here</a>.'
			].join('\n');

		}

		return element;

	}

	addGetWebGLMessage(parameters: any) {

		var parent, id, element;

		parameters = parameters || {};

		parent = parameters.parent !== undefined ? parameters.parent : document.body;
		id = parameters.id !== undefined ? parameters.id : 'oldie';

		element = this.getWebGLErrorMessage();
		element.id = id;

		parent.appendChild(element);

	}

}
