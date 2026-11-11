        const { useEffect, useRef, useState } = React;

        const FlowingTorus = () => {
            const canvasRef = useRef(null);
            const animationRef = useRef(null);
            const rotationRef = useRef({ 
                x: 40 * Math.PI / 180,
                y: 30 * Math.PI / 180,
                z: 0 
            });
            const isDraggingRef = useRef(false);
            const previousMousePositionRef = useRef({ x: 0, y: 0 });
            const pointsRef = useRef(null);
            const minZRef = useRef(Infinity);
            const maxZRef = useRef(-Infinity);
            const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

            const params = {
                majorRadius: 2.5,           // R - major radius of torus
                minorRadius: 1.0,           // r - minor radius of torus
                majorFlowSpeed: 0.8,        // Speed around major circumference
                minorFlowSpeed: 0.3,        // Speed around minor circumference
                helixFactor: 0.3,           // Creates helical motion (0 = pure circular)
                waveAmplitude: 0.0,         // Wave distortion amplitude
                waveFrequency: 2.0          // Wave frequency
            };

            const initializePoints = () => {
                const points = [];
                const numU = 100;  // Points around major circumference
                const numV = 50;  // Points around minor circumference
                
                for (let i = 0; i < numU; i++) {
                    for (let j = 0; j < numV; j++) {
                        const u = (i / numU) * 2 * Math.PI;
                        const v = (j / numV) * 2 * Math.PI;
                        
                        points.push({
                            u: u,
                            v: v,
                            x: 0,
                            y: 0,
                            z: 0,
                            originalU: u,
                            originalV: v
                        });
                    }
                }
                
                return points;
            };

            const updateTorusCoordinates = (point) => {
                const R = params.majorRadius;
                const r = params.minorRadius;
                
                // Add wave distortion
                const waveOffset = Math.sin(point.u * params.waveFrequency + Date.now() * 0.001) * params.waveAmplitude;
                const effectiveR = R + waveOffset;
                
                point.x = (effectiveR + r * Math.cos(point.v)) * Math.cos(point.u);
                point.y = (effectiveR + r * Math.cos(point.v)) * Math.sin(point.u);
                point.z = r * Math.sin(point.v);
            };

            const rotatePoint = (point) => {
                const rotation = rotationRef.current;
                let x = point.x;
                let y = point.y;
                let z = point.z;

                // Rotate around Z axis
                let tempX = x * Math.cos(rotation.z) - y * Math.sin(rotation.z);
                let tempY = x * Math.sin(rotation.z) + y * Math.cos(rotation.z);
                x = tempX;
                y = tempY;

                // Rotate around Y axis
                tempX = x * Math.cos(rotation.y) + z * Math.sin(rotation.y);
                let tempZ = -x * Math.sin(rotation.y) + z * Math.cos(rotation.y);
                x = tempX;
                z = tempZ;

                // Rotate around X axis
                tempY = y * Math.cos(rotation.x) - z * Math.sin(rotation.x);
                tempZ = y * Math.sin(rotation.x) + z * Math.cos(rotation.x);
                y = tempY;
                z = tempZ;

                return { x, y, z };
            };

            const getColor = (point, z) => {
                // Update min/max for depth-based coloring
                minZRef.current = Math.min(minZRef.current, z);
                maxZRef.current = Math.max(maxZRef.current, z);
                
                // Multi-dimensional coloring based on position
                const normalizedZ = (z - minZRef.current) / (maxZRef.current - minZRef.current || 1);
                const uColor = (point.u / (2 * Math.PI));
                const vColor = (point.v / (2 * Math.PI));
                
                // Create flowing color based on position and time
                const time = Date.now() * 0.001;
                const hue = (uColor * 360 + vColor * 120 + time * 20) % 60+180;
                const saturation = 70 + normalizedZ * 30;
                const lightness = 40 + normalizedZ * 40;
                
                return `hsla(${hue}, ${saturation}%, ${lightness}%, 0.8)`;
            };

            const drawPoint = (ctx, point, scale, offsetX, offsetY) => {
                const rotated = rotatePoint(point);
                const projX = rotated.x * scale + offsetX;
                const projY = rotated.y * scale + offsetY;
                
                // Size varies with depth for 3D effect
                const depth = (rotated.z + 3) / 6; // normalize to 0-1
                const size = 1.5 + depth * 2;
                
                ctx.fillStyle = getColor(point, rotated.z);
                ctx.beginPath();
                ctx.arc(projX, projY, size, 0, Math.PI * 2);
                ctx.fill();
                
                // Add glow effect for points in front
                if (depth > 0.7) {
                    ctx.shadowColor = ctx.fillStyle;
                    ctx.shadowBlur = 8;
                    ctx.beginPath();
                    ctx.arc(projX, projY, size * 0.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
            };

            const updatePoint = (point) => {
                const dt = 0.016; // ~60fps
                
                // Flow around major circumference (around the main ring)
                point.u += params.majorFlowSpeed * dt;
                
                // Flow around minor circumference (around the tube)
                point.v += params.minorFlowSpeed * dt;
                
                // Add helical motion - couples major and minor flow
                point.v += params.helixFactor * params.majorFlowSpeed * dt;
                
                // Keep angles in range
                point.u = point.u % (2 * Math.PI);
                point.v = point.v % (2 * Math.PI);
                
                // Update 3D coordinates
                updateTorusCoordinates(point);
            };

            const animate = () => {
                const canvas = canvasRef.current;
                if (!canvas) return;
                
                const ctx = canvas.getContext('2d');
                const scale = isMobile ? 70 : 90;
                const offsetX = canvas.width / 2;
                const offsetY = canvas.height / 2;
                
                // Clear with slight trail effect for flowing streams
                ctx.fillStyle = '#f1f1f1';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Sort points by depth for proper rendering order
                const sortedPoints = [...pointsRef.current].sort((a, b) => {
                    const aRotated = rotatePoint(a);
                    const bRotated = rotatePoint(b);
                    return aRotated.z - bRotated.z; // Back to front
                });
                
                // Update and draw all points
                sortedPoints.forEach((point) => {
                    updatePoint(point);
                    drawPoint(ctx, point, scale, offsetX, offsetY);
                });
                
                animationRef.current = requestAnimationFrame(animate);
            };

            useEffect(() => {
                const canvas = canvasRef.current;
                if (!canvas) return;

                canvas.width = isMobile ? window.innerWidth : 900;
                canvas.height = isMobile ? window.innerHeight : 700;
                
                pointsRef.current = initializePoints();

                const handleMouseDown = (e) => {
                    isDraggingRef.current = true;
                    const rect = canvas.getBoundingClientRect();
                    previousMousePositionRef.current = {
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top
                    };
                };

                const handleMouseMove = (e) => {
                    if (isDraggingRef.current) {
                        const rect = canvas.getBoundingClientRect();
                        const currentX = e.clientX - rect.left;
                        const currentY = e.clientY - rect.top;
                        
                        const deltaX = currentX - previousMousePositionRef.current.x;
                        const deltaY = currentY - previousMousePositionRef.current.y;

                        rotationRef.current.y += deltaX * 0.01;
                        rotationRef.current.x += deltaY * 0.01;

                        previousMousePositionRef.current = { x: currentX, y: currentY };
                    }
                };

                const handleMouseUp = () => {
                    isDraggingRef.current = false;
                };

                canvas.addEventListener('mousedown', handleMouseDown);
                canvas.addEventListener('mousemove', handleMouseMove);
                canvas.addEventListener('mouseup', handleMouseUp);
                canvas.addEventListener('mouseleave', handleMouseUp);

                animate();

                return () => {
                    if (animationRef.current) {
                        cancelAnimationFrame(animationRef.current);
                    }
                    canvas.removeEventListener('mousedown', handleMouseDown);
                    canvas.removeEventListener('mousemove', handleMouseMove);
                    canvas.removeEventListener('mouseup', handleMouseUp);
                    canvas.removeEventListener('mouseleave', handleMouseUp);
                };
            }, [isMobile]);

            useEffect(() => {
                const handleResize = () => {
                    setIsMobile(window.innerWidth <= 768);
                };
                window.addEventListener('resize', handleResize);
                return () => window.removeEventListener('resize', handleResize);
            }, []);

            return (
            <div className="torus-container">
                <canvas
                ref={canvasRef}
                className="no-border cursor-move"
                style={{
                    width: isMobile ? '90vw' : '900px',
                    height: isMobile ? '60vh' : '700px'
                }}
                />
            </div>
            );
        };

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<FlowingTorus />);