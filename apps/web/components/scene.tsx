import { Preload } from '@react-three/drei';
import { Canvas, type CanvasProps } from '@react-three/fiber';
import * as THREE from 'three';

import { r3f } from './three';

export default function Scene({ ...props }: CanvasProps) {
  // Everything defined in here will persist between route changes, only children are swapped
  return (
    <Canvas
      {...props}
      onCreated={(state) => {
        state.gl.toneMapping = THREE.AgXToneMapping;
      }}
    >
      <r3f.Out />
      <Preload all />
    </Canvas>
  );
}
