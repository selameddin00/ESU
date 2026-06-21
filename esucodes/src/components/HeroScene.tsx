"use client";
import { useRef, useEffect } from "react";

export function HeroScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frameId: number;
    let cleanup: (() => void) | undefined;

    import("three").then((THREE) => {
      const mount = mountRef.current;
      if (!mount) return;

      const W = mount.clientWidth  || window.innerWidth;
      const H = mount.clientHeight || 680;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      mount.appendChild(renderer.domElement);

      const scene  = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(65, W / H, 0.1, 200);
      camera.position.set(0, 3.5, 7);
      camera.lookAt(0, 0, 0);

      const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

      function makeCircleTex(size: number) {
        const c = document.createElement("canvas");
        c.width = c.height = size;
        const ctx = c.getContext("2d")!;
        const g = ctx.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);
        g.addColorStop(0,   "rgba(255,255,255,1)");
        g.addColorStop(0.2, "rgba(255,255,255,0.95)");
        g.addColorStop(0.5, "rgba(255,255,255,0.4)");
        g.addColorStop(1,   "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(size/2,size/2,size/2,0,Math.PI*2); ctx.fill();
        return new THREE.CanvasTexture(c);
      }
      function makeSoftCloudTex(size: number) {
        const c = document.createElement("canvas");
        c.width = c.height = size;
        const ctx = c.getContext("2d")!;
        const g = ctx.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);
        g.addColorStop(0,   "rgba(255,255,255,0.55)");
        g.addColorStop(0.4, "rgba(255,255,255,0.18)");
        g.addColorStop(0.8, "rgba(255,255,255,0.04)");
        g.addColorStop(1,   "rgba(255,255,255,0)");
        ctx.fillStyle = g; ctx.fillRect(0,0,size,size);
        return new THREE.CanvasTexture(c);
      }
      const starTex  = makeCircleTex(64);
      const cloudTex = makeSoftCloudTex(256);

      // Background stars
      {
        const N = 4500;
        const pos = new Float32Array(N * 3);
        const col = new Float32Array(N * 3);
        for (let i = 0; i < N; i++) {
          const r = 14 + Math.random() * 40;
          const theta = Math.random() * Math.PI * 2;
          const phi   = Math.acos(2 * Math.random() - 1);
          pos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
          pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
          pos[i*3+2] = r * Math.cos(phi);
          const t = Math.random();
          col[i*3]   = 0.70 + t * 0.30;
          col[i*3+1] = 0.75 + t * 0.20;
          col[i*3+2] = 0.90 + t * 0.10;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        geo.setAttribute("color",    new THREE.BufferAttribute(col, 3));
        scene.add(new THREE.Points(geo, new THREE.PointsMaterial({
          size: 0.05, map: starTex, vertexColors: true,
          transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        })));
      }

      // Galaxy group
      const galaxyGroup = new THREE.Group();
      scene.add(galaxyGroup);

      {
        const N = 7500, BRANCHES = 3, RADIUS = 7.5, SPIN = 1.4;
        const pos = new Float32Array(N * 3);
        const col = new Float32Array(N * 3);
        const c0 = new THREE.Color("#818cf8");
        const c1 = new THREE.Color("#22d3ee");
        const c2 = new THREE.Color("#a78bfa");
        for (let i = 0; i < N; i++) {
          const r      = Math.pow(Math.random(), 0.55) * RADIUS;
          const branch = (i % BRANCHES) / BRANCHES * Math.PI * 2;
          const spin   = r * SPIN;
          const rp = (v: number) => Math.pow(Math.random(), 2.6) * v * (Math.random() < 0.5 ? 1 : -1);
          pos[i*3]   = Math.cos(branch + spin) * r + rp(0.65);
          pos[i*3+1] = rp(0.22);
          pos[i*3+2] = Math.sin(branch + spin) * r + rp(0.65);
          const t   = r / RADIUS;
          const mix = t < 0.5 ? c0.clone().lerp(c2, t * 2) : c2.clone().lerp(c1, (t-0.5)*2);
          const b   = 0.55 + Math.random() * 0.45;
          col[i*3]=mix.r*b; col[i*3+1]=mix.g*b; col[i*3+2]=mix.b*b;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        geo.setAttribute("color",    new THREE.BufferAttribute(col, 3));
        galaxyGroup.add(new THREE.Points(geo, new THREE.PointsMaterial({
          size: 0.036, map: starTex, vertexColors: true,
          transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        })));
      }

      // Black hole
      const blackHole = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0x000000 })
      );
      galaxyGroup.add(blackHole);

      // Accretion disk
      {
        const N = 300;
        const pos = new Float32Array(N * 3);
        const col = new Float32Array(N * 3);
        for (let i = 0; i < N; i++) {
          const r = 0.25 + Math.pow(Math.random(), 2) * 0.6;
          const a = Math.random() * Math.PI * 2;
          pos[i*3]   = Math.cos(a) * r + (Math.random()-0.5)*0.08;
          pos[i*3+1] = (Math.random()-0.5)*0.04;
          pos[i*3+2] = Math.sin(a) * r + (Math.random()-0.5)*0.08;
          const t = Math.random();
          col[i*3]=0.6+t*0.3; col[i*3+1]=0.3+t*0.2; col[i*3+2]=0.8+t*0.2;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        geo.setAttribute("color",    new THREE.BufferAttribute(col, 3));
        galaxyGroup.add(new THREE.Points(geo, new THREE.PointsMaterial({
          size: 0.045, map: starTex, vertexColors: true,
          transparent: true, opacity: 0.4, depthWrite: false,
          blending: THREE.AdditiveBlending,
        })));
      }

      // Nebula clouds
      ([
        { color: 0x7c3aed, x:-3.2, y: 1.0, z:-2.0, count:550, spread:2.8, opacity:0.11 },
        { color: 0x06b6d4, x: 3.8, y:-0.5, z:-0.8, count:450, spread:2.2, opacity:0.10 },
        { color: 0xec4899, x:-0.8, y: 1.5, z:-3.5, count:380, spread:2.0, opacity:0.09 },
        { color: 0x4338ca, x: 1.8, y:-1.8, z:-2.8, count:320, spread:1.6, opacity:0.08 },
        { color: 0x0891b2, x:-5.0, y: 0.0, z:-1.0, count:280, spread:1.4, opacity:0.07 },
      ] as const).forEach(({ color, x, y, z, count, spread, opacity }) => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
          const r = Math.pow(Math.random(), 0.4) * spread;
          const a = Math.random() * Math.PI * 2;
          const b = Math.acos(2 * Math.random() - 1);
          pos[i*3]   = x + r * Math.sin(b) * Math.cos(a);
          pos[i*3+1] = y + r * Math.sin(b) * Math.sin(a) * 0.45;
          pos[i*3+2] = z + r * Math.cos(b);
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        scene.add(new THREE.Points(geo, new THREE.PointsMaterial({
          size: 1.3, map: cloudTex, color: new THREE.Color(color),
          transparent: true, opacity, depthWrite: false,
          blending: THREE.AdditiveBlending,
        })));
      });

      // Planets
      type AnyMesh = InstanceType<typeof THREE.Mesh>;
      const planetMeshes: { mesh: AnyMesh; spin: number }[] = [];

      const cyanP = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 32, 32),
        new THREE.MeshStandardMaterial({ color:0x0891b2, emissive:0x164e63, emissiveIntensity:0.9, roughness:0.4 })
      );
      cyanP.position.set(4.5, -0.7, -2.2);
      scene.add(cyanP);
      planetMeshes.push({ mesh:cyanP, spin:0.013 });

      const moon = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 20, 20),
        new THREE.MeshStandardMaterial({ color:0x4338ca, emissive:0x1e1b4b, emissiveIntensity:1.0, roughness:0.3 })
      );
      moon.position.set(5.8, 2.5, -4.0);
      scene.add(moon);
      planetMeshes.push({ mesh:moon, spin:0.024 });

      const pinkP = new THREE.Mesh(
        new THREE.SphereGeometry(0.20, 20, 20),
        new THREE.MeshStandardMaterial({ color:0xbe185d, emissive:0x831843, emissiveIntensity:1.0, roughness:0.5 })
      );
      pinkP.position.set(-6.5, -1.8, -4.5);
      scene.add(pinkP);
      planetMeshes.push({ mesh:pinkP, spin:0.008 });

      // Lighting
      scene.add(new THREE.AmbientLight(0x8b9bc8, 0.35));
      const l1 = new THREE.PointLight(0x818cf8, 3.5, 20); l1.position.set(0,2,2);
      const l2 = new THREE.PointLight(0x22d3ee, 2.0, 15); l2.position.set(4,-1,1);
      const l3 = new THREE.PointLight(0xa78bfa, 1.8, 12); l3.position.set(-3,2,-1);
      scene.add(l1, l2, l3);

      // Meteors
      type Meteor = { line: InstanceType<typeof THREE.Line>; mat: InstanceType<typeof THREE.LineBasicMaterial>; dir: InstanceType<typeof THREE.Vector3>; speed: number; life: number; maxLife: number };
      const meteors: Meteor[] = [];
      const spawnMeteor = () => {
        const length = 0.6 + Math.random() * 1.6;
        const dir = new THREE.Vector3(
          -(0.3 + Math.random() * 0.7), -(0.05 + Math.random() * 0.4), -(0.05 + Math.random() * 0.25)
        ).normalize();
        const start = new THREE.Vector3(2 + Math.random() * 9, 1 + Math.random() * 6, (Math.random()-0.5) * 7);
        const end = start.clone().addScaledVector(dir, length);
        const points = [];
        const SEG = 10;
        for (let i=0;i<=SEG;i++) points.push(start.clone().lerp(end, i/SEG));
        const geo  = new THREE.BufferGeometry().setFromPoints(points);
        const cols = new Float32Array((SEG+1)*3);
        for (let i=0;i<=SEG;i++) {
          const t=i/SEG;
          cols[i*3]=0.75+t*0.25; cols[i*3+1]=0.85+t*0.10; cols[i*3+2]=1.0;
        }
        geo.setAttribute("color", new THREE.BufferAttribute(cols,3));
        const mat  = new THREE.LineBasicMaterial({ vertexColors:true, transparent:true, opacity:0.9 });
        const line = new THREE.Line(geo, mat);
        scene.add(line);
        meteors.push({ line, mat, dir, speed:0.05+Math.random()*0.08, life:0, maxLife:45+Math.random()*55 });
      };
      for (let i=0;i<5;i++) setTimeout(()=>spawnMeteor(), i*700);

      const onMouseMove = (e: MouseEvent) => {
        const rect = mount.getBoundingClientRect();
        mouse.targetX = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
        mouse.targetY = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
      };
      window.addEventListener("mousemove", onMouseMove);

      const clock = new THREE.Clock();
      let meteorTimer = 0;

      const tick = () => {
        frameId = requestAnimationFrame(tick);
        const t = clock.getElapsedTime();

        mouse.x += (mouse.targetX - mouse.x) * 0.04;
        mouse.y += (mouse.targetY - mouse.y) * 0.04;

        galaxyGroup.rotation.y  = t * 0.030 + mouse.x * 0.08;
        galaxyGroup.rotation.x  = Math.sin(t * 0.018) * 0.04 - mouse.y * 0.05;

        planetMeshes.forEach(({ mesh, spin }) => {
          mesh.rotation.y += spin;
          mesh.position.y += Math.sin(t * 0.28 + mesh.uuid.charCodeAt(0) * 0.01) * 0.0006;
        });

        camera.position.x = Math.sin(t * 0.04) * 0.5 + mouse.x * 0.35;
        camera.position.y = 3.5 + Math.sin(t * 0.035) * 0.25 - mouse.y * 0.25;
        camera.lookAt(0, 0, 0);

        meteorTimer++;
        if (meteorTimer > 95) { spawnMeteor(); meteorTimer = 0; }
        for (let i = meteors.length-1; i>=0; i--) {
          const m = meteors[i];
          m.life++;
          m.line.position.addScaledVector(m.dir, m.speed);
          const p = m.life / m.maxLife;
          m.mat.opacity = p < 0.15 ? p/0.15 : 1-(p-0.15)/0.85;
          if (m.life >= m.maxLife) {
            scene.remove(m.line);
            m.line.geometry.dispose(); m.mat.dispose();
            meteors.splice(i, 1);
          }
        }

        renderer.render(scene, camera);
      };
      tick();

      const onResize = () => {
        if (!mount) return;
        const w = mount.clientWidth, h = mount.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener("resize", onResize);

      cleanup = () => {
        cancelAnimationFrame(frameId);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("mousemove", onMouseMove);
        renderer.dispose();
        if (mount && mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      };
    });

    return () => cleanup?.();
  }, []);

  return <div ref={mountRef} style={{ position: "absolute", inset: 0, zIndex: 0 }} />;
}
