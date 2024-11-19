'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { OrbitControls, PerspectiveCamera, useGLTF } from '@react-three/drei'
import { extend, useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

extend({ RoundedBoxGeometry })

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP)
}

const params = {
  modelSize: 9,
  gridSize: 0.24,
  boxSize: 0.24,
  boxRoundness: 0.03,
}

interface Voxel {
  position: THREE.Vector3
  color: THREE.Color
}

function voxelizeModel(importedScene: THREE.Group<THREE.Object3DEventMap>) {
  const importedMeshes: THREE.Mesh[] = []
  importedScene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      ;(child.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide
      importedMeshes.push(child as THREE.Mesh)
    }
  })

  let boundingBox = new THREE.Box3().setFromObject(importedScene)
  const size = boundingBox.getSize(new THREE.Vector3())
  const scaleFactor = params.modelSize / size.length()
  const center = boundingBox
    .getCenter(new THREE.Vector3())
    .multiplyScalar(-scaleFactor)

  importedScene.scale.multiplyScalar(scaleFactor)
  importedScene.position.copy(center)

  boundingBox = new THREE.Box3().setFromObject(importedScene)
  boundingBox.min.y += 0.5 * params.gridSize // for egg grid to look better

  const modelVoxels: Voxel[] = []

  for (let i = boundingBox.min.x; i < boundingBox.max.x; i += params.gridSize) {
    for (
      let j = boundingBox.min.y;
      j < boundingBox.max.y;
      j += params.gridSize
    ) {
      for (
        let k = boundingBox.min.z;
        k < boundingBox.max.z;
        k += params.gridSize
      ) {
        for (let meshCnt = 0; meshCnt < importedMeshes.length; meshCnt++) {
          const mesh = importedMeshes[meshCnt]

          const color = new THREE.Color()
          const { h, s, l } = (
            mesh.material as THREE.MeshStandardMaterial
          ).color.getHSL({ h: 0, s: 0, l: 0 })
          color.setHSL(h, s, l, THREE.SRGBColorSpace)
          const position = new THREE.Vector3(i, j, k)

          if (isInsideMesh(position, new THREE.Vector3(0, 0, 1), mesh)) {
            modelVoxels.push({ color, position })
            break
          }
        }
      }
    }
  }

  return modelVoxels
}

const rayCaster = new THREE.Raycaster()
function isInsideMesh(
  pos: THREE.Vector3,
  ray: THREE.Vector3,
  mesh: THREE.Mesh,
) {
  rayCaster.set(pos, ray)
  const rayCasterIntersects = rayCaster.intersectObject(mesh, false)
  return rayCasterIntersects.length % 2 === 1
}

