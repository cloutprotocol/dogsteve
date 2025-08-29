'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

export default function PsychedelicBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const worldRef = useRef<any>(null)
  const [isDesktop, setIsDesktop] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check if we're on mobile/tablet
    const checkDevice = () => {
      setIsDesktop(window.innerWidth > 768)
    }
    
    checkDevice()
    window.addEventListener('resize', checkDevice)

    return () => {
      window.removeEventListener('resize', checkDevice)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !isDesktop) return

    // Initialize world directly without loading external Three.js
    initWorld()

    return () => {
      if (worldRef.current) {
        worldRef.current.cleanup?.()
      }
    }
  }, [isDesktop])

  const initWorld = () => {
    if (!containerRef.current) return

    class World {
      renderer: any
      scene: any
      camera: any
      plane: any
      material: any
      timer: number = 0
      mousePos = { x: 0, y: 0 }
      targetMousePos = { x: 0, y: 0 }

      constructor(container: HTMLElement) {
        this.renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true
        })
        
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.scene = new THREE.Scene()
        
        const aspectRatio = window.innerWidth / window.innerHeight
        this.camera = new THREE.PerspectiveCamera(50, aspectRatio, 0.1, 20000)
        this.camera.position.z = 200
        
        container.appendChild(this.renderer.domElement)
        this.createPlane()
        this.setupEventListeners()
        this.loop()
      }

      createPlane() {
        const vertexShader = `
          attribute vec3 position;
          attribute vec2 uv;
          uniform mat4 projectionMatrix;
          uniform mat4 modelViewMatrix;
          uniform mat3 normalMatrix;
          uniform float uTime;
          uniform vec2 uMousePosition;
          varying vec2 vUv;

          void main() {
            vUv = uv;
            vec4 pos = vec4(position, 1.0);
            gl_Position = pos;
          }
        `

        const fragmentShader = `
          precision highp float;
          uniform float uTime;
          uniform vec2 uMousePosition;
          uniform float uHue;
          uniform float uHueVariation;
          uniform float uDensity;
          uniform float uDisplacement;
          varying vec2 vUv;

          float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
          vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
          vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

          float hue2rgb(float f1, float f2, float hue) {
            if (hue < 0.0)
              hue += 1.0;
            else if (hue > 1.0)
              hue -= 1.0;
            float res;
            if ((6.0 * hue) < 1.0)
              res = f1 + (f2 - f1) * 6.0 * hue;
            else if ((2.0 * hue) < 1.0)
              res = f2;
            else if ((3.0 * hue) < 2.0)
              res = f1 + (f2 - f1) * ((2.0 / 3.0) - hue) * 6.0;
            else
              res = f1;
            return res;
          }

          vec3 hsl2rgb(vec3 hsl) {
            vec3 rgb;
            if (hsl.y == 0.0) {
              rgb = vec3(hsl.z);
            } else {
              float f2;
              if (hsl.z < 0.5)
                f2 = hsl.z * (1.0 + hsl.y);
              else
                f2 = hsl.z + hsl.y - hsl.y * hsl.z;
              float f1 = 2.0 * hsl.z - f2;
              rgb.r = hue2rgb(f1, f2, hsl.x + (1.0/3.0));
              rgb.g = hue2rgb(f1, f2, hsl.x);
              rgb.b = hue2rgb(f1, f2, hsl.x - (1.0/3.0));
            }
            return rgb;
          }

          vec2 fade(vec2 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

          float cnoise(vec2 P){
            vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
            vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
            Pi = mod(Pi, 289.0);
            vec4 ix = Pi.xzxz;
            vec4 iy = Pi.yyww;
            vec4 fx = Pf.xzxz;
            vec4 fy = Pf.yyww;
            vec4 i = perm(perm(ix) + iy);
            vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0;
            vec4 gy = abs(gx) - 0.5;
            vec4 tx = floor(gx + 0.5);
            gx = gx - tx;
            vec2 g00 = vec2(gx.x,gy.x);
            vec2 g10 = vec2(gx.y,gy.y);
            vec2 g01 = vec2(gx.z,gy.z);
            vec2 g11 = vec2(gx.w,gy.w);
            vec4 norm = 1.79284291400159 - 0.85373472095314 *
            vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
            g00 *= norm.x;
            g01 *= norm.y;
            g10 *= norm.z;
            g11 *= norm.w;
            float n00 = dot(g00, vec2(fx.x, fy.x));
            float n10 = dot(g10, vec2(fx.y, fy.y));
            float n01 = dot(g01, vec2(fx.z, fy.z));
            float n11 = dot(g11, vec2(fx.w, fy.w));
            vec2 fade_xy = fade(Pf.xy);
            vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
            float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
            return 2.3 * n_xy;
          }

          void main () {
            float mouseDistance = length(vUv - uMousePosition);
            float t = uTime * .005;
            float elevation =  vUv.y * uDensity * 30.0;
            
            float shadow = smoothstep(0.0, .3 + sin(t * 5.0 * 3.14) * .1 , mouseDistance);
            elevation += shadow * 5.0;
            
            float displacement = cnoise( vec2( t + vUv.y * 2.0, t + vUv.x * 3.0 )) * uDisplacement * 3.0 ;

            elevation += displacement * 4.0;
            elevation *= 2.0 + cnoise( vec2( t + vUv.y * 1.0, t + .5)) * 2.0 ;

            float light = .9 + fract(elevation) ;
            light *= .9 + (1.0 - (displacement * displacement)) * .1;
            elevation = floor(elevation);

            float hue =  uHue + shadow * .1 + cnoise( vec2( elevation * .10, .1 + t)) * uHueVariation;
            float saturation = .6;
            float brightness =  - (1.0 - shadow) * .1 + .5  - smoothstep( 0.0, .9,  cnoise( vec2( elevation * .5, .4 + t * 5.0)) ) * .1;

            vec3 hslCol = vec3( hue, saturation, brightness);
            vec3 col = hsl2rgb(hslCol) * vec3(light, 1.0, 1.0);
            
            gl_FragColor = vec4(col, 1.);
          }
        `

        this.material = new THREE.RawShaderMaterial({
          vertexShader,
          fragmentShader,
          uniforms: {
            uTime: { value: 0 },
            uHue: { value: 0.44 },
            uHueVariation: { value: 0 },
            uDensity: { value: 0.1 },
            uDisplacement: { value: 0.11 },
            uMousePosition: { value: new THREE.Vector2(0.5, 0.5) }
          }
        })

        const planeGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)
        this.plane = new THREE.Mesh(planeGeometry, this.material)
        this.scene.add(this.plane)
      }

      setupEventListeners() {
        const handleMouseMove = (e: MouseEvent) => {
          this.targetMousePos.x = e.clientX / window.innerWidth
          this.targetMousePos.y = 1.0 - e.clientY / window.innerHeight
        }

        const handleResize = () => {
          this.renderer.setSize(window.innerWidth, window.innerHeight)
          this.camera.aspect = window.innerWidth / window.innerHeight
          this.camera.updateProjectionMatrix()
        }

        document.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('resize', handleResize)

        // Store cleanup function
        this.cleanup = () => {
          document.removeEventListener('mousemove', handleMouseMove)
          window.removeEventListener('resize', handleResize)
        }
      }

      render() {
        this.timer += 0.1 // speed parameter
        this.material.uniforms.uTime.value = this.timer

        this.mousePos.x += (this.targetMousePos.x - this.mousePos.x) * 0.1
        this.mousePos.y += (this.targetMousePos.y - this.mousePos.y) * 0.1

        if (this.plane) {
          this.material.uniforms.uMousePosition.value = new THREE.Vector2(
            this.mousePos.x, 
            this.mousePos.y
          )
        }

        this.renderer.render(this.scene, this.camera)
      }

      loop() {
        this.render()
        requestAnimationFrame(() => this.loop())
      }

      cleanup: (() => void) | undefined
    }

    worldRef.current = new World(containerRef.current!)
  }

  if (!isDesktop) {
    return null
  }

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none'
      }}
    />
  )
}