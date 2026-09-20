import * as THREE from "three";

const canvas = document.getElementById("poly-canvas");

if (canvas) {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    const geometry = new THREE.IcosahedronGeometry(2.2, 1);
    const surface = new THREE.MeshStandardMaterial({
        color: 0xffff00,
        metalness: 0.1,
        roughness: 1,
        flatShading: true,
        transparent: true,
        opacity: 0.8
    });
    const edges = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.25
    });
    const solid = new THREE.Mesh(geometry, surface);
    const wireframe = new THREE.Mesh(geometry, edges);

    camera.position.set(0, 0, 6);
    camera.lookAt(0, 0, 0);
    scene.add(solid, wireframe);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(4, 6, 8);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x88aaff, 0.8);
    rimLight.position.set(-5, -3, -4);
    scene.add(rimLight, new THREE.AmbientLight(0xffffff, 0.3));

    const resize = () => {
        const { width, height } = canvas.getBoundingClientRect();
        if (!width || !height) return;

        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    };

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const draw = (time = 0) => {
        const turn = time * 0.0002;
        solid.rotation.x = reducedMotion.matches ? 0.2 : Math.sin(turn) * 0.45;
        solid.rotation.y = reducedMotion.matches ? 0.35 : turn * 0.7;
        wireframe.rotation.copy(solid.rotation);
        renderer.render(scene, camera);

        if (!reducedMotion.matches) requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    resize();
    requestAnimationFrame(draw);
}
