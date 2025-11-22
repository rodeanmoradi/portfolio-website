import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

// --- Configuration ---
const ACCENT_COLOR_HEX = 0x3B82F6; // #3B82F6
const PRIMARY_DARK_HEX = 0x020617; // #020617
const NUM_NODES = 100;
const CONNECTION_DISTANCE = 150;

// --- 3D Background Component (Pure Three.js) ---
const ThreeBackground = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Setup Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(PRIMARY_DARK_HEX);
    scene.fog = new THREE.Fog(PRIMARY_DARK_HEX, 100, 500);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 300;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Performance optimization
    containerRef.current.appendChild(renderer.domElement);

    // 2. Create Geometry (Points)
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = NUM_NODES;
    const posArray = new Float32Array(particlesCount * 3);
    
    // Store original positions for floating animation
    const originalPositions = [];

    for(let i = 0; i < particlesCount * 3; i+=3) {
        const x = (Math.random() - 0.5) * 800;
        const y = (Math.random() - 0.5) * 600;
        const z = (Math.random() - 0.5) * 400;
        
        posArray[i] = x;
        posArray[i+1] = y;
        posArray[i+2] = z;

        originalPositions.push({x, y, z, phase: Math.random() * Math.PI * 2});
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    // Material
    const particlesMaterial = new THREE.PointsMaterial({
        size: 3,
        color: ACCENT_COLOR_HEX,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });

    // Mesh
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // 3. Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    const onDocumentMouseMove = (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    };

    document.addEventListener('mousemove', onDocumentMouseMove);

    // 4. Animation Loop
    const clock = new THREE.Clock();
    let animationFrameId;

    const animate = () => {
        const elapsedTime = clock.getElapsedTime();

        targetX = mouseX * 0.05;
        targetY = mouseY * 0.05;

        // Rotate scene slightly based on mouse
        particlesMesh.rotation.y += 0.05 * (targetX * 0.01 - particlesMesh.rotation.y);
        particlesMesh.rotation.x += 0.05 * (targetY * 0.01 - particlesMesh.rotation.x);

        // Float Animation
        const positions = particlesGeometry.attributes.position.array;
        for(let i = 0; i < particlesCount; i++) {
            const i3 = i * 3;
            const original = originalPositions[i];
            
            // Gentle sine wave float
            positions[i3 + 1] = original.y + Math.sin(elapsedTime * 0.5 + original.phase) * 10;
        }
        particlesGeometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // 5. Resize Handler
    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('mousemove', onDocumentMouseMove);
        cancelAnimationFrame(animationFrameId);
        if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
            containerRef.current.removeChild(renderer.domElement);
        }
        particlesGeometry.dispose();
        particlesMaterial.dispose();
        renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 z-0" />;
};

// --- UI Components ---

const SectionTitle = ({ children, id }) => (
  <motion.h2 
    id={id}
    className="text-2xl font-bold text-center pt-10 mb-12" 
    style={{ color: '#3B82F6' }}
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.8 }}
  >
    {children}
  </motion.h2>
);

const Card = ({ children, delay = 0, onClick }) => (
  <motion.div 
    className={`w-full max-w-2xl bg-slate-900/70 backdrop-blur-sm p-6 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all duration-300 ${onClick ? 'cursor-pointer' : ''}`}
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.6, delay }}
    whileHover={{ 
        boxShadow: `0 0 5px #3B82F6, 0 0 15px #3B82F633`, 
        scale: 1.01 
    }}
    onClick={onClick}
  >
    {children}
  </motion.div>
);

const SkillPill = ({ children }) => (
  <motion.span
    className="inline-block px-3 py-1 text-xs font-medium bg-slate-700 text-blue-400 rounded-full transition duration-300 ease-in-out hover:bg-blue-500 hover:text-slate-900"
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true, amount: 0.8 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.span>
);

// --- Lightbox/Modal Component ---

