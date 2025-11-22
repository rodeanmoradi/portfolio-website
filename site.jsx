<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rodean Moradi | Robotics & AI Engineer</title>
    <!-- Load Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Load Three.js -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <!-- Load JetBrains Mono Font -->
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    <style>
        /* Custom styles for the 3D canvas and overlay */
        #three-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: -1; /* Send to background */
        }
        .content-overlay {
            position: relative;
            z-index: 10; /* Keep content above the 3D scene */
            min-height: 100vh;
            padding: 2rem 1rem;
            /* Added backdrop blur to separate content from 3D background */
            backdrop-filter: blur(2px); 
            -webkit-backdrop-filter: blur(2px); /* For Safari support */
        }

        /* Subtle glowing text shadow for the main name */
        .glowing-text {
            /* Deeper glow effect */
            text-shadow: 0 0 8px rgba(59, 130, 246, 0.6), 0 0 20px rgba(59, 130, 246, 0.4);
        }
        
        /* 1. Scroll Fade Initial State */
        .scroll-fade {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }

        /* 2. Scroll Fade Visible State (when in viewport) */
        .scroll-fade.visible {
            opacity: 1;
            transform: translateY(0);
        }

        /* Scrollbar styling for dark theme */
        body::-webkit-scrollbar {
            width: 8px;
        }
        body::-webkit-scrollbar-track {
            background: #020617; /* New primary-dark */
        }
        body::-webkit-scrollbar-thumb {
            background-color: #4B5563; /* Gray-600 */
            border-radius: 4px;
        }

        /* Custom shadow for cards */
        .card-shadow-hover {
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* Default Tailwind shadow-lg */
            transition: all 0.3s ease-in-out;
        }
        .card-shadow-hover:hover {
            /* Layered shadow for a soft glow effect */
            box-shadow: 0 0 5px #3B82F6, 0 0 15px rgba(59, 130, 246, 0.4), 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
            border-color: #3B82F6;
        }

        /* Sticky Nav Bar styles */
        #sticky-nav {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            z-index: 40; /* Above content but below modal */
            transform: translateY(-100%);
            transition: transform 0.3s ease-out;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        #sticky-nav.scrolled {
            transform: translateY(0);
        }
    </style>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        // Apply JetBrains Mono globally
                        sans: ['"JetBrains Mono"', 'monospace'], 
                    },
                    colors: {
                        'primary-dark': '#020617', // Deep Navy/Near-Black (Slate 950)
                        'accent-main': '#3B82F6', // Blue (for nodes, lines, and headings)
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-primary-dark text-gray-200 font-sans antialiased">

    <!-- Sticky Navigation Bar (Hidden initially) -->
    <nav id="sticky-nav" class="bg-primary-dark/80 backdrop-blur-md">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-14">
                <div class="flex items-center">
                    <span class="text-sm font-bold text-white tracking-wider">R. MORADI</span>
                </div>
                <div class="flex space-x-4">
                    <a href="#projects" class="text-sm font-medium text-gray-300 hover:text-accent-main transition duration-300">Projects</a>
                    <a href="#experience" class="text-sm font-medium text-gray-300 hover:text-accent-main transition duration-300">Experience</a>
                    <a href="#skills" class="text-sm font-medium text-gray-300 hover:text-accent-main transition duration-300">Skills</a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Three.js Container -->
    <div id="three-container"></div>

    <!-- Main Content Overlay -->
    <div class="content-overlay max-w-7xl mx-auto">

        <!-- Header/Hero Section - This element is immediately visible, so no fade class needed -->
        <header id="hero-section" class="text-center py-16 md:py-24 space-y-4">
            <!-- Font size reduced from 4xl/6xl to 3xl/5xl -->
            <h1 class="text-3xl md:text-5xl font-extrabold text-white tracking-tight glowing-text">Rodean Moradi</h1>
            <!-- Font size reduced from lg/xl to base/lg -->
            <p class="text-base md:text-lg font-light text-accent-main">Robotics & AI Engineer | U of T Mechanical Engineering</p>
            <div class="flex justify-center space-x-6 pt-4">
                <!-- ACCESSIBILITY FIX: Changed text-gray-400 to text-gray-300 for better contrast -->
                <a href="https://linkedin.com/in/rodean-moradi/" target="_blank" class="text-sm text-gray-300 hover:text-accent-main transition duration-300 flex items-center">
                    <!-- Icon for LinkedIn (using Lucide style via Tailwind, but using simple SVG for reliability) -->
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 mr-2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                    LinkedIn
                </a>
                <!-- ACCESSIBILITY FIX: Changed text-gray-400 to text-gray-300 for better contrast -->
                <a href="https://github.com/rodeanmoradi" target="_blank" class="text-sm text-gray-300 hover:text-accent-main transition duration-300 flex items-center">
                    <!-- Icon for GitHub -->
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 mr-2"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.37-1-3.3.26-.52.26-1.42 0-2.05 0 0-1.5-.5-5 1.5-1.2-.35-2.4-.35-3.6 0-3.5-2-5-1.5-5-1.5-.27.63-.27 1.53 0 2.05-.73.93-1.08 2.05-1 3.3 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.25.86-.55 2.51-1 3.5v1"/></svg>
                    GitHub
                </a>
            </div>
        </header>

        <!-- Projects Section -->
        <section id="projects" class="mb-20 scroll-fade pt-10">
            <!-- Font size reduced from 3xl to 2xl -->
            <h2 class="text-2xl font-bold text-center mb-12 text-accent-main">Featured Projects</h2>
            <!-- Updated layout: flex column, centered, max width for cards -->
            <div class="flex flex-col items-center gap-8">

                <!-- Project 1: ML Boxing Coach -->
                <div class="w-full max-w-2xl bg-primary-dark/70 backdrop-blur-sm p-6 rounded-xl border border-gray-700 card-shadow-hover">
                    <h3 class="text-lg font-semibold mb-2 text-white">ML Boxing Coach</h3>
                    <p class="text-xs text-gray-400 mb-4">Python, OpenCV, TensorFlow, PyTorch</p>
                    <ul class="space-y-2 text-gray-300 list-disc pl-5 text-sm">
                        <li>Built a real-time boxing punch classification system (6 types) using **TensorFlow Lite's MoveNet Thunder** for pose keypoint extraction (25-30 FPS).</li>
                        <li>Trained a custom **PyTorch classifier** achieving **84% accuracy** on 2,000-5,000 labeled punch samples.</li>
                        <li>Engineered a low-latency inference pipeline, maintaining **end-to-end prediction latency under 70 ms**.</li>
                    </ul>
                    <!-- FIX: Added View Code Link -->
                    <div class="mt-4 flex justify-end">
                        <a href="https://github.com/rodeanmoradi" target="_blank" class="text-sm font-medium text-accent-main hover:underline flex items-center transition duration-300">
                            View Code
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 ml-1"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.37-1-3.3.26-.52.26-1.42 0-2.05 0 0-1.5-.5-5 1.5-1.2-.35-2.4-.35-3.6 0-3.5-2-5-1.5-5-1.5-.27.63-.27 1.53 0 2.05-.73.93-1.08 2.05-1 3.3 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.25.86-.55 2.51-1 3.5v1"/></svg>
                        </a>
                    </div>
                </div>

                <!-- Project 2: Self-Balancing Robot - NOW CLICKABLE -->
                <div id="self-balancing-card" class="w-full max-w-2xl bg-primary-dark/70 backdrop-blur-sm p-6 rounded-xl border border-gray-700 card-shadow-hover cursor-pointer" onclick="toggleLightbox(true)">
                    <h3 class="text-lg font-semibold mb-2 text-white">Self-Balancing Robot (Click for Demos)</h3>
                    <p class="text-xs text-gray-400 mb-4">C++, Arduino, Eigen, PID Control, Kalman Filter</p>
                    <ul class="space-y-2 text-gray-300 list-disc pl-5 text-sm">
                        <li>Developed an embedded control pipeline in **C++ on Arduino** with a consistent **100 Hz loop rate (10ms latency)**.</li>
                        <li>Engineered a custom **Kalman Filter** using the **Eigen library** to fuse IMU data, providing a robust $\pm2^{\circ}$ tilt estimate.</li>
                        <li>Implemented and fine-tuned a **PID control algorithm** to successfully achieve stable self-balancing within $\pm15^{\circ}$ of vertical.</li>
                    </ul>
                    <!-- FIX: Added View Code Link -->
                    <div class="mt-4 flex justify-end">
                        <a href="https://github.com/rodeanmoradi" target="_blank" class="text-sm font-medium text-accent-main hover:underline flex items-center transition duration-300">
                            View Code
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 ml-1"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.37-1-3.3.26-.52.26-1.42 0-2.05 0 0-1.5-.5-5 1.5-1.2-.35-2.4-.35-3.6 0-3.5-2-5-1.5-5-1.5-.27.63-.27 1.53 0 2.05-.73.93-1.08 2.05-1 3.3 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.25.86-.55 2.51-1 3.5v1"/></svg>
                        </a>
                    </div>
                </div>

            </div>
        </section>

        <!-- Experience/Summary Section -->
        <section id="experience" class="mb-20 scroll-fade pt-10">
            <!-- Font size reduced from 3xl to 2xl -->
            <h2 class="text-2xl font-bold text-center mb-12 text-accent-main">Experience & Skills</h2>
            <div class="space-y-8 max-w-4xl mx-auto">

                <!-- NEW/UPDATED: Experience Block 1: U of T Formula Racing -->
                <div class="bg-primary-dark/70 backdrop-blur-sm p-6 rounded-xl border border-gray-700 card-shadow-hover">
                    <h3 class="text-lg font-semibold text-white">Robotics Software Engineer | Driverless Controls</h3>
                    <p class="text-accent-main mb-2 text-sm">University of Toronto Formula Racing, Toronto, ON | Sep. 2024 - Present</p>
                    <ul class="space-y-2 text-gray-300 list-disc pl-5 text-sm">
                        <li>Contributed to the development of a **Linear Time-Varying Model Predictive Control (LTV-MPC)** algorithm in C++ using **ROS2** for high-speed autonomous path tracking.</li>
                        <li>**Reduced path deviation by 40%** through comprehensive testing and simulation in RViz and Gazebo.</li>
                        <li>Conducted comparative analysis of 4+ control algorithms (Stanley, PID, Pure Pursuit, MPC variants) to support LTV-MPC adoption.</li>
                    </ul>
                </div>

                <!-- Experience Block 2: ATOMS Laboratory (formerly Block 1) -->
                <div class="bg-primary-dark/70 backdrop-blur-sm p-6 rounded-xl border border-gray-700 card-shadow-hover">
                    <h3 class="text-lg font-semibold text-white">Research Intern | EV Batteries and Chargers</h3>
                    <p class="text-accent-main mb-2 text-sm">ATOMS Laboratory, Toronto, ON | May - Aug. 2025</p>
                    <ul class="space-y-2 text-gray-300 list-disc pl-5 text-sm">
                        <li>Developed Python scripts with **Pandas and Matplotlib** to automate battery testing CSV processing, **reducing manual analysis time by 5x**.</li>
                        <li>Built multiphysics simulations in **COMSOL** to model thermal properties of Lithium-ion batteries, validating results within 3% error.</li>
                        <li>3D printed safety components designed in **SOLIDWORKS** to improve reliability during testing.</li>
                    </ul>
                </div>

                <!-- Skills Block -->
                <div id="skills" class="bg-primary-dark/70 backdrop-blur-sm p-6 rounded-xl border border-gray-700 card-shadow-hover pt-10">
                    <h3 class="text-lg font-semibold text-white mb-4">Core Technical Skills</h3>
                    <div class="flex flex-wrap gap-3">
                        <!-- The classes for skill-pill are now applied directly in the element attributes below -->
                        <span class="skill-pill text-xs">C/C++</span>
                        <span class="skill-pill text-xs">Python</span>
                        <span class="skill-pill text-xs">ROS2</span>
                        <span class="skill-pill text-xs">PyTorch & TensorFlow</span>
                        <span class="skill-pill text-xs">OpenCV</span>
                        <span class="skill-pill text-xs">Eigen & NumPy</span>
                        <span class="skill-pill text-xs">PID & MPC</span>
                        <span class="skill-pill text-xs">Kalman Filter</span>
                        <span class="skill-pill text-xs">Git/Github</span>
                        <span class="skill-pill text-xs">SolidWorks</span>
                        <span class="skill-pill text-xs">Linux/Ubuntu</span>
                    </div>
                </div>

            </div>
        </section>

        <!-- Footer -->
        <footer class="text-center py-8 border-t border-gray-800 mt-12 scroll-fade">
            <!-- ACCESSIBILITY FIX: Changed text-gray-500 to text-gray-300 for better contrast -->
            <p class="text-gray-300 text-xs">Rodean Moradi | rodean.moradi@mail.utoronto.ca | +1-647-406-8858</p>
        </footer>

    </div>

    <!-- Lightbox/Modal for Project Demos -->
    <div id="lightbox" class="fixed inset-0 bg-primary-dark/95 backdrop-blur-sm z-50 flex items-center justify-center hidden opacity-0 transition-opacity duration-500" onclick="toggleLightbox(false)">
        <div class="bg-primary-dark/90 p-8 rounded-xl max-w-5xl w-11/12 max-h-[90vh] overflow-y-auto border border-accent-main/50 shadow-2xl shadow-accent-main/20 relative" onclick="event.stopPropagation()">
            
            <button class="absolute top-4 right-4 text-gray-400 hover:text-accent-main transition duration-200 p-2" onclick="toggleLightbox(false)">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <h2 class="text-3xl font-bold text-white mb-6 border-b border-gray-700 pb-3">Self-Balancing Robot Demos</h2>
            
            <div class="space-y-8">
                
                <!-- GIF 1: Robot Demo - Using placeholder as uploaded file cannot be displayed directly -->
                <div>
                    <h3 class="text-xl font-semibold text-accent-main mb-3">Physical Demonstration</h3>
                    <img 
                        src="https://placehold.co/800x600/1E3A8A/FFFFFF?text=Self-Balancing+Robot+Demo+(1).gif" 
                        alt="Self-Balancing Robot in action" 
                        class="w-full h-auto rounded-lg border border-gray-700 shadow-lg"
                    >
                    <p class="text-gray-400 text-sm mt-2 text-center">Stable self-balancing within $\pm15^{\circ}$ of vertical.</p>
                </div>

                <!-- GIF 2: Kalman Demo - Using placeholder as uploaded file cannot be displayed directly -->
                <div>
                    <h3 class="text-xl font-semibold text-accent-main mb-3">Kalman Filter Performance</h3>
                    <img 
                        src="https://placehold.co/800x600/1E3A8A/FFFFFF?text=Kalman+Demo+(1).gif" 
                        alt="Kalman Filter data smoothing demonstration" 
                        class="w-full h-auto rounded-lg border border-gray-700 shadow-lg"
                    >
                    <p class="text-gray-400 text-sm mt-2 text-center">Visualization of raw sensor data versus Kalman-filtered estimate.</p>
                </div>

            </div>

        </div>
    </div>

    <!-- Custom CSS for Skill Pills -->
    <style>
        /*
        FIX: The @apply rule is only for Tailwind CLI builds and not the CDN version.
        We moved the actual Tailwind utility classes directly into the span elements.
        We keep this style block minimal and only for standard CSS rules.
        */
        .skill-pill {
            display: inline-block;
            padding: 4px 16px; /* px-4 py-1 */
            font-weight: 500; /* font-medium */
            background-color: #374151; /* bg-gray-700 */
            color: #3B82F6; /* text-accent-main */
            border-radius: 9999px; /* rounded-full */
            transition: all 0.3s ease-in-out;
            cursor: default; /* Keep consistency */
        }
        .skill-pill:hover {
            background-color: #3B82F6; /* hover:bg-accent-main */
            color: #020617; /* hover:text-primary-dark */
        }
    </style>

    <!-- Three.js Initialization Script -->
    <script>
        let scene, camera, renderer, nodes = [], lines = [], mouseX = 0, mouseY = 0;
        const container = document.getElementById('three-container');
        const MAX_CONNECTIONS = 3; 
        const NUM_NODES = 100; // FIX: Reduced node count for performance
        const CONNECTION_DISTANCE = 150; 
        const FOG_COLOR = 0x020617; 
        let mouseProjected = new THREE.Vector3(); 
        let lastUpdateTime = Date.now(); // FIX: For performance throttling

        // Function to toggle the Lightbox
        function toggleLightbox(show = false) {
            const lightbox = document.getElementById('lightbox');
            if (show) {
                lightbox.classList.remove('hidden');
                setTimeout(() => lightbox.classList.add('opacity-100'), 10);
                document.body.style.overflow = 'hidden'; 
            } else {
                lightbox.classList.remove('opacity-100');
                setTimeout(() => lightbox.classList.add('hidden'), 500);
                document.body.style.overflow = ''; 
            }
        }

        function init() {
            // Scene Setup
            scene = new THREE.Scene();
            scene.background = new THREE.Color(FOG_COLOR);
            scene.fog = new THREE.Fog(FOG_COLOR, 100, 500); 

            // Camera Setup
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
            camera.position.z = 300;

            // Renderer Setup
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            container.appendChild(renderer.domElement);

            // Node Geometry
            const nodeGeometry = new THREE.BufferGeometry();
            const positions = [];
            
            // Node Material (Using PointsMaterial for a lighter, starfield look)
            const nodeMaterial = new THREE.PointsMaterial({
                color: 0x3B82F6, 
                size: 2,
                sizeAttenuation: true,
                transparent: true,
                opacity: 0.8,
            });

            // Line Material (Less opaque for subtlety)
            const lineMaterial = new THREE.LineBasicMaterial({
                color: 0x3B82F6, 
                transparent: true,
                opacity: 0.3, 
                linewidth: 1
            });
            
            // Create Nodes and store properties
            for (let i = 0; i < NUM_NODES; i++) {
                const x = Math.random() * 800 - 400;
                const y = Math.random() * 600 - 300;
                const z = Math.random() * 400 - 200;
                positions.push(x, y, z);
                
                // Store node data as objects in 'nodes' array for easy access
                nodes.push({
                    position: new THREE.Vector3(x, y, z),
                    originalScale: 1,
                    tempScale: 1, 
                    originalOpacity: 0.8,
                });
            }
            nodeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            
            // Add the points to the scene
            const points = new THREE.Points(nodeGeometry, nodeMaterial);
            scene.add(points);
            nodes.points = points;


            // Create Connections (Lines between nodes)
            for (let i = 0; i < NUM_NODES; i++) {
                const nodeA = nodes[i];
                let connectionCount = 0;

                for (let j = i + 1; j < NUM_NODES && connectionCount < MAX_CONNECTIONS; j++) {
                    const nodeB = nodes[j];
                    const distance = nodeA.position.distanceTo(nodeB.position);

                    if (distance < CONNECTION_DISTANCE) {
                        const points = [nodeA.position, nodeB.position];
                        const geometry = new THREE.BufferGeometry().setFromPoints(points);
                        const line = new THREE.Line(geometry, lineMaterial.clone()); 
                        line.userData.initialOpacity = 0.3 * (1 - (distance / CONNECTION_DISTANCE));
                        line.material.opacity = line.userData.initialOpacity;
                        scene.add(line);
                        lines.push(line);
                        connectionCount++;
                    }
                }
            }

            // Event Listeners
            window.addEventListener('resize', onWindowResize);
            document.addEventListener('mousemove', onMouseMove, false);
            document.addEventListener('touchstart', onTouchMove, false);
            document.addEventListener('touchmove', onTouchMove, false);
            document.addEventListener('scroll', checkStickyNav); // FIX: Added scroll listener
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        function onMouseMove(event) {
            mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        }

        function onTouchMove(event) {
             if (event.touches.length > 0) {
                mouseX = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
                mouseY = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
            }
        }

        function checkStickyNav() {
            const hero = document.getElementById('hero-section');
            const nav = document.getElementById('sticky-nav');
            // Show nav once the scroll position is past the height of the hero section
            if (window.scrollY > hero.offsetHeight - nav.offsetHeight) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        }
        
        // Helper to get mouse position in 3D space near the scene origin
        function getMouseProjectedPosition(z = 0) {
            mouseProjected.set(mouseX, mouseY, 0.5); 
            mouseProjected.unproject(camera);
            
            const dir = mouseProjected.sub(camera.position).normalize();
            const distance = -camera.position.z / dir.z;
            return camera.position.clone().add(dir.multiplyScalar(distance + z));
        }

        function animate() {
            requestAnimationFrame(animate);

            // Camera movement effect (subtle parallax)
            camera.position.x += (mouseX * 50 - camera.position.x) * 0.05;
            camera.position.y += (mouseY * 50 - camera.position.y) * 0.05;
            camera.lookAt(scene.position);

            const time = Date.now() * 0.00005;
            
            // FIX: Throttling performance of mouse proximity check to 30ms (33 FPS)
            const currentTime = Date.now();
            let shouldUpdateProximity = false;
            if (currentTime - lastUpdateTime > 30) { 
                shouldUpdateProximity = true;
                lastUpdateTime = currentTime;
            }

            const projectedMousePos = getMouseProjectedPosition();
            const positions = nodes.points.geometry.attributes.position.array;
            
            let posIndex = 0;
            // Animate Nodes
            nodes.forEach((node, i) => {
                // Subtle pulse and float
                node.position.x += Math.sin(time * i + i) * 0.05;
                node.position.y += Math.cos(time * i + i) * 0.05;
                node.position.z += Math.sin(time * i * 0.5) * 0.05;

                // Update positions array
                positions[posIndex++] = node.position.x;
                positions[posIndex++] = node.position.y;
                positions[posIndex++] = node.position.z;

                // Interactive Proximity Effect (Scaling and Opacity) - Only update if throttled
                if (shouldUpdateProximity) {
                    const distanceToMouse = node.position.distanceTo(projectedMousePos);
                    
                    if (distanceToMouse < 150) { 
                        const proximityFactor = 1 - (distanceToMouse / 150);
                        node.tempScale = 1 + proximityFactor * 1.0; 
                        nodes.points.material.opacity = node.originalOpacity + proximityFactor * 0.2;
                    } else {
                        node.tempScale = 1;
                    }
                }
                
                // Let's change the size of the material based on mouse input
                if (shouldUpdateProximity) {
                    nodes.points.material.size = 2 + (1 - projectedMousePos.distanceTo(camera.position.clone().setZ(300)) / 100);
                }
            });
            nodes.points.geometry.attributes.position.needsUpdate = true;


            // Animate Connections (Lines)
            lines.forEach(line => {
                // Flash/glow effect based on time
                const flash = Math.abs(Math.sin(Date.now() * 0.001 + line.geometry.uuid.charCodeAt(0) * 100)) * 0.1;
                line.material.opacity = line.userData.initialOpacity + flash;
            });


            renderer.render(scene, camera);
        }

        function setupScrollFades() {
            const fadeElements = document.querySelectorAll('.scroll-fade');

            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                root: null, 
                rootMargin: '0px',
                threshold: 0.1 
            });

            fadeElements.forEach(element => {
                observer.observe(element);
            });
        }

        window.onload = function() {
            init(); // Initialize Three.js
            animate(); // Start Three.js animation loop
            setupScrollFades(); // Initialize scroll fade effects
            checkStickyNav(); // Initial check for nav position
        };

    </script>
</body>
</html>