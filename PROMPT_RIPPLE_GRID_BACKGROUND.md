# 🌊 PROMPT: RIPPLE GRID BACKGROUND GLOBAL

## 🎯 **OBJETIVO**

Implementar o componente **RippleGrid** como fundo animado em todas as páginas do sistema, criando um efeito visual consistente e imersivo em toda a aplicação.

---

## 🛠️ **IMPLEMENTAÇÃO COMPLETA**

### **PASSO 1: INSTALAR DEPENDÊNCIAS**

```bash
npm install ogl
```

### **PASSO 2: CRIAR COMPONENTE RIPPLE GRID**

**Criar: `client/src/components/RippleGrid/RippleGrid.tsx`**
```typescript
import { useRef, useEffect } from "react";
import { Renderer, Program, Triangle, Mesh } from "ogl";

interface RippleGridProps {
  enableRainbow?: boolean
  gridColor?: string
  rippleIntensity?: number
  gridSize?: number
  gridThickness?: number
  fadeDistance?: number
  vignetteStrength?: number
  glowIntensity?: number
  opacity?: number
  gridRotation?: number
  mouseInteraction?: boolean
  mouseInteractionRadius?: number
}

const RippleGrid: React.FC<RippleGridProps> = ({
  enableRainbow = false,
  gridColor = "#9a45fc", // Cor roxa cyberpunk
  rippleIntensity = 0.08,
  gridSize = 12.0,
  gridThickness = 20.0,
  fadeDistance = 1.8,
  vignetteStrength = 1.5,
  glowIntensity = 0.15,
  opacity = 0.6,
  gridRotation = 0,
  mouseInteraction = true,
  mouseInteractionRadius = 1.5,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePositionRef = useRef({ x: 0.5, y: 0.5 });
  const targetMouseRef = useRef({ x: 0.5, y: 0.5 });
  const mouseInfluenceRef = useRef(0);
  const uniformsRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? [
          parseInt(result[1], 16) / 255,
          parseInt(result[2], 16) / 255,
          parseInt(result[3], 16) / 255,
        ]
        : [1, 1, 1];
    };

    const renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio, 2),
      alpha: true,
    });
    const gl = renderer.gl;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    gl.canvas.style.position = "absolute";
    gl.canvas.style.top = "0";
    gl.canvas.style.left = "0";
    gl.canvas.style.zIndex = "-1";
    containerRef.current.appendChild(gl.canvas);

    const vert = \`
attribute vec2 position;
varying vec2 vUv;
void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
}\`;

    const frag = \`precision highp float;
uniform float iTime;
uniform vec2 iResolution;
uniform bool enableRainbow;
uniform vec3 gridColor;
uniform float rippleIntensity;
uniform float gridSize;
uniform float gridThickness;
uniform float fadeDistance;
uniform float vignetteStrength;
uniform float glowIntensity;
uniform float opacity;
uniform float gridRotation;
uniform bool mouseInteraction;
uniform vec2 mousePosition;
uniform float mouseInfluence;
uniform float mouseInteractionRadius;
varying vec2 vUv;

float pi = 3.141592;

mat2 rotate(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
}

void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    uv.x *= iResolution.x / iResolution.y;

    if (gridRotation != 0.0) {
        uv = rotate(gridRotation * pi / 180.0) * uv;
    }

    float dist = length(uv);
    float func = sin(pi * (iTime - dist));
    vec2 rippleUv = uv + uv * func * rippleIntensity;

    if (mouseInteraction && mouseInfluence > 0.0) {
        vec2 mouseUv = (mousePosition * 2.0 - 1.0);
        mouseUv.x *= iResolution.x / iResolution.y;
        float mouseDist = length(uv - mouseUv);
        
        float influence = mouseInfluence * exp(-mouseDist * mouseDist / (mouseInteractionRadius * mouseInteractionRadius));
        
        float mouseWave = sin(pi * (iTime * 2.0 - mouseDist * 3.0)) * influence;
        rippleUv += normalize(uv - mouseUv) * mouseWave * rippleIntensity * 0.3;
    }

    vec2 a = sin(gridSize * 0.5 * pi * rippleUv - pi / 2.0);
    vec2 b = abs(a);

    float aaWidth = 0.5;
    vec2 smoothB = vec2(
        smoothstep(0.0, aaWidth, b.x),
        smoothstep(0.0, aaWidth, b.y)
    );

    vec3 color = vec3(0.0);
    color += exp(-gridThickness * smoothB.x * (0.8 + 0.5 * sin(pi * iTime)));
    color += exp(-gridThickness * smoothB.y);
    color += 0.5 * exp(-(gridThickness / 4.0) * sin(smoothB.x));
    color += 0.5 * exp(-(gridThickness / 3.0) * smoothB.y);

    if (glowIntensity > 0.0) {
        color += glowIntensity * exp(-gridThickness * 0.5 * smoothB.x);
        color += glowIntensity * exp(-gridThickness * 0.5 * smoothB.y);
    }

    float ddd = exp(-2.0 * clamp(pow(dist, fadeDistance), 0.0, 1.0));
    
    vec2 vignetteCoords = vUv - 0.5;
    float vignetteDistance = length(vignetteCoords);
    float vignette = 1.0 - pow(vignetteDistance * 2.0, vignetteStrength);
    vignette = clamp(vignette, 0.0, 1.0);
    
    vec3 t;
    if (enableRainbow) {
        t = vec3(
            uv.x * 0.5 + 0.5 * sin(iTime),
            uv.y * 0.5 + 0.5 * cos(iTime),
            pow(cos(iTime), 4.0)
        ) + 0.5;
    } else {
        t = gridColor;
    }

    float finalFade = ddd * vignette;
    float alpha = length(color) * finalFade * opacity;
    gl_FragColor = vec4(color * t * finalFade * opacity, alpha);
}\`;

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: [1, 1] },
      enableRainbow: { value: enableRainbow },
      gridColor: { value: hexToRgb(gridColor) },
      rippleIntensity: { value: rippleIntensity },
      gridSize: { value: gridSize },
      gridThickness: { value: gridThickness },
      fadeDistance: { value: fadeDistance },
      vignetteStrength: { value: vignetteStrength },
      glowIntensity: { value: glowIntensity },
      opacity: { value: opacity },
      gridRotation: { value: gridRotation },
      mouseInteraction: { value: mouseInteraction },
      mousePosition: { value: [0.5, 0.5] },
      mouseInfluence: { value: 0 },
      mouseInteractionRadius: { value: mouseInteractionRadius },
    };

    uniformsRef.current = uniforms;

    const geometry = new Triangle(gl);
    const program = new Program(gl, { vertex: vert, fragment: frag, uniforms });
    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      if (!containerRef.current) return;
      const { clientWidth: w, clientHeight: h } = containerRef.current;
      renderer.setSize(w, h);
      uniforms.iResolution.value = [w, h];
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!mouseInteraction || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      targetMouseRef.current = { x, y };
    };

    const handleMouseEnter = () => {
      if (!mouseInteraction) return;
      mouseInfluenceRef.current = 1.0;
    };

    const handleMouseLeave = () => {
      if (!mouseInteraction) return;
      mouseInfluenceRef.current = 0.0;
    };

    window.addEventListener("resize", resize);
    if (mouseInteraction) {
      containerRef.current.addEventListener("mousemove", handleMouseMove);
      containerRef.current.addEventListener("mouseenter", handleMouseEnter);
      containerRef.current.addEventListener("mouseleave", handleMouseLeave);
    }
    resize();

    const render = (t: number) => {
      uniforms.iTime.value = t * 0.001;

      const lerpFactor = 0.1;
      mousePositionRef.current.x +=
        (targetMouseRef.current.x - mousePositionRef.current.x) * lerpFactor;
      mousePositionRef.current.y +=
        (targetMouseRef.current.y - mousePositionRef.current.y) * lerpFactor;

      const currentInfluence = uniforms.mouseInfluence.value;
      const targetInfluence = mouseInfluenceRef.current;
      uniforms.mouseInfluence.value +=
        (targetInfluence - currentInfluence) * 0.05;

      uniforms.mousePosition.value = [
        mousePositionRef.current.x,
        mousePositionRef.current.y,
      ];

      renderer.render({ scene: mesh });
      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      if (mouseInteraction && containerRef.current) {
        containerRef.current.removeEventListener("mousemove", handleMouseMove);
        containerRef.current.removeEventListener("mouseenter", handleMouseEnter);
        containerRef.current.removeEventListener("mouseleave", handleMouseLeave);
      }
      renderer.gl.getExtension("WEBGL_lose_context")?.loseContext();
      if (containerRef.current && gl.canvas) {
        containerRef.current.removeChild(gl.canvas);
      }
    };
  }, []);

  useEffect(() => {
    if (!uniformsRef.current) return;

    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? [
          parseInt(result[1], 16) / 255,
          parseInt(result[2], 16) / 255,
          parseInt(result[3], 16) / 255,
        ]
        : [1, 1, 1];
    };

    uniformsRef.current.enableRainbow.value = enableRainbow;
    uniformsRef.current.gridColor.value = hexToRgb(gridColor);
    uniformsRef.current.rippleIntensity.value = rippleIntensity;
    uniformsRef.current.gridSize.value = gridSize;
    uniformsRef.current.gridThickness.value = gridThickness;
    uniformsRef.current.fadeDistance.value = fadeDistance;
    uniformsRef.current.vignetteStrength.value = vignetteStrength;
    uniformsRef.current.glowIntensity.value = glowIntensity;
    uniformsRef.current.opacity.value = opacity;
    uniformsRef.current.gridRotation.value = gridRotation;
    uniformsRef.current.mouseInteraction.value = mouseInteraction;
    uniformsRef.current.mouseInteractionRadius.value = mouseInteractionRadius;
  }, [
    enableRainbow,
    gridColor,
    rippleIntensity,
    gridSize,
    gridThickness,
    fadeDistance,
    vignetteStrength,
    glowIntensity,
    opacity,
    gridRotation,
    mouseInteraction,
    mouseInteractionRadius,
  ]);

  return <div ref={containerRef} className="w-full h-full absolute inset-0 overflow-hidden pointer-events-none" />;
};

export default RippleGrid;
```

