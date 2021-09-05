import { useTexture } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'

import { PMREMGenerator, sRGBEncoding } from 'three'

export function EnvLightByImage({ imageURL }) {
  let { scene, gl } = useThree()
  let texture = useTexture(imageURL)
  useEffect(() => {
    const pmremGenerator = new PMREMGenerator(gl)
    pmremGenerator.compileEquirectangularShader()

    texture.encoding = sRGBEncoding
    const envMap = pmremGenerator.fromEquirectangular(texture).texture
    envMap.encoding = sRGBEncoding
    // scene.background = envMap;
    scene.environment = envMap

    return () => {
      scene.environment = null
      scene.background = null
    }
  }, [])

  return null
}
