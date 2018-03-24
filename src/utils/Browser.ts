declare global {
	interface Window { opera: any; }
	interface Window { PointerEvent: any; }
	interface Window { L_DISABLE_3D: any; }
	interface Window { L_NO_TOUCH: any; }
	interface Window { WebKitCSSMatrix: any; }
}

window.opera = window.opera || null;
window.PointerEvent = window.PointerEvent || null;
window.L_DISABLE_3D = window.L_DISABLE_3D || null;
window.L_NO_TOUCH = window.L_NO_TOUCH || null;
window.WebKitCSSMatrix = window.WebKitCSSMatrix || null;

let browser;
// 浏览器版本及3d支持检测
(function () {
	var a = "ActiveXObject" in window,
		c = a && !document.addEventListener,
		e = navigator.userAgent.toLowerCase(),
		f = -1 !== e.indexOf("webkit"),
		m = -1 !== e.indexOf("chrome"),
		p = -1 !== e.indexOf("phantom"),
		isAndroid = -1 !== e.indexOf("android"),
		r = -1 !== e.search("android [23]"),
		gecko = -1 !== e.indexOf("gecko"),
		isIphone = -1 !== e.indexOf("iphone"),
		isSymbianOS = -1 !== e.indexOf("symbianos"),
		isWinPhone = -1 !== e.indexOf("windows phone"),
		isIpad = -1 !== e.indexOf("ipad"),
		k = isIphone || isWinPhone || isSymbianOS || isAndroid || isIpad,
		q = window.navigator && window.navigator.msPointerEnabled && window.navigator.msMaxTouchPoints && !window.PointerEvent,
		t = window.PointerEvent && window.navigator.pointerEnabled && window.navigator.maxTouchPoints || q,
		y = "devicePixelRatio" in window && 1 < window.devicePixelRatio || "matchMedia" in window && window.matchMedia("(min-resolution:144dppi)") &&
			window.matchMedia("(min-resolution:144dppi)").matches,
		l = document.documentElement,
		A = a && "transition" in l.style,
		x = "WebKitCSSMatrix" in window && "m11" in new window.WebKitCSSMatrix && !r,
		B = "MozPerspective" in l.style,
		z = "OTransition" in l.style,
		G = !window.L_DISABLE_3D && (A || x || B || z) && !p,
		p = !window.L_NO_TOUCH && !p && function () {
			if (t || "ontouchstart" in l) return !0;
			var a = document.createElement("div"),
				c = !1;
			if (!a.setAttribute) return !1;
			a.setAttribute("ontouchstart", "return;");
			"function" === typeof a.ontouchstart && (c = !0);
			a.removeAttribute("ontouchstart");
			return c
		}();
	browser = {
		ie: a,
		ielt9: c,
		webkit: f,
		gecko: gecko && !f && !window.opera && !a,
		android: isAndroid,
		android23: r,
		iphone: isIphone,
		ipad: isIpad,
		symbian: isSymbianOS,
		winphone: isWinPhone,
		chrome: m,
		ie3d: A,
		webkit3d: x,
		gecko3d: B,
		opera3d: z,
		any3d: G,
		mobile: k,
		mobileWebkit: k && f,
		mobileWebkit3d: k && x,
		mobileOpera: k && window.opera,
		touch: p,
		msPointer: q,
		pointer: t,
		retina: y
	}
}());

export const Browser = browser;