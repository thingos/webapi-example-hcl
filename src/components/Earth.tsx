import { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

import EarthDayMap from '/textures/8k_earth_daymap.jpg';
import EarthNormalMap from '/textures/8k_earth_normal_map.jpg';
import EarthSpecularMap from '/textures/8k_earth_specular_map.jpg';
import EarthCloudsMap from '/textures/8k_earth_clouds.jpg';
import EarthNightMap from '/textures/8k_earth_nightmap.jpg';
import { TextureLoader } from 'three';

export function Earth(props: any) {
	const [colorMap, normalMap, specularMap, cloudsMap, nightMap] = useLoader(TextureLoader, [
		EarthDayMap,
		EarthNormalMap,
		EarthSpecularMap,
		EarthCloudsMap,
		EarthNightMap,
	]);

	const sceneRef = useRef<any>();
	const earthRef = useRef<any>();
	const cloudsRef = useRef<any>();

	useFrame(({ clock }) => {
		const elapsedTime = clock.getElapsedTime();
		if (sceneRef.current == null) return;
		// lightRef.current.position.x = Math.sin(elapsedTime);
		// lightRef.current.position.z = 10 + Math.cos(elapsedTime);
		sceneRef.current.rotation.y = 4.6 + elapsedTime / 24;
	});

	return (
		<group>
			<OrbitControls makeDefault enableZoom={false} />
			<group ref={sceneRef} rotation={[0, 4.6, -0.6]}>
				{/* <ambientLight intensity={1} /> */}
				<group ref={props.lightGroupRef} rotation={[0, Math.PI, 0]}>
					<pointLight color="#ffffff" position={[0, 0, 100]} intensity={4} />
					<directionalLight color="#ffffff" position={[0, 0, 100]} intensity={1} />
				</group>
				<ambientLight color="#ffffff" intensity={0.6} />
				{/* <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} fade={true} /> */}
				<mesh ref={cloudsRef} position={[0, 0, 0]} rotation={[0, 0, 0]} scale={2}>
					<icosahedronGeometry args={[1, 10]} />
					<meshPhongMaterial
						map={cloudsMap}
						opacity={0.4}
						depthWrite={true}
						transparent={true}
						side={THREE.DoubleSide}
					/>
					<meshPhongMaterial
						map={nightMap}
						opacity={0.4}
						depthWrite={true}
						transparent={true}
						side={THREE.DoubleSide}
					/>
				</mesh>
				<mesh ref={earthRef} position={[0, 0, 0]} rotation={[0, 0, 0]} scale={2}>
					<icosahedronGeometry args={[1, 100]} />
					<meshPhongMaterial specularMap={specularMap} />
					<meshStandardMaterial map={colorMap} normalMap={normalMap} metalness={0.4} roughness={0.7} />
					{/* <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          zoomSpeed={0.6}
          panSpeed={0.5}
          rotateSpeed={0.4}
        /> */}
				</mesh>
			</group>
		</group>
	);
}
