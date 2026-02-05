import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import './style.css'

const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);
world.broadphase = new CANNON.SAPBroadphase(world);
world.allowSleep = true;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1e1e1e);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const floorGeo = new THREE.PlaneGeometry(100, 100);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const floorBody = new CANNON.Body({
  type: CANNON.Body.STATIC,
  shape: new CANNON.Plane()
});

floorBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(floorBody);

const playerGeo = new THREE.CapsuleGeometry(0.5, 1.0, 8, 16);
const playerMat = new THREE.MeshStandardMaterial({ color: 0x2196f3 });
const playerMesh = new THREE.Mesh(playerGeo, playerMat);
scene.add(playerMesh);

camera.position.set(0, 2, 5);

const playerShape = new CANNON.Cylinder(0.5, 0.5, 2, 8);
const playerBody = new CANNON.Body({
  mass: 1,
  shape: playerShape,
  position: new CANNON.Vec3(0, 2, 0),
  fixedRotation: true
});
world.addBody(playerBody);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

const keys = {};
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

const speed = 10;
const jumpForce = 6;
let canJump = false;

const clock = new THREE.Clock();


function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  world.step(1 / 60, delta, 3);

  const moveX = (keys['KeyA'] ? -1 : 0) + (keys['KeyD'] ? 1 : 0);
  const moveZ = (keys['KeyW'] ? -1 : 0) + (keys['KeyS'] ? 1 : 0);

  playerBody.velocity.x = moveX * speed;
  playerBody.velocity.z = moveZ * speed;

  if (keys['Space'] && canJump) {
    playerBody.velocity.y = jumpForce;
    canJump = false;
  }

  playerMesh.position.copy(playerBody.position);
  playerMesh.quaternion.copy(playerBody.quaternion);

  camera.position.set(
    playerMesh.position.x,
    playerMesh.position.y = 2,
    playerMesh.position.z + 5
  );
  camera.lookAt(playerMesh.position)

  renderer.render(scene, camera);
}

animate();

playerBody.addEventListener('collide', () => {
  canJump = true;
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});