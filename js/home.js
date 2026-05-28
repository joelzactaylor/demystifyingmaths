import * as THREE from 'three';

document.addEventListener("DOMContentLoaded", () => {
    // =======================================================================================
    // Animate title text
    // =======================================================================================

    const title = document.getElementById("main-title");
    if (!title) return;

    const text = title.textContent.trim();
    const words = text.split(/\s+/);

    const frag = document.createDocumentFragment();

    words.forEach((word, wIndex) => {
        const wordSpan = document.createElement("span");
        wordSpan.className = "word";

        [...word].forEach((ch, cIndex) => {
            const charSpan = document.createElement("span");
            charSpan.className = "char";
            charSpan.textContent = ch;
            wordSpan.appendChild(charSpan);
        });

        // space between words (as text, not animated)
        if (wIndex < words.length - 1) {
            const space = document.createTextNode(" ");
            wordSpan.appendChild(space);
        }

        frag.appendChild(wordSpan);
    });

    // =======================================================================================
    // Button scroll
    // =======================================================================================

    title.textContent = "";
    title.appendChild(frag);

    const button = document.querySelector("#title-section button");
    const target = document.getElementById("pages-section");

    if (!button || !target) return;

    button.addEventListener("click", () => {
        target.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });

    // =======================================================================================
    // 3D Polyhedron using Three.js
    // =======================================================================================

    const canvas = document.getElementById("poly-canvas");

    // 1) Make background transparent: alpha: true
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true
    });

    // Keep scene background null so the canvas is transparent
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 6);
    camera.lookAt(0, 0, 0);

    // Geometry
    const geometry = new THREE.IcosahedronGeometry(2.2, 1); // add 1 level of detail

    // 2) Less shiny, clearer 3D: lower metalness, higher roughness, flatShading on
    const material = new THREE.MeshStandardMaterial({
        color: 0xffff00,
        metalness: 0.1,
        roughness: 1,
        flatShading: true,
        transparent: true,
        opacity: 0.4
    });

    const wireMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        opacity: 0.25,
        transparent: true
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // (Optional) if you want the wireframe overlay, actually add it:
    const wireMesh = new THREE.Mesh(geometry, wireMat);
    scene.add(wireMesh);

    // Lights (same positions, but work better with rough, flat-shaded material)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(4, 6, 8);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x88aaff, 0.8);
    rimLight.position.set(-5, -3, -4);
    scene.add(rimLight);

    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambient);

    function resize() {
        const rect = canvas.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        if (!width || !height) return;

        renderer.setPixelRatio(window.devicePixelRatio || 1);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }

    window.addEventListener("resize", resize);
    resize();

    function animate() {
        requestAnimationFrame(animate);

        const t = performance.now() * 0.0002;

        // Gentle motion to expose depth cues but not fidget-spinner fast
        mesh.rotation.x = Math.sin(t) * 0.45;
        mesh.rotation.y = t * 0.7;

        if (wireMesh) {
            wireMesh.rotation.copy(mesh.rotation);
        }

        renderer.render(scene, camera);
    }

    animate();
});