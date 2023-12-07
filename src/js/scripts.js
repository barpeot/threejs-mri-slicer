import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';
import data from '../data/streamlineResult2.json';

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const orbit = new OrbitControls(camera, renderer.domElement);
camera.position.set(81, 116, 27);

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
    array2 = [];
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

const visibilityControls = {
    planeX: true,
    planeY: true,
    planeZ: true,
};

gui.add(visibilityControls, 'planeX').onChange(updatePlaneVisibility).name('Show Plane X');
gui.add(visibilityControls, 'planeY').onChange(updatePlaneVisibility).name('Show Plane Y');
gui.add(visibilityControls, 'planeZ').onChange(updatePlaneVisibility).name('Show Plane Z');

function updatePlaneVisibility() {
    planeX.visible = visibilityControls.planeX;
    planeY.visible = visibilityControls.planeY;
    planeZ.visible = visibilityControls.planeZ;
}

const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshBasicMaterial({
    color: 0xFFFFFF,
    side: THREE.DoubleSide,
});

const material = new THREE.LineBasicMaterial();

for (curve of curves) {
    curve.arcLengthDivisions = 6;
    const points = curve.getPoints(3);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const curveObject = new THREE.Line(geometry, material);
    scene.add(curveObject);
}

const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);

const gridHelper = new THREE.GridHelper(30);
scene.add(gridHelper);

plane.rotation.x = -0.5 * Math.PI;

let planeXPosition = new THREE.Vector3(80, 100, 0);
let planeYPosition = new THREE.Vector3(80, 100, 0);
let planeZPosition = new THREE.Vector3(80, 100, 0);


// GUI controls for plane positions
const guiControls = {
    planeX: { position: 0 },
    planeY: { position: 0 },
    planeZ: { position: 0 }
};

const planeX = createPlane(30, 30, 0xFF0000, new THREE.Vector3(80, 100, 0));
const planeY = createPlane(30, 30, 0x00FF00, new THREE.Vector3(80, 100, 0));
const planeZ = createPlane(30, 30, 0x0000FF, new THREE.Vector3(80, 100, 0));

scene.add(planeX);
scene.add(planeY);
scene.add(planeZ);

function createPlane(width, height, color, initialPosition) {
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshBasicMaterial({
        color,
        side: THREE.DoubleSide,
        clippingPlanes: [new THREE.Plane(new THREE.Vector3(1, 0, 0), 0)],  // Set the clipping plane
        clipShadows: true,  // Enable clipping
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.position.copy(initialPosition);
    return plane;
}

function updateClippingPlanes() {
    planeX.material.clippingPlanes[0].constant = guiControls.planeX.position;
    planeY.material.clippingPlanes[0].constant = guiControls.planeY.position;
    planeZ.material.clippingPlanes[0].constant = guiControls.planeZ.position;
}

function updatePlanePositions() {
    planeXPosition.set(guiControls.planeX.position + 95, 100, 0);
    planeYPosition.set(80, guiControls.planeY.position + 115, 0);
    planeZPosition.set(80, 100, guiControls.planeZ.position + 15);

    planeX.position.copy(planeXPosition);
    planeY.position.copy(planeYPosition);
    planeZ.position.copy(planeZPosition);

    // Update plane rotations based on movement direction
    planeX.rotation.set(0, Math.PI / 2, 0);
    planeY.rotation.set(-Math.PI / 2, 0, 0);
    planeZ.rotation.set(0, 0, 0);
}

gui.add(guiControls.planeX, 'position').min(-100).max(100).step(0.1).onChange(updatePlanePositions).name('planeX');
gui.add(guiControls.planeY, 'position').min(-100).max(100).step(0.1).onChange(updatePlanePositions).name('planeY');
gui.add(guiControls.planeZ, 'position').min(-100).max(100).step(0.1).onChange(updatePlanePositions).name('planeZ');

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

function animate() {
    updatePlanePositions();
    updatePlaneVisibility();
    updateClippingPlanes();
    gui.updateDisplay();
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);