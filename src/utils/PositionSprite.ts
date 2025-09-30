import * as THREE from "three";

export class PositionSprite {
  sprite: THREE.Sprite;
  callbacks: any[];
  constructor(
    text: string,
    position: THREE.Vector3,
    scene: THREE.Scene,
    camera: THREE.Camera
  ) {
    this.callbacks = [];

    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const context = canvas.getContext("2d")!;
    context.fillStyle = "rgba(100,100,100,.7)";
    context.fillRect(0, 256, canvas.width, canvas.height / 2);
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "bold 200px Arial";
    context.fillStyle = "white";
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
    })

    const sprite = new THREE.Sprite(material);
    sprite.position.copy(position);
    this.sprite = sprite;
    scene.add(sprite);

    let pointer = new THREE.Vector2();
    let raycaster = new THREE.Raycaster();
    window.addEventListener('click', (event: MouseEvent) => { 
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObject(sprite);
      if (intersects.length > 0) { 
        this.callbacks.forEach((callback) => {
          callback();
        })
      }
    })
  }
  onClick(callback: () => void) {
    this.callbacks.push(callback);
  }
}
