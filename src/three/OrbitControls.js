import * as THREE from 'three';

/**
 * OrbitControls for mouse and keyboard controls.
 * Changes to turn it into a three.js module for bundling.
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 * @author danrossi / https://www.electroteque.org
 */

// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one finger move
//    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
//    Pan - right mouse, or arrow keys / touch: three finter swipe


const EPS = 0.000001,
  STATE = {
    NONE: -1,
    ROTATE: 0,
    DOLLY: 1,
    PAN: 2,
    TOUCH_ROTATE: 3,
    TOUCH_DOLLY: 4,
    TOUCH_PAN: 5
  };

class OrbitControls extends THREE.EventDispatcher {
  constructor(object, domElement) {

    super();

    this.object = object,
      this.domElement = (domElement !== undefined) ? domElement : document,
      // Set to false to disable this control
      this.enabled = true;
    // "target" sets the location of focus, where the object orbits around
    this.target = new THREE.Vector3(),
      // How far you can dolly in and out ( PerspectiveCamera only )
      this.minDistance = 0,
      this.maxDistance = Infinity,
      // How far you can zoom in and out ( OrthographicCamera only )
      this.minZoom = 0,
      this.maxZoom = Infinity,
      // How far you can orbit vertically, upper and lower limits.
      // Range is 0 to Math.PI radians.
      this.minPolarAngle = 0, // radians
      this.maxPolarAngle = Math.PI, // radians
      // How far you can orbit horizontally, upper and lower limits.
      // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
      this.minAzimuthAngle = -Infinity, // radians
      this.maxAzimuthAngle = Infinity, // radians
      // Set to true to enable damping (inertia)
      // If damping is enabled, you must call controls.update() in your animation loop
      this.enableDamping = false,
      this.dampingFactor = 0.25,
      //the damping factor for key controls. This needs a more smoother response.
      this.keyDampingFactor = 0.10,
      // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
      // Set to false to disable zooming
      this.enableZoom = true,
      this.zoomSpeed = 1.0,
      // Set to false to disable rotating
      this.enableRotate = true,
      this.rotateSpeed = 1.0,

      // Set to false to disable panning
      this.enablePan = true,
      this.keyPanSpeed = 7.0, // pixels moved per arrow key push

      // Set to true to automatically rotate around the target
      // If auto-rotate is enabled, you must call controls.update() in your animation loop
      //this.autoRotate = false,
      //this.autoRotateSpeed = 2.0, // 30 seconds per round when fps is 60

      // Set to false to disable use of the keys
      this.enableKeys = true,

      // The four arrow keys
      this.keys = {
        left: 37,
        up: 38,
        right: 39,
        bottom: 40
      },

      // Mouse buttons
      this.mouseButtons = {
        ORBIT: THREE.MOUSE.LEFT,
        ZOOM: THREE.MOUSE.MIDDLE,
        PAN: THREE.MOUSE.RIGHT
      },

      // for reset
      this.target0 = this.target.clone(),
      this.position0 = this.object.position.clone(),
      this.zoom0 = this.object.zoom,
      this.state = STATE.NONE,
      // current position in spherical coordinates
      this.spherical = new THREE.Spherical(),
      this.sphericalDelta = new THREE.Spherical(),

      this.scale = 1,
      this.panOffset = new THREE.Vector3(),
      this.zoomChanged = false,

      this.rotateStart = new THREE.Vector2(),
      this.rotateEnd = new THREE.Vector2(),
      this.rotateDelta = new THREE.Vector2(),

      this.panStart = new THREE.Vector2(),
      this.panEnd = new THREE.Vector2(),
      this.panDelta = new THREE.Vector2(),

      this.dollyStart = new THREE.Vector2(),
      this.dollyEnd = new THREE.Vector2(),
      this.dollyDelta = new THREE.Vector2();

    this.connect();

    // force an update at start
    this.update();
  }

  getPolarAngle() {
    return this.spherical.phi;
  }

  getAzimuthalAngle() {
    return this.spherical.theta;
  }


  getAutoRotationAngle() {
    return 2 * Math.PI / 60 / 60 * this.autoRotateSpeed;
  }

