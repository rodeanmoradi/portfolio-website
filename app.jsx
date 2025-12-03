import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

// Assets
import kalmanGif from '/assets/kalman.gif';
import robotDemoGif from '/assets/robot.gif';
const UofTLogo = "https://upload.wikimedia.org/wikipedia/en/0/04/Utoronto_coa.svg";
const roboticArmPic = '/assets/arm.png';
const gearboxGif = '/assets/gearbox.gif';

// --- Configuration ---
const ACCENT_COLOR_HEX = 0xffffff; // White
const PRIMARY_DARK_HEX = 0x020617; // #020617
const NUM_NODES = 150; 
const CONNECTION_DISTANCE = 200; 
const MOUSE_INTERACTION_RADIUS = 250; 

// --- HELPER: Font Loader & Global Styles ---
const FontLoader = () => (
  <style>
    {`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
      
      /* Force apply Inter to everything, with a fallback to system sans-serif */
      * {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
      }
      ::-webkit-scrollbar { width: 8px; }
      ::-webkit-scrollbar-track { background: #0f172a; }
      ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
      ::-webkit-scrollbar-thumb:hover { background: #334155; }
    `}
  </style>
);

// --- HELPER: Create Circular Texture ---
const createCircleTexture = () => {
  const canvas = document.createElement('canvas');
  const size = 64; 
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const center = size / 2;
  ctx.beginPath();
  ctx.arc(center, center, center - 2, 0, 2 * Math.PI); 
  ctx.fillStyle = '#ffffff'; 
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

// Create texture once outside component to avoid memory leaks on re-renders
const circleTexture = createCircleTexture();

// --- 3D Background Component ---
const ThreeBackground = ({ activeTab }) => {
  const containerRef = useRef(null);
  const sectionRotationTarget = useRef({ x: 0, y: 0 });

  useEffect(() => {
    switch(activeTab) {
        case 'home': sectionRotationTarget.current = { x: 0, y: 0 }; break;
        case 'about': sectionRotationTarget.current = { x: 0.1, y: 0.5 }; break;
        case 'experience': sectionRotationTarget.current = { x: 0, y: 1.0 }; break;
        case 'projects': sectionRotationTarget.current = { x: -0.1, y: 1.5 }; break;
        default: sectionRotationTarget.current = { x: 0, y: 0 }; break;
    }
  }, [activeTab]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(PRIMARY_DARK_HEX);
    scene.fog = new THREE.Fog(PRIMARY_DARK_HEX, 100, 2000);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 800;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const particleCount = NUM_NODES;
    const particlesData = []; 
    const particlesGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const maxConnections = particleCount * particleCount; 
    const linesGeometry = new THREE.BufferGeometry();
    const linesPositions = new Float32Array(maxConnections * 3);
    const linesColors = new Float32Array(maxConnections * 3);

    const r = 1200; 
    const rHalf = r / 2;

    for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * r - rHalf;
        const y = Math.random() * r - rHalf;
        const z = Math.random() * r - rHalf;

        particlePositions[i * 3] = x;
        particlePositions[i * 3 + 1] = y;
        particlePositions[i * 3 + 2] = z;

        particlesData.push({ velocity: new THREE.Vector3(0, 0, 0), numConnections: 0 });
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3).setUsage(THREE.DynamicDrawUsage));
    linesGeometry.setAttribute('position', new THREE.BufferAttribute(linesPositions, 3).setUsage(THREE.DynamicDrawUsage));
    linesGeometry.setAttribute('color', new THREE.BufferAttribute(linesColors, 3).setUsage(THREE.DynamicDrawUsage));

    const particlesMaterial = new THREE.PointsMaterial({
        color: ACCENT_COLOR_HEX,
        size: 6.5, 
        map: circleTexture, 
        alphaTest: 0.5,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.9, 
        sizeAttenuation: true
    });

    const linesMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        linewidth: 6, 
    });

    const pointCloud = new THREE.Points(particlesGeometry, particlesMaterial);
    const linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
    
    const group = new THREE.Group();
    group.add(pointCloud);
    group.add(linesMesh);
    scene.add(group);

    const mouse = new THREE.Vector2(-9999, -9999); 
    let mouseRotationX = 0;
    let mouseRotationY = 0;
    let currentSectionRotationX = 0;
    let currentSectionRotationY = 0;
    let scrollY = 0;

    const onDocumentMouseMove = (event) => {
        event.preventDefault();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        mouseRotationY = mouse.x * 0.2; 
        mouseRotationX = mouse.y * 0.2; 
    };

    const onDocumentScroll = () => { scrollY = window.scrollY; };

    document.addEventListener('mousemove', onDocumentMouseMove);
    document.addEventListener('scroll', onDocumentScroll);

    let animationFrameId;
    const _p1 = new THREE.Vector3();
    const _screenPos = new THREE.Vector3();

    const animate = () => {
        currentSectionRotationX += (sectionRotationTarget.current.x - currentSectionRotationX) * 0.02;
        currentSectionRotationY += (sectionRotationTarget.current.y - currentSectionRotationY) * 0.02;

        const scrollRotationFactor = scrollY * 0.001; 
        const finalTargetY = mouseRotationY + currentSectionRotationY;
        const finalTargetX = mouseRotationX + scrollRotationFactor + currentSectionRotationX;

        group.rotation.y += (finalTargetY - group.rotation.y) * 0.05;
        group.rotation.x += (finalTargetX - group.rotation.x) * 0.05;

        let vertexpos = 0;
        let colorpos = 0;
        let numConnected = 0;

        for (let i = 0; i < particleCount; i++) { particlesData[i].numConnections = 0; }

        for (let i = 0; i < particleCount; i++) {
            const particleData = particlesData[i];
            if (particleData.numConnections >= 20) continue;

            _p1.set(particlePositions[i * 3], particlePositions[i * 3 + 1], particlePositions[i * 3 + 2]);
            _p1.applyMatrix4(group.matrixWorld);
            _screenPos.copy(_p1).project(camera); 
            
            const distToMouse = Math.sqrt(Math.pow(_screenPos.x - mouse.x, 2) + Math.pow(_screenPos.y - mouse.y, 2));
            const ndcRadius = (MOUSE_INTERACTION_RADIUS / window.innerWidth) * 4;

            if (distToMouse > ndcRadius) continue;

            let mouseInteractionFactor = 1.0 - (distToMouse / ndcRadius);
            mouseInteractionFactor *= 2.0; 
            if (mouseInteractionFactor > 1.0) mouseInteractionFactor = 1.0;

            for (let j = i + 1; j < particleCount; j++) {
                const particleDataB = particlesData[j];
                if (particleDataB.numConnections >= 20) continue;

                const dx = particlePositions[i * 3] - particlePositions[j * 3];
                const dy = particlePositions[i * 3 + 1] - particlePositions[j * 3 + 1];
                const dz = particlePositions[i * 3 + 2] - particlePositions[j * 3 + 2];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < CONNECTION_DISTANCE) {
                    particleData.numConnections++;
                    particleDataB.numConnections++;

                    const structuralAlpha = 1.0 - dist / CONNECTION_DISTANCE;
                    let finalAlpha = structuralAlpha * mouseInteractionFactor;
                    if (finalAlpha > 1.0) finalAlpha = 1.0;
                    if (finalAlpha <= 0) continue;

                    linesPositions[vertexpos++] = particlePositions[i * 3];
                    linesPositions[vertexpos++] = particlePositions[i * 3 + 1];
                    linesPositions[vertexpos++] = particlePositions[i * 3 + 2];
                    linesPositions[vertexpos++] = particlePositions[j * 3];
                    linesPositions[vertexpos++] = particlePositions[j * 3 + 1];
                    linesPositions[vertexpos++] = particlePositions[j * 3 + 2];

                    const color = new THREE.Color(ACCENT_COLOR_HEX);
                    linesColors[colorpos++] = color.r * finalAlpha;
                    linesColors[colorpos++] = color.g * finalAlpha;
                    linesColors[colorpos++] = color.b * finalAlpha;
                    linesColors[colorpos++] = color.r * finalAlpha;
                    linesColors[colorpos++] = color.g * finalAlpha;
                    linesColors[colorpos++] = color.b * finalAlpha;

                    numConnected++;
                }
            }
        }

        linesMesh.geometry.setDrawRange(0, numConnected * 2);
        linesMesh.geometry.attributes.position.needsUpdate = true;
        linesMesh.geometry.attributes.color.needsUpdate = true;
        pointCloud.geometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('mousemove', onDocumentMouseMove);
        document.removeEventListener('scroll', onDocumentScroll);
        cancelAnimationFrame(animationFrameId);
        if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
            containerRef.current.removeChild(renderer.domElement);
        }
        particlesGeometry.dispose();
        linesGeometry.dispose();
        particlesMaterial.dispose();
        linesMaterial.dispose();
        renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 z-0" />;
};

