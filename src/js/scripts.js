import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';
import data from '../data/streamlineResult3.json';

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const orbit = new OrbitControls(camera, renderer.domElement);
camera.position.set(121, 126, 12);

const rawcoord = [];
const curves = [];
const lines = [];
var intersections = [];
var points = new THREE.Points();

const positionArrays = data.result;

for (const positionArray of positionArrays) {
    const array = [];
    for (const position of positionArray) {
        array.push(new THREE.Vector3(position[0], position[1], position[2]));
    }
    rawcoord.push(array);
}

for (const coords of rawcoord) {
    for (let i = 0; i < coords.length - 2; i += 1) {
        const a = coords[i];
        const b = coords[i + 1];
        const c = coords[i + 2];

        curves.push(new THREE.QuadraticBezierCurve3(a, b, c));
    }
}

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

var geometry = new THREE.BufferGeometry();
var material = new THREE.PointsMaterial();

for (curve of curves) {
    const material = new THREE.LineBasicMaterial({transparent: true});
    geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints());
    const curveObject = new THREE.LineLoop(geometry, material);
    group.add(curveObject);

    lines.push(curve.getPoints());
}

scene.add(group);

let planeXPosition = new THREE.Vector3(1, 0, 0);
let planeYPosition = new THREE.Vector3(0, 1, 0);
let planeZPosition = new THREE.Vector3(0, 0, 1);

const guiControls = {
    planeX: { PlaneXpos: 0, clipping: false },
    planeY: { PlaneYpos: 0, clipping: false },
    planeZ: { PlaneZpos: 0, clipping: false },
    visibility: 1
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

const planeFolder = gui.addFolder('Plane Controls');
planeFolder.add(guiControls.planeX, 'PlaneXpos', -150, 150).onChange(updatePlanePositionX);
planeFolder.add(guiControls.planeY, 'PlaneYpos', -150, 150).onChange(updatePlanePositionY);
planeFolder.add(guiControls.planeZ, 'PlaneZpos', -150, 150).onChange(updatePlanePositionZ);
planeFolder.add(guiControls.planeX, 'clipping').name('Toggle clipping X').onChange(updateClippingPlanes);
planeFolder.add(guiControls.planeY, 'clipping').name('Toggle clipping Y').onChange(updateClippingPlanes);
planeFolder.add(guiControls.planeZ, 'clipping').name('Toggle clipping Z').onChange(updateClippingPlanes);

function updateClippingPlanes() {
    renderer.clippingPlanes = [];

    if (guiControls.planeX.clipping) {
        renderer.clippingPlanes.push(planeX);
    }

    if (guiControls.planeY.clipping) {
        renderer.clippingPlanes.push(planeY);
    }

    if (guiControls.planeZ.clipping) {
        renderer.clippingPlanes.push(planeZ);
    }
}

function closesttoPlane(line, plane) {
    const distance = plane.distanceToPoint(line);
    return distance < 0.1;
}

function makePoints(vec3, material){
    points.geometry.dispose();
    points.material.dispose();
    scene.remove(points);
    geometry.setFromPoints(vec3);
    points = new THREE.Points(geometry, material);
    scene.add(points);
}

function updatePlanePositionX() {
    intersections = [];
    planeX.constant = guiControls.planeX.PlaneXpos;

    const filteredX = lines.filter(line => closesttoPlane(line[0], planeX));

    for(curve of filteredX){
        const bezierline3 = [];
        bezierline3.push(
            new THREE.Line3(curve[0], curve[1]), 
            new THREE.Line3(curve[2], curve[3]), 
            new THREE.Line3(curve[4], curve[5])
        );

        for(bezier of bezierline3){
            let intersect = new THREE.Vector3();
            if(!planeX.intersectsLine(bezier)) continue;
            planeX.intersectLine(bezier, intersect);

            intersections.push(intersect);
        }

        material = new THREE.PointsMaterial({ color: 0xff0000, size: 1, side: THREE.DoubleSide, transparent: true });
        
        makePoints(intersections, material);

    }

    console.log(intersections);

}

function updatePlanePositionY() {
    intersections = [];
    planeY.constant = guiControls.planeY.PlaneYpos;

    const filteredY = lines.filter(line => closesttoPlane(line[0], planeY));

    for(curve of filteredY){
        const bezierline3 = [];
        bezierline3.push(
            new THREE.Line3(curve[0], curve[1]), 
            new THREE.Line3(curve[1], curve[2]), 
            new THREE.Line3(curve[2], curve[3]), 
            new THREE.Line3(curve[3], curve[4]), 
            new THREE.Line3(curve[4], curve[5])
        );

        for(bezier of bezierline3){
            let intersect = new THREE.Vector3();

            if(!planeY.intersectsLine(bezier)) continue;
            planeY.intersectLine(bezier, intersect);

            intersections.push(intersect);
        }

        material = new THREE.PointsMaterial({ color: 0x00ff00, size: 1, side: THREE.DoubleSide, transparent: true });

        makePoints(intersections, material);
    }

    console.log(intersections);

}

function updatePlanePositionZ() {
    intersections = [];
    planeZ.constant = guiControls.planeZ.PlaneZpos;

    const filteredZ = lines.filter(line => closesttoPlane(line[0], planeZ));

    for(curve of filteredZ){
        const bezierline3 = [];
        bezierline3.push(
            new THREE.Line3(curve[0], curve[1]), 
            new THREE.Line3(curve[1], curve[2]), 
            new THREE.Line3(curve[2], curve[3]), 
            new THREE.Line3(curve[3], curve[4]), 
            new THREE.Line3(curve[4], curve[5])
        );

        for(bezier of bezierline3){
            let intersect = new THREE.Vector3();

            if(!planeZ.intersectsLine(bezier)) continue;
            planeZ.intersectLine(bezier, intersect);

            intersections.push(intersect);
        }

        material = new THREE.PointsMaterial({ color: 0x0000ff, size: 1, side: THREE.DoubleSide, transparent: true });

        makePoints(intersections, material);
        

    }

    console.log(intersections);
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

function updateGroupVisibility() {
    group.children.forEach((child) => {
        if (child.material) {
            child.material.opacity = guiControls.visibility;
        }
    });

}

gui.add(cameraPositionGUI, 'positionX').onChange(updateCameraPosition);
gui.add(cameraPositionGUI, 'positionY').onChange(updateCameraPosition);
gui.add(cameraPositionGUI, 'positionZ').onChange(updateCameraPosition);
gui.add(guiControls, 'visibility', 0, 1).onChange(updateGroupVisibility);

function animate() {
    gui.updateDisplay();
    window.CollectGarpag
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);