  getZoomScale() {
    return Math.pow(0.95, this.zoomSpeed);
  }

  rotateLeft(angle) {
    this.sphericalDelta.theta -= angle;
  }

  rotateUp(angle) {
    this.sphericalDelta.phi -= angle;
  }

  panLeft(distance, objectMatrix) {

    const v = new THREE.Vector3();

    v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
    v.multiplyScalar(-distance);

    this.panOffset.add(v);
  }

  panUp(distance, objectMatrix) {

    const v = new THREE.Vector3();

    v.setFromMatrixColumn(objectMatrix, 1); // get Y column of objectMatrix
    v.multiplyScalar(distance);

    this.panOffset.add(v);
  }

  // deltaX and deltaY are in pixels; right and down are positive
  pan(deltaX, deltaY) {

    const offset = new THREE.Vector3();

    const element = this.domElement === document ? this.domElement.body : this.domElement;

    if (this.object instanceof THREE.PerspectiveCamera) {

      // perspective
      const position = this.object.position;
      offset.copy(position).sub(this.target);
      let targetDistance = offset.length();

      // half of the fov is center to top of screen
      targetDistance *= Math.tan((this.object.fov / 2) * Math.PI / 180.0);

      // we actually don't use screenWidth, since perspective camera is fixed to screen height
      this.panLeft(2 * deltaX * targetDistance / element.clientHeight, this.object.matrix);
      this.panUp(2 * deltaY * targetDistance / element.clientHeight, this.object.matrix);

    } else if (this.object instanceof THREE.OrthographicCamera) {

      // orthographic
      this.panLeft(deltaX * (this.object.right - this.object.left) / this.object.zoom / element.clientWidth, this.object.matrix);
      this.panUp(deltaY * (this.object.top - this.object.bottom) / this.object.zoom / element.clientHeight, this.object.matrix);

    } else {

      // camera neither orthographic nor perspective
      //console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.' );
      this.enablePan = false;

    }


  }