// --- UI Components ---

const Card = ({ children, delay = 0, onClick }) => (
  <motion.div 
    className={`w-full max-w-3xl bg-slate-900/70 backdrop-blur-sm p-6 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all duration-300 ${onClick ? 'cursor-pointer' : ''}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    whileHover={{ boxShadow: `0 0 5px #3B82F6, 0 0 15px #3B82F633`, scale: 1.01 }}
    onClick={onClick}
  >
    {children}
  </motion.div>
);

const SectionContainer = ({ children, className = "" }) => (
    <motion.div
        initial={{ opacity: 0, x: 0 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 0 }}
        transition={{ duration: 0.3 }}
        className={`w-full max-w-4xl mx-auto pt-24 pb-12 px-4 min-h-[80vh] flex flex-col items-center justify-center gap-8 ${className}`}
    >
        {children}
    </motion.div>
);

// --- Lightbox/Modal Component ---

const Lightbox = ({ activeProject, onClose }) => {
  if (!activeProject) return null;

  const content = {
    roboticArm: {
        title: "6-DoF Robotic Arm",
        items: [
          {
            title: "Final CAD",
            url: roboticArmPic,
            desc: "Finished CAD file of the robotic arm."
          }
        ]
      },
    gearbox: {
    title: "Gearbox Demo",
    items: [
        {
        title: "Working Drill Input Demonstration",
        url: gearboxGif,
        desc: "Demo of the gearbox using a drill for power transmission."
        }
    ]
    },
    robot: {
      title: "Self-Balancing Robot Demos",
      items: [
        {
          title: "Kalman Filter Performance",
          url: kalmanGif,
          desc: "Visualization of raw sensor data versus Kalman-filtered estimate."
        },
        {
          title: "Physical Demonstration",
          url: robotDemoGif,
          desc: "Robot balancing without human intervention."
        }
      ]
    },
    boxing: {
      title: "ML Boxing Coach Demos",
      items: [
        {
          title: "Pose Detection Visualization",
          url: "https://placehold.co/800x600/1E3A8A/FFFFFF?text=MoveNet+Pose+Tracking",
          desc: "Real-time MoveNet Thunder skeletal tracking on video feed."
        },
        {
          title: "Classification Analysis",
          url: "https://placehold.co/800x600/1E3A8A/FFFFFF?text=Punch+Classification+Matrix",
          desc: "Confusion matrix showing 84% accuracy across 6 punch types."
        }
      ]
    }
  };

  const projectContent = content[activeProject];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-slate-950/95 backdrop-blur-sm z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-slate-900/90 p-8 rounded-xl max-w-5xl w-11/12 max-h-[90vh] overflow-y-auto border border-blue-500/50 shadow-2xl relative"
          initial={{ scale: 0.8, y: -50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="absolute top-4 right-4 text-gray-400 hover:text-blue-400 transition duration-200 p-2" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>

          <h2 className="text-3xl font-bold text-white mb-6 border-b-2 border-slate-700 pb-3">{projectContent?.title}</h2>
          
          <div className="space-y-8">
            {projectContent?.items.map((item, index) => (
              <div key={index}>
                <h3 className="text-xl font-semibold mb-3 text-blue-400">{item.title}</h3>
                <img src={item.url} alt={item.title} className="w-full h-auto rounded-lg border border-slate-700 shadow-lg" />
                <p className="text-gray-400 text-sm mt-2 text-center">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// --- Page Views ---

const HomeView = () => (
    <SectionContainer className="text-center">
        <motion.div 
            className="space-y-8 max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <motion.h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight" style={{ textShadow: '0 0 30px rgba(59, 130, 246, 0.4)' }}>
                Rodean Moradi
            </motion.h1>
            <motion.p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-white bg-clip-text text-transparent">
                Robotics Engineer | UofT Mechanical Engineering
            </motion.p>
        </motion.div>
    </SectionContainer>
);

const AboutView = () => (
    <SectionContainer>
        <h2 className="text-3xl font-bold text-white mb-6 border-b-2 border-blue-500/30 pb-4 inline-block">About Me</h2>
        <Card>
            <div className="space-y-4 text-gray-300 leading-relaxed text-lg">
                <p>I'm a Mechanical Engineering student at the University of Toronto with a passion for robotics and autonomous systems.</p>
                <p>Eager to bridge the gap between hardware and software, I specialize in controls, computer vision, and machine learning. My interest lies in building intelligent systems that can solve cool problems in the physical world.</p>
                <p>When I'm not coding, you can find me lifting, grappling, or watching movies.</p>
            </div>
        </Card>
        <div className="flex flex-col md:flex-row items-center gap-6 w-full max-w-3xl mt-4">
            <motion.div 
                className="bg-slate-200/90 p-4 w-32 h-32 md:w-40 md:h-40 rounded-xl shadow-lg shadow-blue-500/10 flex-shrink-0 overflow-hidden flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <img src={UofTLogo} alt="University of Toronto" className="w-full h-full object-contain" />
            </motion.div>
            <div className="flex-grow w-full">
                <Card delay={0.3}>
                    <div className="flex flex-col h-full justify-center">
                        <h3 className="text-xl font-semibold text-white mb-1">Education</h3>
                        <p className="text-blue-400 font-medium text-lg">University of Toronto</p>
                        <p className="text-gray-300">BASc in Mechanical Engineering | 2024 - 2029</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <span className="text-xs bg-blue-500/10 text-blue-300 px-2 py-1 rounded border border-blue-500/20">Minor in Robotics & Mechatronics</span>
                            <span className="text-xs bg-blue-500/10 text-blue-300 px-2 py-1 rounded border border-blue-500/20">Minor in AI Engineering</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    </SectionContainer>
);

const ProjectsView = ({ onOpenProject }) => (
    <SectionContainer>
        <h2 className="text-3xl font-bold text-white mb-6 border-b-2 border-blue-500/30 pb-4 inline-block">Featured Projects</h2>
        
        {/* Project 1*/}
        <Card onClick={() => onOpenProject('boxing')} delay={0.1}>
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-2xl font-semibold text-white">ML Boxing Coach (COMING SOON!)</h3>
                <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded font-bold border border-blue-500/30">ML/CV</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">Python, OpenCV, TensorFlow, PyTorch</p>
            <ul className="space-y-3 text-gray-300 list-disc pl-5 text-sm mb-6 leading-relaxed">
                <li>Building a real-time boxing punch classification system (6 types) using <span className="text-white font-semibold">TensorFlow Lite's MoveNet Thunder</span> for pose keypoint extraction (25-30 FPS).</li>
                <li>Training a custom <span className="text-white font-semibold">PyTorch classifier</span> achieving <span className="text-white font-semibold">X% accuracy</span> on 2,000-5,000 labeled punch samples.</li>
                <li>Engineering a low-latency inference pipeline, maintaining end-to-end prediction latency under <span className="text-white font-semibold">X ms</span>.</li>
            </ul>
            <div className="flex justify-end items-center text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors">
                <span className="mr-2">Click For Demo</span>
                <a 
                    href="https://github.com/rodeanmoradi/boxing-classification" 
                    target="_blank" 
                    onClick={(e) => e.stopPropagation()} 
                    className="flex items-center border-b border-transparent hover:border-white ml-2 text-blue-400 hover:text-white transition duration-300"
                >
                    Code
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 ml-1"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.37-1-3.3.26-.52.26-1.42 0-2.05 0 0-1.5-.5-5 1.5-1.2-.35-2.4-.35-3.6 0-3.5-2-5-1.5-5-1.5-.27.63-.27 1.53 0 2.05-.73.93-1.08 2.05-1 3.3 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.25.86-.55 2.51-1 3.5v1"/></svg>
                </a>
            </div>
        </Card>

        {/* Project 2 - Robotic Arm */}
        <Card onClick={() => onOpenProject('roboticArm')} delay={0.15}>
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-2xl font-semibold text-white">6-DoF Robotic Arm</h3>
                <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded font-bold border border-blue-500/30">Mechanical Design</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">SolidWorks</p>
            <ul className="space-y-3 text-gray-300 list-disc pl-5 text-sm mb-6 leading-relaxed">
                <li>Utilized <span className="text-white font-semibold">SolidWorks</span> to design a 6-DoF robotic arm for cinematography alongside a group of 4 other mechanical engineering students.</li>
                <li>Adhered to engineering specifications and effectively followed the <span className="text-white font-semibold">engineering design process</span>.</li>
                <li>Gained an understanding of <span className="text-white font-semibold">robotics hardware</span> that will prove essential to writing effective code that works in unison with physical components.</li>
            </ul>
            <div className="flex justify-end items-center text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors">
                <span className="mr-2">Click For Demo</span>
            </div>
        </Card>

        {/* Project 3 - Gearbox */}
        <Card onClick={() => onOpenProject('gearbox')} delay={0.2}>
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-2xl font-semibold text-white">Two-Stage Reduction Gearbox</h3>
                <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded font-bold border border-blue-500/30">Mechanical Design</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">SolidWorks, FDM 3D Printing</p>
            <ul className="space-y-3 text-gray-300 list-disc pl-5 text-sm mb-6 leading-relaxed">
                <li>Designed and 3D printed a <span className="text-white font-semibold">14:1 speed reducing gearbox</span> using SolidWorks.</li>
                <li>Strengthened <span className="text-white font-semibold">mechanical design fundamentals</span>, laying the necessary framework to develop code that reflects the hardware it will run on for future projects and endeavours.</li>
            </ul>
            <div className="flex justify-end items-center text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors">
                <span className="mr-2">Click For Demo</span>
            </div>
        </Card>

        {/* Project 4 - Robot */}
        <Card onClick={() => onOpenProject('robot')} delay={0.25}>
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-2xl font-semibold text-white">Self-Balancing Robot</h3>
                <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded font-bold border border-blue-500/30">Controls/State Estimation</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">C++, Arduino, Eigen, PID Control, Kalman Filter</p>
            <ul className="space-y-3 text-gray-300 list-disc pl-5 text-sm mb-6 leading-relaxed">
                <li>Developed an embedded control pipeline in <span className="text-white font-semibold">C++ on Arduino</span> with a consistent <span className="text-white font-semibold">100 Hz loop rate (10ms latency)</span>.</li>
                <li>Engineered a custom <span className="text-white font-semibold">Kalman Filter</span> using the <span className="text-white font-semibold">Eigen library</span> to fuse IMU data, providing a robust ±2° tilt estimate.</li>
                <li>Implemented and fine-tuned a <span className="text-white font-semibold">PID control algorithm</span> to successfully achieve stable self-balancing within ±15° of vertical.</li>
            </ul>
            <div className="flex justify-end items-center text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors">
                <span className="mr-2">Click For Demo</span>
                <a 
                    href="https://github.com/rodeanmoradi/self-balancing-bot" 
                    target="_blank" 
                    onClick={(e) => e.stopPropagation()} 
                    className="flex items-center border-b border-transparent hover:border-white ml-2 text-blue-400 hover:text-white transition duration-300"
                >
                    Code
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 ml-1"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.37-1-3.3.26-.52.26-1.42 0-2.05 0 0-1.5-.5-5 1.5-1.2-.35-2.4-.35-3.6 0-3.5-2-5-1.5-5-1.5-.27.63-.27 1.53 0 2.05-.73.93-1.08 2.05-1 3.3 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.25.86-.55 2.51-1 3.5v1"/></svg>
                </a>
            </div>
        </Card>
    </SectionContainer>
);

const ExperienceView = () => (
    <SectionContainer>
        <h2 className="text-3xl font-bold text-white mb-6 border-b-2 border-blue-500/30 pb-4 inline-block">Experience</h2>
        <Card delay={0.1}>
            <div className="mb-3">
                <h3 className="text-2xl font-semibold text-white">Robotics Software Engineer | Driverless Controls</h3>
            </div>
            <p className="text-sm mb-4 text-gray-400">University of Toronto Formula Racing | Sep. 2024 - Present</p>
            <ul className="space-y-3 text-gray-300 list-disc pl-5 text-sm leading-relaxed">
                <li>Enabled high-speed path tracking up to <span className="text-white font-medium">20 km/h</span> for an autonomous race car competing in FSAE and Formula Student by contributing to development of a <span className="text-white font-medium">Linear Time-Varying Model Predictive Control (LTV-MPC)</span> algorithm using <span className="text-white font-medium">C++</span> and <span className="text-white font-medium">ROS2</span>.</li>
                <li>Reduced path deviation by <span className="text-white font-medium">40%</span>, eliminated oscillations, and improved cornering stability by tuning MPC controller gains, optimizing cost function parameters, and custom simulations in <span className="text-white font-medium">RViz</span> and <span className="text-white font-medium">Gazebo</span>.</li>
                <li>Streamlined adoption of LTV-MPC as the 2026 controller by conducting literature review and comparative analysis of <span className="text-white font-medium">4+ control algorithms (Stanley, PID, Pure Pursuit, MPC variants)</span>.</li>
            </ul>
        </Card>
        <Card delay={0.2}>
            <div className="mb-3">
                <h3 className="text-2xl font-semibold text-white">Research Intern | EV Batteries and Chargers</h3>
            </div>
            <p className="text-sm mb-4 text-gray-400">ATOMS Laboratory | May - Aug. 2025</p>
            <ul className="space-y-3 text-gray-300 list-disc pl-5 text-sm leading-relaxed">
                <li>Reduced manual analysis time of 1000+ row datasets by <span className="text-white font-medium">5x</span> and informed lithium-ion battery models by automating CSV file processing via <span className="text-white font-medium">Python</span> scripts using <span className="text-white font-medium">Pandas and Matplotlib</span>.</li>
                <li>Validated thermal and physical battery models within <span className="text-white font-medium">3%</span> error through simulations and data analysis using <span className="text-white font-medium">COMSOL Multiphysics</span> and <span className="text-white font-medium">Python</span>.</li>
                <li>Acquired <span className="text-white font-medium">200+ hours</span> of battery data for high-performance motorsport applications from cell-cycling tests using commercial-grade battery testing equipment and integrated software.</li>
                <li>Improved testing reliability by designing and 3D printing safety components, meeting requirements through iterative prototyping in <span className="text-white font-medium">SolidWorks</span>.</li>
            </ul>
        </Card>
    </SectionContainer>
);

// --- Main App Component ---
const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [activeProject, setActiveProject] = useState(null); // Changed to handle project ID string or null
  const tabs = [{ id: 'about', label: 'About' }, { id: 'experience', label: 'Experience' }, { id: 'projects', label: 'Projects' }];

  return (
    <div className="bg-slate-950 text-gray-200 min-h-screen overflow-hidden selection:bg-blue-500 selection:text-white flex flex-col">
      <FontLoader />
      <ThreeBackground activeTab={activeTab} />
      <nav className="fixed top-0 left-0 w-full bg-slate-950/80 backdrop-blur-md z-40 border-b-2 border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center cursor-pointer px-4 py-2 rounded-lg transition-all duration-300 hover:bg-white/5" onClick={() => setActiveTab('home')}>
                    <span className="text-lg font-normal text-white tracking-wider">Rodean Moradi</span>
                </div>
                <div className="flex space-x-1 sm:space-x-4">
                    {tabs.map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative ${activeTab === tab.id ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                            {tab.label}
                            {activeTab === tab.id && <motion.div layoutId="activeTab" className="absolute inset-0 bg-blue-500/10 rounded-lg border border-blue-500/30 -z-10" transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </nav>
      <main className="relative z-10 flex-grow pt-16 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-blue-900 scrollbar-track-transparent">
        <AnimatePresence mode="wait">
            {activeTab === 'home' && <HomeView key="home" />}
            {activeTab === 'about' && <AboutView key="about" />}
            {activeTab === 'experience' && <ExperienceView key="experience" />}
            {activeTab === 'projects' && <ProjectsView key="projects" onOpenProject={setActiveProject} />}
        </AnimatePresence>
        <footer className="text-center py-8 text-gray-500 text-xs">
            <div className="flex justify-center space-x-4 mb-4">
                <a href="https://linkedin.com/in/rodean-moradi/" target="_blank" rel="noopener noreferrer" className="text-base text-gray-400 hover:text-blue-400 transition duration-300 flex items-center justify-center group bg-slate-800/50 p-3 rounded-full border border-slate-700 hover:border-blue-500/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
                <a href="https://github.com/rodeanmoradi" target="_blank" rel="noopener noreferrer" className="text-base text-gray-400 hover:text-blue-400 transition duration-300 flex items-center justify-center group bg-slate-800/50 p-3 rounded-full border border-slate-700 hover:border-blue-500/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.37-1-3.3.26-.52.26-1.42 0-2.05 0 0-1.5-.5-5 1.5-1.2-.35-2.4-.35-3.6 0-3.5-2-5-1.5-5-1.5-.27.63-.27 1.53 0 2.05-.73.93-1.08 2.05-1 3.3 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.25.86-.55 2.51-1 3.5v1"/></svg>
                </a>
            </div>
            <p>Rodean Moradi | rodean.moradi@mail.utoronto.ca</p>
        </footer>
      </main>
      <Lightbox activeProject={activeProject} onClose={() => setActiveProject(null)} />
    </div>
  );
};

export default App;