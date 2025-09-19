import * as THREE from './libs/three.module.js';
import { OrbitControls } from './libs/OrbitControls.js';
import { VRButton } from './libs/VRButton.js';
import { Water } from 'https://threejs.org/examples/jsm/objects/Water.js';
import { Sky } from 'https://threejs.org/examples/jsm/objects/Sky.js';

// Scene setup
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000010, 0.002);

// Camera (first person)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 5000);
camera.position.set(0, 2, 0);

// Renderer with VR
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

// Lighting
const hemiLight = new THREE.HemisphereLight(0x111122, 0x000011, 0.8);
scene.add(hemiLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.2);
dirLight.position.set(10, 10, 10);
scene.add(dirLight);

// Ocean
const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
const water = new Water(waterGeometry, {
  textureWidth: 512,
  textureHeight: 512,
  waterNormals: new THREE.TextureLoader().load(
    'https://threejs.org/examples/textures/waternormals.jpg',
    (tex) => { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; }
  ),
  alpha: 1.0,
  sunDirection: new THREE.Vector3(),
  sunColor: 0xffffff,
  waterColor: 0x001020,
  distortionScale: 4,
  fog: scene.fog !== undefined
});
water.rotation.x = -Math.PI / 2;
scene.add(water);

// Sky (dark)
const sky = new Sky();
sky.scale.setScalar(10000);
scene.add(sky);
const skyUniforms = sky.material.uniforms;
skyUniforms['turbidity'].value = 20;
skyUniforms['rayleigh'].value = 0.1;
skyUniforms['mieCoefficient'].value = 0.005;
skyUniforms['mieDirectionalG'].value = 0.7;

// Movement
const keys = {};
let speed = 0.1;
document.addEventListener('keydown', (e) => { keys[e.code] = true; });
document.addEventListener('keyup', (e) => { keys[e.code] = false; });

function updateMovement() {
  let moveSpeed = keys['ShiftLeft'] ? speed * 3 : speed;
  if (keys['KeyW']) camera.translateZ(-moveSpeed);
  if (keys['KeyS']) camera.translateZ(moveSpeed);
  if (keys['KeyA']) camera.translateX(-moveSpeed);
  if (keys['KeyD']) camera.translateX(moveSpeed);
}

// Animation
renderer.setAnimationLoop(() => {
  updateMovement();
  water.material.uniforms['time'].value += 1.0 / 60.0;
  renderer.render(scene, camera);
});

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