### **PASSO 3: CRIAR WRAPPER DE BACKGROUND**

**Criar: `client/src/components/BackgroundWrapper/BackgroundWrapper.tsx`**
```typescript
import React from 'react'
import RippleGrid from '../RippleGrid/RippleGrid'

interface BackgroundWrapperProps {
  children: React.ReactNode
  variant?: 'default' | 'home' | 'games' | 'landing'
}

const BackgroundWrapper: React.FC<BackgroundWrapperProps> = ({ 
  children, 
  variant = 'default' 
}) => {
  // Configurações diferentes por seção
  const getBackgroundConfig = () => {
    switch (variant) {
      case 'landing':
        return {
          gridColor: "#2ad6d0", // Cyan para landing
          rippleIntensity: 0.12,
          gridSize: 15.0,
          gridThickness: 25.0,
          opacity: 0.8,
          glowIntensity: 0.2,
          mouseInteractionRadius: 2.0
        }
      
      case 'home':
        return {
          gridColor: "#9a45fc", // Purple para home
          rippleIntensity: 0.08,
          gridSize: 12.0,
          gridThickness: 20.0,
          opacity: 0.6,
          glowIntensity: 0.15,
          mouseInteractionRadius: 1.5
        }
      
      case 'games':
        return {
          gridColor: "#ffe118", // Yellow para games
          rippleIntensity: 0.10,
          gridSize: 10.0,
          gridThickness: 18.0,
          opacity: 0.5,
          glowIntensity: 0.18,
          mouseInteractionRadius: 1.8
        }
      
      default:
        return {
          gridColor: "#9a45fc", // Purple padrão
          rippleIntensity: 0.08,
          gridSize: 12.0,
          gridThickness: 20.0,
          opacity: 0.6,
          glowIntensity: 0.15,
          mouseInteractionRadius: 1.5
        }
    }
  }

  const config = getBackgroundConfig()

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background RippleGrid */}
      <RippleGrid
        enableRainbow={false}
        fadeDistance={1.8}
        vignetteStrength={1.5}
        gridRotation={0}
        mouseInteraction={true}
        {...config}
      />
      
      {/* Overlay gradient para melhor contraste */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />
      
      {/* Conteúdo */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  )
}

export default BackgroundWrapper
```

