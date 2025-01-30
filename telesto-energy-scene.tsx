import { useState, useRef, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Text, useTexture } from "@react-three/drei"
import * as THREE from "three"
import { motion } from "framer-motion-3d"

// Oil Droplet Shader
const vertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  
  void main() {
    vUv = uv;
    vNormal = normal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform float time;
  varying vec2 vUv;
  varying vec3 vNormal;
  
  void main() {
    vec3 color = vec3(0.7, 0.5, 0.3); // Oil color
    vec3 light = normalize(vec3(1.0, 1.0, 1.0));
    float diff = max(dot(vNormal, light), 0.0);
    
    vec3 reflection = reflect(-light, vNormal);
    vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0));
    float spec = pow(max(dot(viewDir, reflection), 0.0), 32.0);
    
    gl_FragColor = vec4(color * (diff * 0.7 + 0.3) + vec3(spec), 1.0);
  }
`

function OilDroplet({ position }) {
  const meshRef = useRef()
  const [dropped, setDropped] = useState(false)

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.time.value = clock.getElapsedTime()
      if (!dropped && meshRef.current.position.y > -2) {
        meshRef.current.position.y -= 0.01
      } else if (!dropped) {
        setDropped(true)
      }
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.5, 32, 32]} />
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

function Container() {
  return (
    <mesh position={[0, -2.5, 0]}>
      <cylinderGeometry args={[2, 2, 1, 32]} />
      <meshStandardMaterial color="#b8860b" transparent opacity={0.7} />
    </mesh>
  )
}

function TelestoEnergyText() {
  const { viewport } = useThree()

  return (
    <motion.group
      initial={{ y: -viewport.height }}
      animate={{ y: 0 }}
      transition={{ delay: 2, duration: 1.5, type: "spring" }}
    >
      <Text position={[0, 1, 0]} fontSize={0.5} color="#ffffff" anchorX="center" anchorY="middle">
        Telesto Energy
      </Text>
    </motion.group>
  )
}

function Icon({ geometry, position, delay }) {
  const meshRef = useRef()

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(clock.getElapsedTime() + delay) * 0.2
      meshRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 2 + delay) * 0.05
    }
  })

  return (
    <motion.mesh
      ref={meshRef}
      position={position}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: delay + 3.5, duration: 1 }}
    >
      {geometry}
      <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.5} />
    </motion.mesh>
  )
}

function AIIcon() {
  return <Icon geometry={<sphereGeometry args={[0.2, 16, 16]} />} position={[-1.5, -1, 0]} delay={0} />
}

function BigDataIcon() {
  return <Icon geometry={<boxGeometry args={[0.3, 0.3, 0.3]} />} position={[0, -1, 0]} delay={0.2} />
}

function InnovationIcon() {
  return <Icon geometry={<torusGeometry args={[0.15, 0.05, 16, 100]} />} position={[1.5, -1, 0]} delay={0.4} />
}

export default function TelestoEnergyScene() {
  return (
    <div className="w-full h-screen">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <OilDroplet position={[0, 3, 0]} />
        <Container />
        <TelestoEnergyText />
        <AIIcon />
        <BigDataIcon />
        <InnovationIcon />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  )
}