  dollyIn(dollyScale) {

    if (this.object instanceof THREE.PerspectiveCamera) {

      this.scale /= dollyScale;

    } else if (this.object instanceof THREE.OrthographicCamera) {

      this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom * dollyScale));
      this.object.updateProjectionMatrix();
      this.zoomChanged = true;

    } else {

      //console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
      this.enableZoom = false;

    }

  }

  dollyOut(dollyScale) {

    if (this.object instanceof THREE.PerspectiveCamera) {

      this.scale *= dollyScale;

    } else if (this.object instanceof THREE.OrthographicCamera) {

      this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / dollyScale));
      this.object.updateProjectionMatrix();
      this.zoomChanged = true;

    } else {

      //console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
      this.enableZoom = false;

    }

  }


  /**
   * Vertical auto rotation
   * @param speed
   */
  rotateVertical(speed) {
    this.rotateUp(THREE.Math.degToRad(speed));
    this.update();
  }

  /**
   * Horizontal audo rotation
   * @param speed
   */
  rotateHorizontal(speed) {
    this.rotateLeft(THREE.Math.degToRad(speed));
    this.update();
  }

  setKeyDampingFactor() {
    this.dampingFactor = this.keyDampingFactor;
  }


  /**
   * Rotate left api
   */
  moveLeft() {
    this.setKeyDampingFactor();
    this.rotateHorizontal(this.rotateSpeed);
  }

  /**
   * Rotate right api
   */
  moveRight() {
    this.setKeyDampingFactor();
    this.rotateHorizontal(-this.rotateSpeed);
  }

  /**
   * Rotate down api
   */
  moveDown() {
    this.setKeyDampingFactor();
    this.rotateVertical(-this.rotateSpeed);
  }

  /**
   * Rotate up api
   */
  moveUp() {
    this.setKeyDampingFactor();
    this.rotateVertical(this.rotateSpeed);
  }




  /**
   * Keyboard controls with auto rotation
   * @param event
   */
  handleKeyDown(event) {

    //for video textures we want to rotate not pan


    switch (event.keyCode) {

      case this.keys.up:
        this.moveUp();
        break;

      case this.keys.bottom:
        this.moveDown();
        break;

      case this.keys.left:
        this.moveLeft();
        break;

      case this.keys.right:
        this.moveRight();
        break;

    }
  }


  handleTouchStartRotate(event) {
    //console.log( 'handleTouchStartRotate' );
    this.rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
  }

  handleTouchStartDolly(event) {
    //console.log( 'handleTouchStartDolly' );
    const dx = event.touches[0].pageX - event.touches[1].pageX,
      dy = event.touches[0].pageY - event.touches[1].pageY,
      distance = Math.sqrt(dx * dx + dy * dy);

    this.dollyStart.set(0, distance);
  }

  handleTouchStartPan(event) {
    //console.log( 'handleTouchStartPan' );
    this.panStart.set(event.touches[0].pageX, event.touches[0].pageY);

  }

  handleTouchMoveRotate(event) {
    //console.log( 'handleTouchMoveRotate' );
    this.rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
    this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);

    const element = this.domElement === document ? this.domElement.body : this.domElement;

    // rotating across whole screen goes 360 degrees around
    this.rotateLeft(2 * Math.PI * this.rotateDelta.x / element.clientWidth * this.rotateSpeed);

    // rotating up and down along whole screen attempts to go 360, but limited to 180
    this.rotateUp(2 * Math.PI * this.rotateDelta.y / element.clientHeight * this.rotateSpeed);

    this.rotateStart.copy(this.rotateEnd);

    this.update();
  }

  handleTouchMoveDolly(event) {

    //console.log( 'handleTouchMoveDolly' );

    const dx = event.touches[0].pageX - event.touches[1].pageX,
      dy = event.touches[0].pageY - event.touches[1].pageY,
      distance = Math.sqrt(dx * dx + dy * dy);

    this.dollyEnd.set(0, distance);

    this.dollyDelta.subVectors(this.dollyEnd, this.dollyStart);

    if (this.dollyDelta.y > 0) {

      this.dollyOut(this.getZoomScale());

    } else if (this.dollyDelta.y < 0) {

      this.dollyIn(this.getZoomScale());

    }

    this.dollyStart.copy(this.dollyEnd);

    this.update();

  }

  handleTouchMovePan(event) {

    //console.log( 'handleTouchMovePan' );

    this.panEnd.set(event.touches[0].pageX, event.touches[0].pageY);

    this.panDelta.subVectors(this.panEnd, this.panStart);

    this.pan(this.panDelta.x, this.panDelta.y);

    this.panStart.copy(this.panEnd);

    this.update();
  }

  handleTouchEnd(event) {

    //console.log( 'handleTouchEnd' );

  }


  onTouchStart(event) {

    if (this.enabled === false) return;

    switch (event.touches.length) {

      case 1: // one-fingered touch: rotate

        if (this.enableRotate === false) return;

        this.handleTouchStartRotate(event);

        this.state = STATE.TOUCH_ROTATE;

        break;

      case 2: // two-fingered touch: dolly

        if (this.enableZoom === false) return;

        this.handleTouchStartDolly(event);

        this.state = STATE.TOUCH_DOLLY;

        break;

      case 3: // three-fingered touch: pan

        if (this.enablePan === false) return;

        this.handleTouchStartPan(event);

        this.state = STATE.TOUCH_PAN;

        break;

      default:

        this.state = STATE.NONE;

    }

    if (this.state !== STATE.NONE) {

      const onTouchMoveCheck = () => {
        this.domElement.removeEventListener('touchmove', onTouchMoveCheck);
        this.dispatchStart();
      };

      this.domElement.addEventListener('touchmove', onTouchMoveCheck);
    }

  }

  onTouchMove(event) {

    if (this.enabled === false) return;

    event.preventDefault();
    event.stopPropagation();

    switch (event.touches.length) {

      case 1: // one-fingered touch: rotate

        if (this.enableRotate === false) return;
        //if ( this.state !== STATE.TOUCH_ROTATE ) return; // is this needed?...


        //console.log("HANDLE ROTATE");

        this.handleTouchMoveRotate(event);

        break;

      case 2: // two-fingered touch: dolly

        //console.log("HANDLE DOLLY");

        if (this.enableZoom === false) return;
        //if ( this.state !== STATE.TOUCH_DOLLY ) return; // is this needed?...

        this.handleTouchMoveDolly(event);

        break;

      case 3: // three-fingered touch: pan

        if (this.enablePan === false) return;
        //if ( this.state !== STATE.TOUCH_PAN ) return; // is this needed?...

        this.handleTouchMovePan(event);

        break;

      default:

        this.state = STATE.NONE;

    }

  }

  onTouchEnd(event) {

    if (this.enabled === false) return;

    this.handleTouchEnd(event);

    this.dispatchEnd();

    this.state = STATE.NONE;

  }


  handleMouseDownRotate(event) {

    //console.log( 'handleMouseDownRotate' );

    this.rotateStart.set(event.clientX, event.clientY);

  }

  handleMouseDownDolly(event) {

    //console.log( 'handleMouseDownDolly' );

    this.dollyStart.set(event.clientX, event.clientY);

  }

  handleMouseDownPan(event) {

    //console.log( 'handleMouseDownPan' );

    this.panStart.set(event.clientX, event.clientY);
  }

  handleMouseMoveRotate(event) {

    //console.log( 'handleMouseMoveRotate' );

    this.rotateEnd.set(event.clientX, event.clientY);
    this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);

    //const element = this.domElement === document ? this.domElement.body : this.domElement;

    //use the mouse target not the renderer element.
    const element = this.domElement === document ? this.domElement.body : event.target;

    // rotating across whole screen goes 360 degrees around
    this.rotateLeft(2 * Math.PI * this.rotateDelta.x / element.clientWidth * this.rotateSpeed);

    // rotating up and down along whole screen attempts to go 360, but limited to 180
    this.rotateUp(2 * Math.PI * this.rotateDelta.y / element.clientHeight * this.rotateSpeed);

    this.rotateStart.copy(this.rotateEnd);

    this.update();

  }

  handleMouseMoveDolly(event) {

    //console.log( 'handleMouseMoveDolly' );

    this.dollyEnd.set(event.clientX, event.clientY);

    this.dollyDelta.subVectors(this.dollyEnd, this.dollyStart);

    if (this.dollyDelta.y > 0) {

      this.dollyIn(this.getZoomScale());

    } else if (this.dollyDelta.y < 0) {

      this.dollyOut(this.getZoomScale());

    }

    this.dollyStart.copy(this.dollyEnd);

    this.update();

  }

  handleMouseMovePan(event) {

    //console.log( 'handleMouseMovePan' );

    this.panEnd.set(event.clientX, event.clientY);

    this.panDelta.subVectors(this.panEnd, this.panStart);

    this.pan(this.panDelta.x, this.panDelta.y);

    this.panStart.copy(this.panEnd);

    this.update();

  }


  handleMouseUp(event) {

    //console.log( 'handleMouseUp' );

  }

  handleMouseWheel(event) {

    //console.log( 'handleMouseWheel' );

    let delta = 0;

    if (event.wheelDelta !== undefined) {

      // WebKit / Opera / Explorer 9

      delta = event.wheelDelta;

    } else if (event.detail !== undefined) {

      // Firefox

      delta = -event.detail;

    }

    if (delta > 0) {

      this.dollyOut(this.getZoomScale());

    } else if (delta < 0) {

      this.dollyIn(this.getZoomScale());

    }

    this.update();

  }

  //
  // event handlers - FSM: listen for events and reset state
  //
  /*
   onElemMouseDown(event) {

   if (event.target !== this.domElement) return;
   this.onMouseDown(event);
   }*/

  onMouseDown(event) {

    if (this.enabled === false) return;

    //disable events when triggered by overlayed elements.
    if (this.domElement !== event.target) return;

    event.preventDefault();

    //reset the damping factor for mouse controls
    this.dampingFactor = this.mouseDampingFactor;

    this.activeElement = event.target;


    switch (event.button) {
      case this.mouseButtons.ORBIT:
        if (this.enableRotate === false) return;

        this.handleMouseDownRotate(event);

        this.state = STATE.ROTATE;
        break;
      case this.mouseButtons.ZOOM:
        if (this.enableZoom === false) return;

        this.handleMouseDownDolly(event);

        this.state = STATE.DOLLY;
        break;
      case this.mouseButtons.PAN:
        if (this.enablePan === false) return;

        this.handleMouseDownPan(event);

        this.state = STATE.PAN;
        break;
    }

    if (this.state !== STATE.NONE) {

      const onMoveCheck = () => {
        this.dispatchStart();
        document.removeEventListener('mousemove', onMoveCheck);
      };

      document.addEventListener('mousemove', onMoveCheck, false);

      document.addEventListener('mousemove', this.onMouseMoveRef, false);
      document.addEventListener('mouseup', this.onMouseUpRef, false);
      document.addEventListener('mouseout', this.onMouseUpRef, false);
    }

  }

  onMouseMove(event) {

    if (this.enabled === false) return;

    event.preventDefault();

    if (this.state === STATE.ROTATE) {

      if (this.enableRotate === false) return;

      this.handleMouseMoveRotate(event);

    } else if (this.state === STATE.DOLLY) {

      if (this.enableZoom === false) return;

      this.handleMouseMoveDolly(event);

    } else if (this.state === STATE.PAN) {

      if (this.enablePan === false) return;

      this.handleMouseMovePan(event);

    }

  }

  onMouseUp(event) {

    if (this.enabled === false) return;

    this.handleMouseUp(event);

    document.removeEventListener('mousemove', this.onMouseMoveRef, false);
    document.removeEventListener('mouseup', this.onMouseUpRef, false);
    document.removeEventListener('mouseout', this.onMouseUpRef, false);

    this.dispatchEnd();

    this.state = STATE.NONE;

    //cancel the active element
    this.activeElement = null;

  }


  onMouseWheel(event) {

    if (this.enabled === false || this.enableZoom === false || (this.state !== STATE.NONE && this.state !== STATE.ROTATE)) return;

    event.preventDefault();
    event.stopPropagation();

    this.handleMouseWheel(event);

    this.dispatchStart();
    this.dispatchEnd();

  }

  onKeyDown(event) {

    if (this.enabled === false || this.enableKeys === false) return;

    //set the damping factor for key controls which needs more sensitivity.
    this.dampingFactor = this.keyDampingFactor;

    this.handleKeyDown(event);

  }

  onContextMenu(event) {
    event.preventDefault();
  }

  connect() {

    this.enabled = true;

    //reset the controls for when switching out of VRControls
    this.reset();

    this.domElement.addEventListener('contextmenu', this.onContextMenu, false);

    this.onMouseDownRef = (event) => this.onMouseDown(event),
      this.onMouseWheelRef = (event) => this.onMouseWheel(event),
      this.onMouseWheelRef = (event) => this.onMouseWheel(event),
      this.onMouseMoveRef = (event) => this.onMouseMove(event),
      this.onMouseUpRef = (event) => this.onMouseUp(event),
      this.onTouchStartRef = (event) => this.onTouchStart(event),
      this.onTouchEndRef = (event) => this.onTouchEnd(event),
      this.onTouchMoveRef = (event) => this.onTouchMove(event),
      this.onKeyDownRef = (event) => this.onKeyDown(event);

    this.domElement.addEventListener('mousedown', this.onMouseDownRef, false);
    this.domElement.addEventListener('mousewheel', this.onMouseWheelRef, false);
    this.domElement.addEventListener('MozMousePixelScroll', this.onMouseWheelRef, false); // firefox
    this.domElement.addEventListener('touchstart', this.onTouchStartRef, false);
    this.domElement.addEventListener('touchend', this.onTouchEndRef, false);
    this.domElement.addEventListener('touchmove', this.onTouchMoveRef, false);

    window.addEventListener('keydown', this.onKeyDownRef, false);

  }

  disconnect() {

    this.enabled = false;

    //reset the controls for when switching to VRControls
    this.reset();

    this.domElement.removeEventListener('contextmenu', this.onContextMenu, false);
    this.domElement.removeEventListener('mousedown', this.onMouseDownRef, false);
    this.domElement.removeEventListener('mousewheel', this.onMouseWheelRef, false);
    this.domElement.removeEventListener('MozMousePixelScroll', this.onMouseWheelRef, false); // firefox

    this.domElement.removeEventListener('touchstart', this.onTouchStartRef, false);
    this.domElement.removeEventListener('touchend', this.onTouchEndRef, false);
    this.domElement.removeEventListener('touchmove', this.onTouchMoveRef, false);

    document.removeEventListener('mousemove', this.onMouseMove, false);
    document.removeEventListener('mouseup', this.onMouseUp, false);

    window.removeEventListener('keydown', this.onKeyDown, false);

    //this.dispatchEvent( { type: 'dispose' } ); // should this be added here?

  }

  saveState() {

    this.target0.copy(this.target);
    this.position0.copy(this.object.position);
    this.zoom0 = this.object.zoom;

  }

  reset() {

    this.target.copy(this.target0);
    this.object.position.copy(this.position0);
    this.object.zoom = this.zoom0;

    this.object.updateProjectionMatrix();
    this.dispatchChange();

    this.update();

    this.state = STATE.NONE;

  }

  // this method is exposed, but perhaps it would be better if we can make it private...
  update() {

    const offset = new THREE.Vector3(),

      // so camera.up is the orbit axis
      quat = new THREE.Quaternion().setFromUnitVectors(this.object.up, new THREE.Vector3(0, 1, 0)),
      quatInverse = quat.clone().inverse(),
      lastPosition = new THREE.Vector3(),
      lastQuaternion = new THREE.Quaternion(),
      position = this.object.position;

    offset.copy(position).sub(this.target);

    // rotate offset to "y-axis-is-up" space
    offset.applyQuaternion(quat);

    // angle from z-axis around y-axis
    this.spherical.setFromVector3(offset);

    /*if ( this.autoRotate && this.state === STATE.NONE ) {

     rotateLeft( getAutoRotationAngle() );

     }*/

    this.spherical.theta += this.sphericalDelta.theta;
    this.spherical.phi += this.sphericalDelta.phi;

    // restrict theta to be between desired limits
    this.spherical.theta = Math.max(this.minAzimuthAngle, Math.min(this.maxAzimuthAngle, this.spherical.theta));

    // restrict phi to be between desired limits
    this.spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.spherical.phi));

    this.spherical.makeSafe();


    this.spherical.radius *= this.scale;

    // restrict radius to be between desired limits
    this.spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this.spherical.radius));

    // move target to panned location
    this.target.add(this.panOffset);

    offset.setFromSpherical(this.spherical);

    // rotate offset back to "camera-up-vector-is-up" space
    offset.applyQuaternion(quatInverse);

    position.copy(this.target).add(offset);

    this.object.lookAt(this.target);

    if (this.enableDamping === true) {

      this.sphericalDelta.theta *= (1 - this.dampingFactor);
      this.sphericalDelta.phi *= (1 - this.dampingFactor);

    } else {

      this.sphericalDelta.set(0, 0, 0);

    }

    this.scale = 1;
    this.panOffset.set(0, 0, 0);

    // update condition is:
    // min(camera displacement, camera rotation in radians)^2 > EPS
    // using small-angle approximation cos(x/2) = 1 - x^2 / 8

    if (this.zoomChanged ||
      lastPosition.distanceToSquared(this.object.position) > EPS ||
      8 * (1 - lastQuaternion.dot(this.object.quaternion)) > EPS) {

      this.dispatchChange();

      lastPosition.copy(this.object.position);
      lastQuaternion.copy(this.object.quaternion);
      this.zoomChanged = false;

      return true;

    }

    return false;

  }

  dispatchStart() {
    this.dispatchEvent({
      type: "start"
    });
  }

  dispatchChange() {
    this.dispatchEvent({
      type: "change"
    });
  }

  dispatchEnd() {
    this.dispatchEvent({
      type: "end"
    });
  }

}

export {
  OrbitControls
};