### **PASSO 4: ATUALIZAR MAIN DASHBOARD**

**Atualizar: `client/src/components/MainDashboard.tsx`**
```typescript
import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { usePoints } from '../hooks/usePoints'
import Sidebar from './Sidebar'
import DashboardHeader from './DashboardHeader'
import BackgroundWrapper from './BackgroundWrapper/BackgroundWrapper'

// Importar conteúdos
import HomeContent from './content/HomeContent'
import GamesContent from './content/GamesContent'
import StatisticsContent from './content/StatisticsContent'
import RankingContent from './content/RankingContent'
import ShopContent from './content/ShopContent'
import SettingsContent from './content/SettingsContent'

const MainDashboard = () => {
  const { user } = useAuth()
  const { totalPoints } = usePoints()
  const [activeSection, setActiveSection] = useState('home')
  const [activeGame, setActiveGame] = useState('meow-clicker')

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return <HomeContent user={user} />
      case 'games':
        return <GamesContent activeGame={activeGame} setActiveGame={setActiveGame} />
      case 'statistics':
        return <StatisticsContent user={user} />
      case 'ranking':
        return <RankingContent />
      case 'shop':
        return <ShopContent user={user} />
      case 'settings':
        return <SettingsContent user={user} />
      default:
        return <HomeContent user={user} />
    }
  }

  // Determinar variante do background baseado na seção ativa
  const getBackgroundVariant = () => {
    if (activeSection === 'home') return 'home'
    if (activeSection === 'games') return 'games'
    return 'default'
  }

  return (
    <BackgroundWrapper variant={getBackgroundVariant()}>
      <div className="dashboard-container">
        {/* Header fixo com wallet e pontos */}
        <DashboardHeader user={user} totalPoints={totalPoints} />
        
        <div className="dashboard-body">
          {/* Sidebar navigation */}
          <Sidebar 
            activeSection={activeSection}
            activeGame={activeGame}
            onSectionChange={setActiveSection}
            onGameChange={setActiveGame}
          />
          
          {/* Conteúdo principal dinâmico */}
          <main className="main-content">
            <div className="content-wrapper">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </BackgroundWrapper>
  )
}

export default MainDashboard
```

