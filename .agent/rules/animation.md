---
trigger: always_on
---

# Diretrizes Técnicas de Animação e 3D

## Stack Obrigatória
- Framework: React / Next.js
- 3D: Three.js (@react-three/fiber e @react-three/drei)
- Animações de Scroll: GSAP com ScrollTrigger (ou Lenis para smooth scroll)
- Estilização: Tailwind CSS

## Padrões de Performance
- O modelo 3D deve ser carregado de forma otimizada (.glb / .gltf comprimido).
- Travar a meta de renderização em 60 FPS fluidos.
- As rodas do carro devem reagir mecanicamente à rolagem da tela (scroll).
- O scroll deve controlar a rotação do carro e a transição suave de ângulos de câmera.