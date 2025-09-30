import * as THREE from "three";

export class TooltipSprite { 
  sprite: THREE.Sprite;
  constructor(
    public url: string,
    public position: THREE.Vector3,
    public scene: THREE.Scene,
    public camera: THREE.Camera,
    public userData: Record<string, any> = {}
  ) { 
    const tooltipTexture = new THREE.TextureLoader().load(url);
    const tooltipMaterial = new THREE.SpriteMaterial({
      map: tooltipTexture,
      transparent: true,
    });

    const tooltipSprite = new THREE.Sprite(tooltipMaterial);
    tooltipSprite.position.copy(position);
    tooltipSprite.scale.set(0.2, 0.2, 0.2);
    tooltipSprite.userData = userData;
    this.sprite = tooltipSprite;
    scene.add(tooltipSprite);
  }
}