import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';
import data from '../data/streamlineResult2.json';

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
const orbit = new OrbitControls(camera, renderer.domElement);
camera.position.set(121, 126, 12);

const rawcoord = [];
const curves = [];

const positionArrays = data.result;

for (const positionArray of positionArrays) {
    const array = [];
    for (const position of positionArray) {
        array.push(new THREE.Vector3(position[0], position[1], position[2]));
    }
    rawcoord.push(array);
}

console.log(rawcoord);

for (const coords of rawcoord) {
    for (let i = 0; i < coords.length - 2; i += 1) {
        const a = coords[i];
        const b = coords[i + 1];
        const c = coords[i + 2];

        curves.push(new THREE.QuadraticBezierCurve3(a, b, c));
    }
}

console.log(curves);

const cameraPositionGUI = {
    positionX: camera.position.x,
    positionY: camera.position.y,
    positionZ: camera.position.z,
};

orbit.addEventListener("change", () => {
    cameraPositionGUI.positionX = camera.position.x;
    cameraPositionGUI.positionY = camera.position.y;
    cameraPositionGUI.positionZ = camera.position.z;
});
orbit.update();

const gui = new dat.GUI();
const options = {};

const group = new THREE.Group();

for (curve of curves) {
    const material = new THREE.LineBasicMaterial();
    const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints());
    const curveObject = new THREE.Line(geometry, material);
    group.add(curveObject);
}

scene.add(group);

let planeXPosition = new THREE.Vector3(1, 0, 0);
let planeYPosition = new THREE.Vector3(0, 1, 0);
let planeZPosition = new THREE.Vector3(0, 0, 1);

const guiControls = {
    planeX: { PlaneXpos: 0 },
    planeY: { PlaneYpos: 0 },
    planeZ: { PlaneZpos: 0 }
};

let planeX = new THREE.Plane(planeXPosition, 0);
let planeY = new THREE.Plane(planeYPosition, 0);
let planeZ = new THREE.Plane(planeZPosition, 0);

var PlaneHelperX = new THREE.PlaneHelper(planeX, 300, 0xff0000);
var PlaneHelperY = new THREE.PlaneHelper(planeY, 300, 0x00ff00);
var PlaneHelperZ = new THREE.PlaneHelper(planeZ, 300, 0x0000ff);
scene.add(PlaneHelperX);
scene.add(PlaneHelperY);
scene.add(PlaneHelperZ);

const planeFolder = gui.addFolder('Plane Positions');
planeFolder.add(guiControls.planeX, 'PlaneXpos', -150, 150).onChange(updatePlanePositions);
planeFolder.add(guiControls.planeY, 'PlaneYpos', -150, 150).onChange(updatePlanePositions);
planeFolder.add(guiControls.planeZ, 'PlaneZpos', -150, 150).onChange(updatePlanePositions);

function updatePlanePositions() {
    planeX.constant = guiControls.planeX.PlaneXpos;
    planeY.constant = guiControls.planeY.PlaneYpos;
    planeZ.constant = guiControls.planeZ.PlaneZpos;

}

camera.lookAt(group.position);

function updateCameraPosition() {
    camera.position.set(
        cameraPositionGUI.positionX,
        cameraPositionGUI.positionY,
        cameraPositionGUI.positionZ
    );
    camera.updateProjectionMatrix();
}

gui.add(cameraPositionGUI, 'positionX').onChange(updateCameraPosition);
gui.add(cameraPositionGUI, 'positionY').onChange(updateCameraPosition);
gui.add(cameraPositionGUI, 'positionZ').onChange(updateCameraPosition);

renderer.clippingPlanes = [planeX, planeY, planeZ];
renderer.localClippingEnabled = true;

function animate() {
    updatePlanePositions();
    gui.updateDisplay();
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);