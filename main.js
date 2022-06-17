import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';



let camera, scene, renderer;
let plane;
let pointer, raycaster, isShiftDown = false;

let hoverMesh, hoverMaterial;
//let modelGeo, modelMesh;

const objects = [];
var modelBank = [];
var voxel1;
var roomMesh, tableTestTwo, speakerTest, speakerTwoTest,
  recordPlayer, models;

init();
render();

function init () {
  camera = new THREE.PerspectiveCamera(
    75,
    innerWidth / innerHeight,
    1,
    10000);

    camera.position.set( 0, 900, 900 );
    camera.lookAt( 0, 0, 0 );

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);


  //hover helpers
  const hoverCursorGeo = new THREE.BoxGeometry(50, 50, 50);
  hoverMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    opacity: 0.5,
    transparent: true
  });
  hoverMesh = new THREE.Mesh(
    hoverCursorGeo,
    hoverMaterial);

  scene.add(hoverMesh);



  //model array and object loader
  
  
  modelBank = models = [
    {
      url: 'resources/roomAssets/roomMesh.glb',
      position: [0, 0, -10],
      name: roomMesh,
    },
    {
      url: 'resources/roomAssets/tableTestTwo.glb',
      position: [-1.6, .5, -10],
      name: tableTestTwo,
    },
    {
      url: 'resources/roomAssets/speakerTest.glb',
      position: [0, 0, -10],
      name: speakerTest,
    },
    {
      url: 'resources/roomAssets/speakerTwoTest.glb',
      position: [0, 0, -10.23],
      name: speakerTwoTest,
    },
   
    {
      url: 'resources/roomAssets/recordPlayer.glb',
      position: [-3.83, -.85, -13.6],
      name: recordPlayer,
    },
    
  ]

  const objectLoader = new GLTFLoader();
    Promise.all(models.map(async model => {
      const gltf = await objectLoader.loadAsync(model.url);
      gltf.scene.name = model.name;
      gltf.scene.position.set(...model.position);
      scene.add(gltf.scene);
      console.log(models);
      }
    )
  );

  // grid
  const gridHelper = new THREE.GridHelper(1000,20);
  scene.add(gridHelper);

  // raycaster

  raycaster =  new THREE.Raycaster();
  pointer   =  new THREE.Vector2();

  const geometry = new THREE.PlaneGeometry( 1000, 1000 );
	geometry.rotateX( - Math.PI / 2 );

  plane = new THREE.Mesh(geometry,
  new THREE.MeshBasicMaterial({visible: false}));
  scene.add(plane);

  objects.push(plane);

  // lights
  const upColor = 0xFFFF80;
  const downColor = 0x808080;
  const hemLight = new THREE.HemisphereLight(
    upColor,
    downColor,
    0.4);
    hemLight.color.setHSL(0.6, 1, 0.6);
    hemLight.groundColor.setHSL(0.095, 1, 0.75);
    hemLight.position.set(0, 0, 10);
    scene.add(hemLight);


  const distance = 100.0;
  const angle = Math.PI / 4.0;
  const penumbra = 0.5;
  const decay = 1.0;

  const pointLight = new THREE.PointLight(
    0x808080,
    75.0,
    distance,
    angle,
    penumbra,
    decay);
  pointLight.position.set(0,30,-10);
  scene.add(pointLight);


  // initializing WebGL renderer
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(innerWidth, innerHeight);
  document.body.appendChild(renderer.domElement);
  


  // initializing event listeners for user input
  document.addEventListener( 'pointermove', onPointerMove );
  document.addEventListener( 'pointerdown', onPointerDown );
  document.addEventListener( 'keydown', onKeyDown );
  document.addEventListener( 'keyup', onKeyUp );
  window.addEventListener( 'resize', onWindowResize );
}

//window resize function
function onWindowResize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);

  render();
}


function onPointerMove ( event ) {
  pointer.set((event.clientX / window.innerWidth) * 2 - 1,
   - (event.clientY / window.innerHeight) * 2 - 1);
  
   raycaster.setFromCamera(pointer, camera);

   const intersects = raycaster.intersectObjects(objects, false);

   if ( intersects.length > 0 ) {

    const intersect = intersects[0];
    
    hoverMesh.position.copy( intersect.point ).add( intersect.face.normal );
    hoverMesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );

    render();
   }
}

function onPointerDown( event ) {

  pointer.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

  raycaster.setFromCamera( pointer, camera );

  const intersects = raycaster.intersectObjects( modelBank, false );

  if ( intersects.length > 0 ) {

    const intersect = intersects[ 0 ];

    // delete if shift key is down

    if ( isShiftDown ) {

      if ( intersect.modelBank !== plane ) {

        scene.remove( intersect.models );

        models.splice( models.indexOf( intersect.models ), 1 );

      }

      // add model to scene by click

    } else {

      voxel1 = [roomMesh];
      voxel1.position.copy( intersect.point ).add( intersect.face.normal );
      voxel1.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
      scene.add( voxel1 );

      models.push( voxel1 );

    }

    render();

  }

}

function onKeyDown( event ) {

  switch ( event.keyCode ) {

    case 16: isShiftDown = true; break;

  }

}

function onKeyUp( event ) {

  switch ( event.keyCode ) {

    case 16: isShiftDown = false; break;

  }

}

function render() {

  renderer.render( scene, camera );

}



