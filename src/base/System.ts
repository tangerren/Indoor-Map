export class System {
	// "http://localhost:8080/index.js"
	scriptPath: string = document.scripts[document.scripts.length - 1].src;
	// "http://localhost:8080"
	static sysPath: string = document.scripts[document.scripts.length - 1].src.substring(0, document.scripts[document.scripts.length - 1].src.lastIndexOf("/"));
	// "http://localhost:8080"/assets/img"
	static imgPath: string = System.sysPath + "/assets/img";

	constructor(path: string) {
		System.sysPath = path
		System.imgPath = path + "/img";
	}
}