export function Voxel() {
  const light = useRef<THREE.DirectionalLight>(null)
  const lightHolderRef = useRef<THREE.Group>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera>(null)

  useEffect(() => {
    if (!light.current) return
    light.current.shadow.camera.near = 10
    light.current.shadow.camera.far = 30
    light.current.shadow.mapSize.set(1024, 1024)
  }, [])

  useEffect(() => {
    if (!cameraRef.current) return
    cameraRef.current.position.set(0, 0.5, 2).multiplyScalar(8)
  }, [])

  const { scene } = useGLTF('dog.glb')
  const voxelsPerModel = useMemo(() => voxelizeModel(scene), [scene])

  const { gl, camera } = useThree()
  gl.shadowMap.enabled = true
  gl.shadowMap.type = THREE.PCFSoftShadowMap
  gl.setScissorTest(true)

  useFrame(() => {
    lightHolderRef.current?.quaternion.copy(camera.quaternion)
  })

  return (
    <>
      <ambientLight intensity={0.5 * Math.PI} />
      <group ref={lightHolderRef}>
        <directionalLight
          ref={light}
          intensity={0.4 * Math.PI}
          position={[0, 15, 3]}
          castShadow
        />
        <spotLight intensity={100} position={[0, -4, 5]} />
        <mesh
          position={[0, -4, 0]}
          rotation={[-0.5 * Math.PI, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[35, 35]} />
          <shadowMaterial opacity={0.1} />
        </mesh>
      </group>
      <VoxelMesh voxelsPerModel={voxelsPerModel} />
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        fov={45}
        near={0.1}
        far={1000}
      />
      <OrbitControls
        enablePan={false}
        autoRotate={true}
        minDistance={20}
        maxDistance={30}
        minPolarAngle={0.35 * Math.PI}
        maxPolarAngle={0.65 * Math.PI}
        enableDamping
      />
    </>
  )
}

function VoxelMesh({ voxelsPerModel }: { voxelsPerModel: Voxel[] }) {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null)
  const [voxels, setVoxels] = useState<Voxel[]>([])
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const tl = useMemo(() => gsap.timeline(), [])

  const randomCoordinate = () => {
    let v = Math.random() - 0.5
    v -= v % params.gridSize
    return v
  }

  useEffect(() => {
    if (!instancedMeshRef.current) return

    const voxels = []
    for (let i = 0; i < voxelsPerModel.length; i++) {
      const position = new THREE.Vector3(
        randomCoordinate(),
        randomCoordinate(),
        randomCoordinate(),
      )
      const color = new THREE.Color().setHSL(
        Math.random(),
        1,
        1,
        THREE.SRGBColorSpace,
      )

      voxels.push({ color, position })
      instancedMeshRef.current.setColorAt(i, color)
      dummy.position.copy(position)
      dummy.updateMatrix()
      instancedMeshRef.current.setMatrixAt(i, dummy.matrix)
    }
    instancedMeshRef.current.instanceMatrix.needsUpdate = true
    instancedMeshRef.current.instanceColor!.needsUpdate = true

    setVoxels(voxels)
  }, [dummy, voxelsPerModel])

  useGSAP(() => {
    if (!instancedMeshRef.current) return

    for (let i = 0; i < voxels.length; i++) {
      const duration = 0.5 + 0.5 * Math.pow(Math.random(), 6)

      tl.to(
        voxels[i].color,
        {
          delay: 0.7 * Math.random() * duration,
          duration: 0.05,
          r: voxelsPerModel[i].color.r,
          g: voxelsPerModel[i].color.g,
          b: voxelsPerModel[i].color.b,
          ease: 'power1.in',
          onUpdate: () => {
            instancedMeshRef.current!.setColorAt(i, voxels[i].color)
          },
        },
        0,
      )

      tl.to(
        voxels[i].position,
        {
          delay: 0.2 * Math.random(),
          duration: duration,
          x: voxelsPerModel[i].position.x,
          y: voxelsPerModel[i].position.y,
          z: voxelsPerModel[i].position.z,
          ease: 'back.out(3)',
          onUpdate: () => {
            dummy.position.copy(voxels[i].position)
            dummy.updateMatrix()
            instancedMeshRef.current!.setMatrixAt(i, dummy.matrix)
          },
        },
        0,
      )
    }

    // increase the model rotation during transition
    tl.to(
      instancedMeshRef.current.rotation,
      {
        duration: 1.2,
        y: '+=' + 1.3 * Math.PI,
        ease: 'power2.out',
      },
      0,
    )

    // show the right number of voxels
    tl.to(
      instancedMeshRef.current,
      {
        duration: 0.4,
        count: voxelsPerModel.length,
      },
      0,
    )

    // update the instanced mesh accordingly to voxels data
    tl.eventCallback('onUpdate', () => {
      instancedMeshRef.current!.instanceMatrix.needsUpdate = true
      instancedMeshRef.current!.instanceColor!.needsUpdate = true
    })
  }, [voxelsPerModel, voxels])

  return (
    <instancedMesh
      ref={instancedMeshRef}
      args={[undefined, undefined, voxelsPerModel.length]}
      castShadow
      receiveShadow
      onPointerMissed={() => {
        tl.reversed(!tl.reversed())
      }}
    >
      {/* @ts-expect-error -- https://docs.pmnd.rs/react-three-fiber/tutorials/typescript#extend-usage */}
      <roundedBoxGeometry
        args={[
          params.boxSize,
          params.boxSize,
          params.boxSize,
          2,
          params.boxRoundness,
        ]}
      />
      <meshLambertMaterial />
    </instancedMesh>
  )
}
