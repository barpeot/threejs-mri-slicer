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
        const b = coords[i+1];
        const c = coords[i+2];

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

const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshBasicMaterial({
    color: 0xFFFFFF,
    side: THREE.DoubleSide,
});

const material = new THREE.LineBasicMaterial();

for(curve of curves){
    curve.arcLengthDivisions = 6;
    const points = curve.getPoints( 3 );
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const curveObject = new THREE.Line(geometry, material);
    scene.add(curveObject);
}


const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);

const gridHelper = new THREE.GridHelper(30);
scene.add(gridHelper);

plane.rotation.x = -0.5 * Math.PI;

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
    gui.updateDisplay();
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
