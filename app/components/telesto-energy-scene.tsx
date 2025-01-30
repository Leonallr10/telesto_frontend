"use client"

import { useState, useRef, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Text, Html } from "@react-three/drei"
import gsap from "gsap"
import { useRouter } from "next/navigation"

// Modified shader for oil droplet color
// Updated vertex shader with surface displacement
const vertexShader = `
uniform float time;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    // Original position and normal
    vec3 pos = position;
    vec3 norm = normal;
    
    // Multi-frequency displacement
    float displacement = 
        sin(pos.x * 5.0 + time * 1.5) * 0.02 +
        sin(pos.y * 7.0 + time * 2.0) * 0.015 +
        sin(pos.z * 6.0 + time * 1.2) * 0.018;

    // Calculate displacement derivatives for normal correction
    float dx = cos(pos.x * 5.0 + time * 1.5) * 5.0 * 0.02;
    float dy = cos(pos.y * 7.0 + time * 2.0) * 7.0 * 0.015;
    float dz = cos(pos.z * 6.0 + time * 1.2) * 6.0 * 0.018;

    // Create tangent and bitangent vectors
    vec3 tangent = normalize(vec3(1.0 + dx, dy, dz));
    vec3 bitangent = normalize(vec3(dx, 1.0 + dy, dz));
    
    // Recalculate normal using cross product
    vec3 modifiedNormal = normalize(cross(tangent, bitangent));

    // Apply displacement and set varying variables
    vec3 displacedPosition = pos + modifiedNormal * displacement;
    vPosition = displacedPosition;
    vNormal = modifiedNormal;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
}
`;



const fragmentShader = `
uniform float time;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    // Base oil colors (yellow-gold spectrum)
    vec3 baseColor = vec3(0.9, 0.85, 0.1); // Rich yellow
    vec3 highlightColor = vec3(1.0, 0.95, 0.3); // Bright gold

    // Position-based gradient calculation
    float verticalFactor = smoothstep(-1.0, 1.0, vPosition.y);
    vec3 mainColor = mix(baseColor, highlightColor, verticalFactor);

    // Dynamic lighting
    vec3 lightDir = normalize(vec3(sin(time), 1.0, cos(time)));
    float diff = max(dot(vNormal, lightDir), 0.1);
    
    // Specular highlights
    vec3 viewDir = normalize(cameraPosition - vPosition);
    vec3 reflectDir = reflect(-lightDir, vNormal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);

    // Final color composition
    vec3 finalColor = mainColor * diff + spec * 0.8;
    gl_FragColor = vec4(finalColor, 1.0); // Ensure full opacity
}

`;

function Container({ position }) {
  return (
    <mesh position={position}>
      <cylinderGeometry args={[2, 2, 1, 32]} />
      <meshStandardMaterial 
        color="#f5f5f5"
        transparent 
        opacity={0.9}
        metalness={0.3}
        roughness={0.2}
      />
    </mesh>
  )
}

// Custom droplet shape using custom geometry
function OilDroplet({ startPosition, endPosition, onComplete, duration }) {
  const meshRef = useRef()

  // Create droplet shape
  const createDropletGeometry = () => {
    const points = []
    const segments = 32
    const height = 1
    const radius = 0.5

    // Top sphere part
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI
      const y = Math.cos(theta) * radius
      const r = Math.sin(theta) * radius
      
      for (let j = 0; j <= segments; j++) {
        const phi = (j / segments) * 2 * Math.PI
        const x = r * Math.cos(phi)
        const z = r * Math.sin(phi)
        points.push(x, y + height/2, z)
      }
    }

    // Bottom teardrop part
    for (let i = 0; i <= segments/2; i++) {
      const theta = (i / segments) * Math.PI
      const y = -Math.pow(Math.sin(theta), 0.5) * height
      const r = Math.cos(theta) * radius * 0.8
      
      for (let j = 0; j <= segments; j++) {
        const phi = (j / segments) * 2 * Math.PI
        const x = r * Math.cos(phi)
        const z = r * Math.sin(phi)
        points.push(x, y, z)
      }
    }

    return new Float32Array(points)
  }

  useEffect(() => {
    if (meshRef.current) {
      gsap.fromTo(
        meshRef.current.position,
        { y: startPosition[1] },
        {
          y: endPosition[1],
          duration: 1.2,
          ease: "power2.inOut",
          delay: 0.3,
          onComplete,
        }
      )
    }
  }, [startPosition, endPosition, onComplete])

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.time.value = clock.getElapsedTime()
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.5
    }
  })

  return (
    <mesh ref={meshRef} position={startPosition}>
    <bufferGeometry>
        <bufferAttribute
            attach="attributes-position"
            count={createDropletGeometry().length / 3}
            array={createDropletGeometry()}
            itemSize={3}
        />
        {/* Add normal attribute if needed */}
    </bufferGeometry>
    <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
            time: { value: 0 },
        }}
    />