### **PASSO 5: ATUALIZAR LANDING PAGE**

**Atualizar: `client/src/components/LandingPage.tsx`**
```typescript
import React from 'react'
import { useAuth } from '../hooks/useAuth'
import BackgroundWrapper from './BackgroundWrapper/BackgroundWrapper'
import StarBorder from './StarBorder/StarBorder'

const LandingPage = () => {
  const { login, isLoading } = useAuth()

  return (
    <BackgroundWrapper variant="landing">
      <div className="landing-container">
        <div className="landing-content">
          <div className="hero-section">
            <div className="logo-container">
              <div className="logo-icon">🐱</div>
              <h1 className="logo-title">MEOW TOKEN</h1>
              <p className="logo-subtitle">
                O futuro dos jogos Web3 na Solana
              </p>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🎮</div>
                <h3 className="feature-title">5 Jogos Únicos</h3>
                <p className="feature-description">
                  Clicker, Quiz, Spin, Hunt e Arena
                </p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">💎</div>
                <h3 className="feature-title">Sistema de Pontos</h3>
                <p className="feature-description">
                  Acumule pontos para o TGE
                </p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">🏆</div>
                <h3 className="feature-title">Ranking Global</h3>
                <p className="feature-description">
                  Compete com jogadores mundiais
                </p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">🔗</div>
                <h3 className="feature-title">Solana Native</h3>
                <p className="feature-description">
                  Integração completa com blockchain
                </p>
              </div>
            </div>

            <div className="cta-section">
              <StarBorder
                color="cyan"
                speed="3s"
                className="cta-button"
                onClick={login}
                disabled={isLoading}
              >
                <div className="cta-content">
                  <span className="cta-icon">🚀</span>
                  <span className="cta-text">
                    {isLoading ? 'Conectando...' : 'Conectar Phantom Wallet'}
                  </span>
                </div>
              </StarBorder>
              
              <p className="cta-description">
                Conecte sua carteira Phantom para começar a jogar
              </p>
            </div>
          </div>
        </div>
      </div>
    </BackgroundWrapper>
  )
}

export default LandingPage
```

### **PASSO 6: ATUALIZAR APP PRINCIPAL**

**Atualizar: `client/src/App.tsx`**
```typescript
import React from 'react'
import { useAuth } from './hooks/useAuth'
import MainDashboard from './components/MainDashboard'
import LandingPage from './components/LandingPage'
import LoadingScreen from './components/LoadingScreen'

const App = () => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="app">
      {isAuthenticated ? <MainDashboard /> : <LandingPage />}
    </div>
  )
}

export default App
```

### **PASSO 7: CRIAR LOADING SCREEN COM BACKGROUND**

