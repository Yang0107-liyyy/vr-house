import { useState, useRef, useEffect } from 'react';
import *as THREE from 'three';
import gsap from 'gsap';
import { Room } from "./utils/Room";
import { PositionSprite } from "./utils/PositionSprite";
import { TooltipSprite } from "./utils/TooltipSprite";
import './App.css';

function App() {
  const container = useRef<HTMLDivElement | null>(null);
  const tooltipBox = useRef<HTMLDivElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({
    left: '-100%',
    top: '-100%',
  });
  const [tooltipContent, setTooltipContent] = useState<Record<string, any>>({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (!container.current || !tooltipBox.current) return;

    // 初始化
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 0.01);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // 渲染循环
    const render = () => {
      renderer.render(scene, camera);
      requestAnimationFrame(render);
    }

    // 窗口大小调整处理
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    // 鼠标移动观看场景
    let isMouseDown = false;
    const handleMouseDown = () => {
      isMouseDown = true;
    };
    const handleMouseUp = () => {
      isMouseDown = false;
    };
    const handleMouseOut = () => {
      isMouseDown = false;
    };
    const handleMouseMove = (event: MouseEvent) => {
      if (isMouseDown) {
        camera.rotation.x += event.movementY * 0.01;
        camera.rotation.y += event.movementX * 0.01;
        camera.rotation.order = "YXZ";
      }
    };

    const spriteList: THREE.Sprite[] = [];
    // 初始化场景
    function initScene() {
      new Room("客厅", "living", "./images/livingRoom/", scene);
      const balconyPosition = new THREE.Vector3(0, 0, -10);
      new Room("阳台", "balcony", "./images/balcony/", scene, balconyPosition);
      const kitchenPosition = new THREE.Vector3(2, 0, 10);
      const kitchenEuler = new THREE.Euler(0, -Math.PI / 2, 0);
      new Room("厨房", "kitchen", "./images/kitchen/", scene, kitchenPosition, kitchenEuler);

      // 阳台位置标识
      const balconySprite = new PositionSprite(
        "阳台",
        new THREE.Vector3(0, 0, -4),
        scene,
        camera
      );
      balconySprite.onClick(() => {
        gsap.to(camera.position, {
          duration: 1,
          x: 0,
          y: 0,
          z: -10,
        });
      });

      // 阳台回到客厅位置标识
      const balconyBackSprite = new PositionSprite(
        "客厅",
        new THREE.Vector3(1, 0, -6),
        scene,
        camera
      );
      balconyBackSprite.onClick(() => {
        gsap.to(camera.position, {
          duration: 1,
          x: 0,
          y: 0,
          z: 0,
        });
      });

      // 厨房位置标识
      const kitchenSprite = new PositionSprite(
        "厨房",
        new THREE.Vector3(1.5, 0, 4),
        scene,
        camera
      );
      kitchenSprite.onClick(() => {
        gsap.to(camera.position, {
          duration: 1,
          x: kitchenPosition.x,
          y: kitchenPosition.y,
          z: kitchenPosition.z,
        });
      });

      // 厨房回到客厅位置标识
      const kitchenBackSprite = new PositionSprite(
        "客厅",
        new THREE.Vector3(1, 0, 6),
        scene,
        camera
      );
      kitchenBackSprite.onClick(() => {
        gsap.to(camera.position, {
          duration: 1,
          x: 0,
          y: 0,
          z: 0,
        });
      });

      // 工具提示精灵
      const tooltipSprite1 = new TooltipSprite(
        "./images/dot.png",
        new THREE.Vector3(1.5, -0.1, -3),
        scene,
        camera,
        {
          name: "工艺画",
          description: "十分抽象的工艺画，给人一种很有艺术感的感觉",
          type: "information",
        }
      );

      const tooltipSprite2 = new TooltipSprite(
        "./images/dot.png",
        new THREE.Vector3(-2.5, -0.1, -3),
        scene,
        camera,
        {
          name: "木雕艺术品",
          description: "这是一件木雕艺术品，展现了精湛的工艺和设计",
          type: "information",
        }
      );

      const tooltipSprite3 = new TooltipSprite(
        "./images/dot.png",
        new THREE.Vector3(3, 1, 2),
        scene,
        camera,
        {
          name: "艺术画",
          description: "这是一件艺术化的作品，展现了独特的设计理念",
          type: "information",
        }
      );

      spriteList.push(tooltipSprite1.sprite);
      spriteList.push(tooltipSprite2.sprite);
      spriteList.push(tooltipSprite3.sprite);
    }

    // 工具提示显示
    const tooltipShow = (event: MouseEvent) => {
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();

      event.preventDefault();
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(spriteList);

      if (intersects.length > 0 && intersects[0].object.userData.type === "information") {
        const element = event.target as HTMLElement;
        const elementWidth = element.clientWidth / 2;
        const elementHeight = element.clientHeight / 2;
        const worldVector = new THREE.Vector3(
          intersects[0].object.position.x,
          intersects[0].object.position.y,
          intersects[0].object.position.z
        );
        const position = worldVector.project(camera);

        const left = Math.round(
          elementWidth * position.x +
          elementWidth -
          tooltipBox.current!.clientWidth / 2
        );

        const top = Math.round(
          -elementHeight * position.y +
          elementHeight -
          tooltipBox.current!.clientHeight / 2
        );

        setTooltipPosition({
          left: `${left}px`,
          top: `${top}px`,
        });

        const userData = intersects[0].object.userData;
        setTooltipContent({
          name: userData.name || '',
          description: userData.description || '',
          type: userData.type || '',
        });
      } else {
        handleTooltipHide(event);
      }
    };

    // 工具提示隐藏
    const handleTooltipHide = (event: MouseEvent) => {
      event.preventDefault();
      setTooltipPosition({
        left: '-100%',
        top: '-100%',
      });
      setTooltipContent({
        name: '',
        description: '',
      });
    };

    container.current?.appendChild(renderer.domElement);

    initScene();

    render();

    // 添加事件监听器
    window.addEventListener('resize', handleResize);
    renderer.domElement.addEventListener('mousemove', tooltipShow);
    tooltipBox.current.addEventListener('mouseleave', handleTooltipHide as any);

    container.current.addEventListener('mousedown', handleMouseDown);
    container.current.addEventListener('mouseup', handleMouseUp);
    container.current.addEventListener('mouseout', handleMouseOut);
    container.current.addEventListener('mousemove', handleMouseMove);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      if (container.current) {
        container.current.removeChild(renderer.domElement);

        container.current.removeEventListener('mousedown', handleMouseDown);
        container.current.removeEventListener('mouseup', handleMouseUp);
        container.current.removeEventListener('mouseout', handleMouseOut);
        container.current.removeEventListener('mousemove', handleMouseMove);
      }

      if (tooltipBox.current) {
        tooltipBox.current.removeEventListener('mouseleave', handleTooltipHide as any);
      }

      renderer.dispose();
    };

  }, []);

  return (
    <>
      <div ref={container} className='container'></div>
      <div
        ref={tooltipBox}
        className='tooltip-box'
        style={tooltipPosition}
      >
        <div className="wrapper">
          <div className="name">标题: {tooltipContent.name}</div>
          <div className="description">说明: {tooltipContent.description}</div>
        </div>
      </div>
    </>
  )
}

export default App;
