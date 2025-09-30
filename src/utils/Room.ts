import *as THREE from 'three';

export class Room { 
  constructor(
    public name: string,
    public roomPrefix: string,
    public textureUrl: string,
    public scene: THREE.Scene = new THREE.Scene(),
    public position: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
    public euler: THREE.Euler = new THREE.Euler(0, 0, 0),
  ) { 

    // 创建立方体
    const geometry = new THREE.BoxGeometry(10, 10, 10);
    geometry.scale(1, 1, -1);

    const arr = [
      `${roomPrefix}_r`,
      `${roomPrefix}_l`,
      `${roomPrefix}_u`,
      `${roomPrefix}_d`,
      `${roomPrefix}_f`,
      `${roomPrefix}_b`,
    ];
    const boxMaterials: THREE.MeshBasicMaterial[] = [];

    arr.forEach((item) => { 
      const texture = new THREE.TextureLoader().load(
        textureUrl + item + ".jpg"
      );
      boxMaterials.push(new THREE.MeshBasicMaterial({ map: texture }));
    })

    const box = new THREE.Mesh(geometry, boxMaterials);
    box.position.copy(position);
    box.rotation.copy(euler);
    scene.add(box);
  }
}