</mesh>
  )
}

function TelestoEnergyText({ animate }) {
  const textRef = useRef()
  const { viewport } = useThree()

  useEffect(() => {
    if (textRef.current && animate) {
      gsap.fromTo(
        textRef.current.position,
        { y: viewport.height },
        {
          y: 0.5,
          duration: 1.5,
          delay: 0.2,
          ease: "power3.out",
        }
      )
    }
  }, [viewport.height, animate])

  return (
    <Text
      ref={textRef}
      position={[0, animate ? viewport.height : 0.5, 0]}
      fontSize={0.5}
      color="#333333"
      anchorX="center"
      anchorY="middle"
    >
      Telesto Energy
    </Text>
  )
}

function BootstrapIcon({ iconClass, position, animate, gradient }) {
  const iconRef = useRef()

  useEffect(() => {
    if (iconRef.current && animate) {
      gsap.fromTo(
        iconRef.current,
        { 
          opacity: 0,
          scale: 0,
        },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "elastic.out(1, 0.5)",
          delay: 0.8
        }
      )
    }
  }, [animate])

  return (
    <Html position={position}>
      <div 
        ref={iconRef}
        className="flex items-center justify-center"
        style={{ 
          opacity: animate ? 0 : 1,
          transform: animate ? 'scale(0)' : 'scale(1)',
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          boxShadow: "0 0 15px rgba(211, 216, 64, 0.3)",
          background: gradient
        }}
      >
        <i 
          className={`${iconClass} text-white text-4xl`}
          style={{ 
            filter: "drop-shadow(0px 0px 5px rgba(0,0,0,0.3))"
          }}
        />
      </div>
    </Html>
  )
}

export default function TelestoEnergyScene() {
  const [dropletCount, setDropletCount] = useState(0)
  const [animateFirstDroplet, setAnimateFirstDroplet] = useState(true)
  const router = useRouter()

  const handleDropletComplete = () => {
    setDropletCount((prev) => prev + 1)
    if (dropletCount === 0) {
      setAnimateFirstDroplet(false)
    }
  }

  useEffect(() => {
    if (dropletCount === 3) {
      setTimeout(() => router.push("/home"), 300)
    }
  }, [dropletCount, router])

  useEffect(() => {
    const timer = setTimeout(() => router.push("/home"), 5000)
    return () => clearTimeout(timer)
  }, [router])

  // Oil color-based gradients
  const gradients = {
    first: "linear-gradient(135deg, #D3D840, #BFC42C)",
    second: "linear-gradient(135deg, #D3D840, #BFC42C)",
    third: "linear-gradient(135deg, #D3D840, #BFC42C)"
  }

  return (
    <div className="w-full h-screen bg-white">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <spotLight 
          position={[-10, 5, 10]} 
          angle={0.3} 
          penumbra={1} 
          intensity={0.6}
        />
        
        <Container position={[0, 2.5, 0]} />
        <Container position={[0, -2.5, 0]} />
        
        {dropletCount < 3 && (
          <OilDroplet
            startPosition={[0, 2, 0]}
            endPosition={[0, -2, 0]}
            onComplete={handleDropletComplete}
            duration={2}
          />
        )}
        
        <group position={[0, 0, 0]}>
          <TelestoEnergyText animate={animateFirstDroplet} />
          
          <BootstrapIcon 
            iconClass="bi bi-gear-fill" 
            position={[-1.5, -0.5, 0]} 
            animate={animateFirstDroplet}
            gradient={gradients.first}
          />
          <BootstrapIcon 
            iconClass="bi bi-graph-up-arrow" 
            position={[0, -0.5, 0]} 
            animate={animateFirstDroplet}
            gradient={gradients.second}
          />
          <BootstrapIcon 
            iconClass="bi bi-lightning-charge-fill" 
            position={[1.5, -0.5, 0]} 
            animate={animateFirstDroplet}
            gradient={gradients.third}
          />
        </group>

        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
        />
      </Canvas>
    </div>
  )
}