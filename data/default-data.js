/**
 * Radar Tecnológico - Datos por Defecto
 * 
 * Este archivo contiene los datos de ejemplo del radar tecnológico.
 * Se exporta como variable global para evitar problemas de CORS al cargar JSON externo.
 * 
 * Estructura de datos:
 * - direccionador: Nombre del direccionador estratégico
 * - color: Color hexadecimal para visualización
 * - areas_tecnologicas: Array de áreas tecnológicas
 *   - nombre_area: Nombre del área
 *   - lineas_tecnologicas: Array de líneas tecnológicas
 *     - nombre_linea: Nombre de la línea
 *     - sublineas: Array de strings con las sublíneas
 */

const DEFAULT_RADAR_DATA = [
  {
    direccionador: "1. Inteligencia NATIVA y Redes Autónomas (AN): Automatización y Gestión Impulsada por IA",
    color: "#3b82f6",
    areas_tecnologicas: [
      {
        nombre_area: "Redes Autónomas (AN) y Zero-Touch Management",
        lineas_tecnologicas: [
          {
            nombre_linea: "Arquitecturas E2E y Marco ZSM",
            sublineas: ["Integración de IA", "Slicing SDN", "Marcos estandarizados"]
          },
          {
            nombre_linea: "Gestión Intent-Driven",
            sublineas: ["IBN", "Gestión centralizada"]
          },
          {
            nombre_linea: "Bucles Control Self-X",
            sublineas: ["Self-healing", "Automatización cloud-native"]
          },
          {
            nombre_linea: "Autonomía L4-L5",
            sublineas: ["Zero-touch", "Self-healing avanzado"]
          }
        ]
      },
      {
        nombre_area: "Operaciones de Red con IA (AIOps)",
        lineas_tecnologicas: [
          {
            nombre_linea: "Monitoreo Predictivo",
            sublineas: ["Analítica real-time", "Detección anomalías"]
          },
          {
            nombre_linea: "Automatización Mantenimiento",
            sublineas: ["Reducción costos", "Mantenimiento predictivo"]
          },
          {
            nombre_linea: "GenAI en Operaciones",
            sublineas: ["Asistentes virtuales", "Personalización"]
          }
        ]
      },
      {
        nombre_area: "Inteligencia de Red Experiencial (ENI)",
        lineas_tecnologicas: [
          {
            nombre_linea: "Arquitecturas Cognitivas",
            sublineas: ["Edge-cloud", "Seguridad situacional"]
          },
          {
            nombre_linea: "Cognición Experiencial",
            sublineas: ["Análisis 5G", "Aprendizaje continuo"]
          }
        ]
      },
      {
        nombre_area: "Gemelos Digitales de Red (NDT)",
        lineas_tecnologicas: [
          {
            nombre_linea: "Réplicas Virtuales",
            sublineas: ["Gestión predictiva", "Sincronización"]
          },
          {
            nombre_linea: "Simulación NDT",
            sublineas: ["IoT-IA", "Escenarios what-if"]
          }
        ]
      }
    ]
  },
  {
    direccionador: "2. Conectividad Extrema y Convergente (Hacia 6G y Ubicuidad)",
    color: "#f97316",
    areas_tecnologicas: [
      {
        nombre_area: "Evolución 5G-Advanced y 6G",
        lineas_tecnologicas: [
          {
            nombre_linea: "5G-Advanced Rel.18-20",
            sublineas: ["mmWave", "Open RAN"]
          },
          {
            nombre_linea: "Capacidades 6G",
            sublineas: ["Cell-Free MIMO", "User-centric"]
          },
          {
            nombre_linea: "Redes Privadas 5G",
            sublineas: ["IIoT", "TSN industrial"]
          }
        ]
      },
      {
        nombre_area: "Redes No Terrestres (NTN)",
        lineas_tecnologicas: [
          {
            nombre_linea: "Integración NTN",
            sublineas: ["IoT satelital", "LEO"]
          },
          {
            nombre_linea: "Direct-to-Cellular",
            sublineas: ["LEO directos", "Cobertura global"]
          }
        ]
      },
      {
        nombre_area: "Redes Ópticas Avanzadas F5G/F6G",
        lineas_tecnologicas: [
          {
            nombre_linea: "Fiber to Everything",
            sublineas: ["800G+", "LiFi"]
          },
          {
            nombre_linea: "Automatización Óptica",
            sublineas: ["DSP coherentes", "Self-optimization"]
          }
        ]
      },
      {
        nombre_area: "Tecnologías de Radio Avanzadas",
        lineas_tecnologicas: [
          {
            nombre_linea: "Espectro Superior THz",
            sublineas: ["mmWave", "THz"]
          },
          {
            nombre_linea: "Superficies RIS",
            sublineas: ["Beamforming", "MIMO distribuido"]
          }
        ]
      }
    ]
  },
  {
    direccionador: "3. Arquitectura Desagregada y Plataformas de Cómputo Distribuido",
    color: "#22c55e",
    areas_tecnologicas: [
      {
        nombre_area: "Cloudificación y Cloud-Native (CNF)",
        lineas_tecnologicas: [
          {
            nombre_linea: "Arquitecturas Cloud-Native",
            sublineas: ["Cloud Continuum", "Microservicios"]
          },
          {
            nombre_linea: "CI/CD/CT Lifecycle",
            sublineas: ["DevOps", "GitOps"]
          }
        ]
      },
      {
        nombre_area: "Edge Computing (MEC)",
        lineas_tecnologicas: [
          {
            nombre_linea: "Plataformas MEC/Edge",
            sublineas: ["AR", "Edge IIoT"]
          },
          {
            nombre_linea: "Servicios Baja Latencia",
            sublineas: ["Gaming cloud", "Apps críticas"]
          }
        ]
      },
      {
        nombre_area: "Open RAN (O-RAN)",
        lineas_tecnologicas: [
          {
            nombre_linea: "Desagregación RAN",
            sublineas: ["RIC", "Fronthaul abierto"]
          },
          {
            nombre_linea: "Plataformas Abiertas",
            sublineas: ["Multi-vendor", "Costos reducidos"]
          }
        ]
      },
      {
        nombre_area: "SDN/NFV e IPv6+",
        lineas_tecnologicas: [
          {
            nombre_linea: "Softwarización",
            sublineas: ["Gestión centralizada", "Programabilidad"]
          },
          {
            nombre_linea: "IPv6 Enhanced",
            sublineas: ["SRv6", "Network slicing"]
          }
        ]
      }
    ]
  },
  {
    direccionador: "4. Monetización de Capacidades y Transformación B2B",
    color: "#ef4444",
    areas_tecnologicas: [
      {
        nombre_area: "Evolución Techco y Servicios B2B",
        lineas_tecnologicas: [
          {
            nombre_linea: "Plataforma Digital Techco",
            sublineas: ["Platform-as-Business", "Ecosistemas IT"]
          },
          {
            nombre_linea: "Servicios B2B",
            sublineas: ["Analítica servicio", "Verticales"]
          }
        ]
      },
      {
        nombre_area: "APIs de Red y NaaS",
        lineas_tecnologicas: [
          {
            nombre_linea: "NaaS/XaaS",
            sublineas: ["Open Gateway", "Developer portals"]
          },
          {
            nombre_linea: "Marketplaces APIs",
            sublineas: ["Partner ecosystems", "Revenue sharing"]
          }
        ]
      },
      {
        nombre_area: "Network Slicing Inteligente",
        lineas_tecnologicas: [
          {
            nombre_linea: "Orquestación E2E",
            sublineas: ["Slicing cloud-native", "SLA automation"]
          },
          {
            nombre_linea: "Optimización Dinámica",
            sublineas: ["Intent-based", "Throughput"]
          }
        ]
      },
      {
        nombre_area: "Digitalización de Verticales",
        lineas_tecnologicas: [
          {
            nombre_linea: "Industria 4.0",
            sublineas: ["5G privadas", "Digital twins"]
          },
          {
            nombre_linea: "Smart Cities",
            sublineas: ["IoT urbano", "Gestión inteligente"]
          },
          {
            nombre_linea: "Salud Digital",
            sublineas: ["Telemedicina XR", "Monitoreo remoto"]
          }
        ]
      }
    ]
  },
  {
    direccionador: "5. Confianza, Resiliencia y Sostenibilidad (KVI)",
    color: "#a855f7",
    areas_tecnologicas: [
      {
        nombre_area: "Sostenibilidad Green-Native",
        lineas_tecnologicas: [
          {
            nombre_linea: "Redes Green-Native",
            sublineas: ["Renovables", "Zero waste"]
          },
          {
            nombre_linea: "Optimización Energética IA",
            sublineas: ["ML eficiencia", "Sleep modes"]
          },
          {
            nombre_linea: "Economía Circular",
            sublineas: ["Trade-in", "E-waste"]
          }
        ]
      },
      {
        nombre_area: "Confianza y Ciber-resiliencia",
        lineas_tecnologicas: [
          {
            nombre_linea: "Zero Trust Architecture",
            sublineas: ["Control dinámico", "Microsegmentación"]
          },
          {
            nombre_linea: "Seguridad AI-driven",
            sublineas: ["Threat intelligence", "Automated response"]
          }
        ]
      },
      {
        nombre_area: "Criptografía Post-Quantum",
        lineas_tecnologicas: [
          {
            nombre_linea: "Redes Quantum-Safe",
            sublineas: ["QKD", "Hybrid crypto"]
          },
          {
            nombre_linea: "PQC Implementation",
            sublineas: ["NIST standards", "Migration"]
          }
        ]
      },
      {
        nombre_area: "Gobernanza de Datos y AI",
        lineas_tecnologicas: [
          {
            nombre_linea: "Marcos Gobernanza AI",
            sublineas: ["AI ethics", "Explainable AI"]
          },
          {
            nombre_linea: "Blockchain Telecom",
            sublineas: ["Smart contracts", "Supply chain"]
          }
        ]
      },
      {
        nombre_area: "Inclusión Digital UN SDGs",
        lineas_tecnologicas: [
          {
            nombre_linea: "Conectividad Universal",
            sublineas: ["5G FWA rural", "Affordable"]
          },
          {
            nombre_linea: "EdTech",
            sublineas: ["IA-VR educación", "Digital literacy"]
          }
        ]
      }
    ]
  }
];

// Exportar para uso en módulos ES6 (si se usa)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DEFAULT_RADAR_DATA;
}