**Criar: `client/src/components/LoadingScreen.tsx`**
```typescript
import React from 'react'
import BackgroundWrapper from './BackgroundWrapper/BackgroundWrapper'

const LoadingScreen = () => {
  return (
    <BackgroundWrapper variant="default">
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-logo">
            <div className="logo-icon animate-bounce">🐱</div>
            <h1 className="logo-title">MEOW TOKEN</h1>
          </div>
          
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          
          <p className="loading-text">
            Carregando experiência Web3...
          </p>
        </div>
      </div>
    </BackgroundWrapper>
  )
}

export default LoadingScreen
```

### **PASSO 8: ATUALIZAR CSS GLOBAL**

**Adicionar ao `client/src/index.css`:**
```css
/* BACKGROUND WRAPPER STYLES */
.landing-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.landing-content {
  max-width: 1200px;
  width: 100%;
  text-align: center;
}

.hero-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 60px;
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.logo-icon {
  font-size: 6rem;
  animation: float 3s ease-in-out infinite;
}

.logo-title {
  font-size: 4rem;
  font-weight: bold;
  color: var(--neon-cyan);
  text-shadow: 
    0 0 20px var(--neon-cyan),
    0 0 40px var(--neon-cyan);
  animation: title-glow 2s ease-in-out infinite alternate;
  margin: 0;
}

.logo-subtitle {
  font-size: 1.5rem;
  color: #cccccc;
  margin: 0;
  opacity: 0.9;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  width: 100%;
  max-width: 800px;
}

.feature-card {
  background: rgba(26, 13, 46, 0.8);
  border: 1px solid var(--neon-purple);
  border-radius: 20px;
  padding: 30px 20px;
  text-align: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(154, 69, 252, 0.3);
  border-color: var(--neon-cyan);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--neon-cyan);
  margin: 0 0 10px 0;
}

.feature-description {
  color: #cccccc;
  margin: 0;
  opacity: 0.9;
}

.cta-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.cta-button {
  min-width: 300px;
}

.cta-content {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: bold;
}

.cta-icon {
  font-size: 24px;
}

.cta-description {
  color: #cccccc;
  margin: 0;
  opacity: 0.8;
}

/* LOADING SCREEN */
.loading-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.loading-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(42, 214, 208, 0.3);
  border-top: 3px solid var(--neon-cyan);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: #cccccc;
  font-size: 16px;
  margin: 0;
  opacity: 0.8;
}

/* ANIMATIONS */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* DASHBOARD ADJUSTMENTS */
.dashboard-container {
  background: transparent; /* Remove background fixo */
}

.main-content::before {
  display: none; /* Remove grid CSS anterior */
}

/* RESPONSIVIDADE */
@media (max-width: 768px) {
  .logo-title {
    font-size: 3rem;
  }
  
  .logo-subtitle {
    font-size: 1.2rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .feature-card {
    padding: 20px 15px;
  }
  
  .cta-button {
    min-width: 250px;
  }
  
  .cta-content {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .logo-icon {
    font-size: 4rem;
  }
  
  .logo-title {
    font-size: 2.5rem;
  }
  
  .hero-section {
    gap: 40px;
  }
  
  .landing-container {
    padding: 15px;
  }
}
```

---

## 🚀 **INSTRUÇÕES DE IMPLEMENTAÇÃO**

### **EXECUTAR NO REPLIT:**

1. **Instalar OGL:** `npm install ogl`
2. **Criar RippleGrid component** com shader personalizado
3. **Criar BackgroundWrapper** com variantes por seção
4. **Atualizar MainDashboard** para usar BackgroundWrapper
5. **Atualizar LandingPage** com background animado
6. **Criar LoadingScreen** com background
7. **Adicionar CSS** para integração visual
8. **Testar performance** em diferentes dispositivos

### **CONFIGURAÇÕES POR SEÇÃO:**

- **🏠 Landing:** Cyan (#2ad6d0) - Mais intenso e chamativo
- **🏠 Home:** Purple (#9a45fc) - Elegante e moderno  
- **🎮 Games:** Yellow (#ffe118) - Energético e dinâmico
- **📊 Default:** Purple (#9a45fc) - Consistente

### **RESULTADO ESPERADO:**

Após implementação:
- ✅ **Background animado** em todas as páginas
- ✅ **Efeitos de mouse** interativos
- ✅ **Cores dinâmicas** por seção
- ✅ **Performance otimizada** com WebGL
- ✅ **Responsividade** mantida
- ✅ **Integração perfeita** com componentes existentes
- ✅ **Loading states** com background
- ✅ **Transições suaves** entre seções

**EXECUTE ESTE PROMPT PARA TER UM BACKGROUND ANIMADO ESPETACULAR!** 🌊✨