const Lightbox = ({ isVisible, onClose }) => {
  // Placeholder URLs to prevent broken images if uploads are missing
  const robotDemoUrl = "https://placehold.co/800x600/1E3A8A/FFFFFF?text=Self-Balancing+Robot+Demo"; 
  const kalmanDemoUrl = "https://placehold.co/800x600/1E3A8A/FFFFFF?text=Kalman+Filter+Graph";

  return (
    <AnimatePresence>
      {isVisible && (
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

            <h2 className="text-3xl font-bold text-white mb-6 border-b border-slate-700 pb-3">Self-Balancing Robot Demos</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-blue-400">Physical Demonstration</h3>
                <img src={robotDemoUrl} alt="Self-Balancing Robot in action" className="w-full h-auto rounded-lg border border-slate-700 shadow-lg" />
                <p className="text-gray-400 text-sm mt-2 text-center">Stable self-balancing within ±15° of vertical.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-blue-400">Kalman Filter Performance</h3>
                <img src={kalmanDemoUrl} alt="Kalman Filter data smoothing demonstration" className="w-full h-auto rounded-lg border border-slate-700 shadow-lg" />
                <p className="text-gray-400 text-sm mt-2 text-center">Visualization of raw sensor data versus Kalman-filtered estimate.</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Main App Component ---
const App = () => {
  const [isLightboxVisible, setIsLightboxVisible] = useState(false);
  const heroRef = useRef(null);
  const [showNav, setShowNav] = useState(false);

  // Scroll listener for sticky navigation
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const heroBottom = heroRef.current.offsetHeight;
        setShowNav(window.scrollY > heroBottom * 0.8);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ fontFamily: '"JetBrains Mono", monospace' }} className="bg-slate-950 text-gray-200 min-h-screen overflow-x-hidden selection:bg-blue-500 selection:text-white">
      
      {/* 3D Background */}
      <ThreeBackground />

      {/* Sticky Navigation Bar */}
      <motion.nav
        className="fixed top-0 left-0 w-full bg-slate-950/80 backdrop-blur-md z-40 border-b border-white/5"
        initial={false}
        animate={{ y: showNav ? 0 : '-100%' }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
                <div className="flex items-center">
                    <span className="text-sm font-bold text-white tracking-wider">R. MORADI</span>
                </div>
                <div className="flex space-x-4">
                    <a href="#projects" className="text-sm font-medium text-gray-300 hover:text-blue-400 transition duration-300">Projects</a>
                    <a href="#experience" className="text-sm font-medium text-gray-300 hover:text-blue-400 transition duration-300">Experience</a>
                    <a href="#skills" className="text-sm font-medium text-gray-300 hover:text-blue-400 transition duration-300">Skills</a>
                </div>
            </div>
        </div>
      </motion.nav>

      {/* Main Content Overlay */}
      <div className="relative z-10 min-h-screen pt-4 pb-20 max-w-7xl mx-auto">

        {/* Hero Section */}
        <header ref={heroRef} className="text-center py-24 md:py-32 space-y-6 px-4">
            <motion.h1 
                className="text-4xl md:text-6xl font-extrabold text-white tracking-tight"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{ textShadow: '0 0 20px rgba(59, 130, 246, 0.5)' }}
            >
                Rodean Moradi
            </motion.h1>
            <motion.p 
                className="text-lg md:text-xl font-light text-blue-400"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                Robotics & AI Engineer | U of T Mechanical Engineering
            </motion.p>
            <motion.div 
                className="flex justify-center space-x-6 pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <a href="https://linkedin.com/in/rodean-moradi/" target="_blank" className="text-sm text-gray-300 hover:text-blue-400 transition duration-300 flex items-center group">
                    <span className="bg-slate-800 p-2 rounded-full mr-2 group-hover:bg-blue-500/20 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                    </span>
                    LinkedIn
                </a>
                <a href="https://github.com/rodeanmoradi" target="_blank" className="text-sm text-gray-300 hover:text-blue-400 transition duration-300 flex items-center group">
                    <span className="bg-slate-800 p-2 rounded-full mr-2 group-hover:bg-blue-500/20 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.37-1-3.3.26-.52.26-1.42 0-2.05 0 0-1.5-.5-5 1.5-1.2-.35-2.4-.35-3.6 0-3.5-2-5-1.5-5-1.5-.27.63-.27 1.53 0 2.05-.73.93-1.08 2.05-1 3.3 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.25.86-.55 2.51-1 3.5v1"/></svg>
                    </span>
                    GitHub
                </a>
            </motion.div>
        </header>

        {/* Projects Section */}
        <section className="mb-20 pt-10 px-4">
            <SectionTitle id="projects">Featured Projects</SectionTitle>
            <div className="flex flex-col items-center gap-8">
                
                {/* Project 1 */}
                <Card>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold text-white">ML Boxing Coach</h3>
                        <span className="bg-blue-500/10 text-blue-400 text-xs px-2 py-1 rounded">AI/CV</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-4">Python, OpenCV, TensorFlow, PyTorch</p>
                    <ul className="space-y-2 text-gray-300 list-disc pl-5 text-sm mb-4">
                        <li>Built a real-time boxing punch classification system (6 types) using **TensorFlow Lite's MoveNet Thunder** for pose keypoint extraction (25-30 FPS).</li>
                        <li>Trained a custom **PyTorch classifier** achieving **84% accuracy** on 2,000-5,000 labeled punch samples.</li>
                        <li>Engineered a low-latency inference pipeline, maintaining **end-to-end prediction latency under 70 ms**.</li>
                    </ul>
                    <div className="flex justify-end">
                        <a href="https://github.com/rodeanmoradi" target="_blank" className="text-sm font-medium text-blue-400 hover:text-white flex items-center transition duration-300">
                            View Code
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 ml-1"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.37-1-3.3.26-.52.26-1.42 0-2.05 0 0-1.5-.5-5 1.5-1.2-.35-2.4-.35-3.6 0-3.5-2-5-1.5-5-1.5-.27.63-.27 1.53 0 2.05-.73.93-1.08 2.05-1 3.3 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.25.86-.55 2.51-1 3.5v1"/></svg>
                        </a>
                    </div>
                </Card>

                {/* Project 2 - Clickable */}
                <Card onClick={() => setIsLightboxVisible(true)}>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold text-white">Self-Balancing Robot</h3>
                        <span className="bg-blue-500/10 text-blue-400 text-xs px-2 py-1 rounded">Embedded</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-4">C++, Arduino, Eigen, PID Control, Kalman Filter</p>
                    <ul className="space-y-2 text-gray-300 list-disc pl-5 text-sm mb-4">
                        <li>Developed an embedded control pipeline in **C++ on Arduino** with a consistent **100 Hz loop rate (10ms latency)**.</li>
                        <li>Engineered a custom **Kalman Filter** using the **Eigen library** to fuse IMU data, providing a robust ±2° tilt estimate.</li>
                        <li>Implemented and fine-tuned a **PID control algorithm** to successfully achieve stable self-balancing within ±15° of vertical.</li>
                    </ul>
                    <div className="flex justify-end items-center text-blue-400 text-sm font-medium">
                        <span className="mr-2">Click for Demos</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>
                    </div>
                </Card>

            </div>
        </section>

        {/* Experience Section */}
        <section id="experience" className="mb-20 pt-10 px-4">
            <SectionTitle>Experience & Skills</SectionTitle>
            {/* Updated to include flex flex-col items-center gap-8 for centering */}
            <div className="flex flex-col items-center gap-8 max-w-4xl mx-auto">
                
                {/* Experience 1 */}
                <Card>
                    <h3 className="text-lg font-semibold text-white">Robotics Software Engineer | Driverless Controls</h3>
                    <p className="text-sm mb-2 text-blue-400">University of Toronto Formula Racing, Toronto, ON | Sep. 2024 - Present</p>
                    <ul className="space-y-2 text-gray-300 list-disc pl-5 text-sm">
                        <li>Contributed to the development of a **Linear Time-Varying Model Predictive Control (LTV-MPC)** algorithm in C++ using **ROS2** for high-speed autonomous path tracking.</li>
                        <li>**Reduced path deviation by 40%** through comprehensive testing and simulation in RViz and Gazebo.</li>
                        <li>Conducted comparative analysis of 4+ control algorithms (Stanley, PID, Pure Pursuit, MPC variants) to support LTV-MPC adoption.</li>
                    </ul>
                </Card>

                {/* Experience 2 */}
                <Card delay={0.1}>
                    <h3 className="text-lg font-semibold text-white">Research Intern | EV Batteries and Chargers</h3>
                    <p className="text-sm mb-2 text-blue-400">ATOMS Laboratory, Toronto, ON | May - Aug. 2025</p>
                    <ul className="space-y-2 text-gray-300 list-disc pl-5 text-sm">
                        <li>Developed Python scripts with **Pandas and Matplotlib** to automate battery testing CSV processing, **reducing manual analysis time by 5x**.</li>
                        <li>Built multiphysics simulations in **COMSOL** to model thermal properties of Lithium-ion batteries, validating results within 3% error.</li>
                        <li>3D printed safety components designed in **SOLIDWORKS** to improve reliability during testing.</li>
                    </ul>
                </Card>

                {/* Skills */}
                <div id="skills" className="pt-10 w-full flex justify-center">
                    <Card delay={0.2}>
                        <h3 className="text-lg font-semibold text-white mb-4">Core Technical Skills</h3>
                        <div className="flex flex-wrap gap-3">
                            {["C/C++", "Python", "ROS2", "PyTorch & TensorFlow", "OpenCV", "Eigen & NumPy", "PID & MPC", "Kalman Filter", "Git/Github", "SolidWorks", "Linux/Ubuntu"].map((skill) => (
                                <SkillPill key={skill}>{skill}</SkillPill>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </section>

        {/* Footer */}
        <motion.footer 
            className="text-center py-8 border-t border-slate-800 mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ delay: 0.2 }}
        >
            <p className="text-gray-400 text-xs">Rodean Moradi | rodean.moradi@mail.utoronto.ca | +1-647-406-8858</p>
        </motion.footer>

      </div>

      {/* Lightbox Modal */}
      <Lightbox isVisible={isLightboxVisible} onClose={() => setIsLightboxVisible(false)} />
    </div>
  );
};

export default App;