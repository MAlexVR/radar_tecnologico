# Radar Tecnológico - Área de Telecomunicaciones

Visualización interactiva de radar tecnológico para vigilancia tecnológica y prospectiva 2025-2035.

## 📁 Estructura del Proyecto

```
radar-telecom/
├── index.html          # Archivo HTML principal
├── css/
│   └── styles.css      # Estilos CSS
├── js/
│   └── app.js          # Lógica de la aplicación (JavaScript)
├── data/
│   └── default-data.js # Datos por defecto (como módulo JS)
└── README.md           # Documentación
```

## 🚀 Uso

### Opción 1: Abrir directamente
Simplemente abre `index.html` en un navegador web moderno.

### Opción 2: Servidor local
Para evitar problemas de CORS con archivos JSON externos:

```bash
# Con Python 3
python -m http.server 8080

# Con Node.js (http-server)
npx http-server -p 8080

# Con PHP
php -S localhost:8080
```

Luego visita: `http://localhost:8080`

## 📊 Estructura de Datos

Los datos del radar siguen esta estructura JSON:

```json
[
  {
    "direccionador": "1. Nombre del Direccionador",
    "color": "#3b82f6",
    "areas_tecnologicas": [
      {
        "nombre_area": "Nombre del Área",
        "lineas_tecnologicas": [
          {
            "nombre_linea": "Nombre de la Línea",
            "sublineas": ["Sublínea 1", "Sublínea 2"]
          }
        ]
      }
    ]
  }
]
```

## 🎮 Funcionalidades

- **📂 Cargar**: Importar datos desde archivo JSON
- **💾 Guardar**: Exportar datos actuales como JSON
- **📸 Exportar**: Generar imagen PNG del radar
- **🔍 Zoom**: Controles de zoom (+, -, reset)
- **📱 Responsive**: Adaptable a dispositivos móviles
- **🖱️ Interactivo**: 
  - Hover para ver tooltips
  - Click en sectores para ver detalles
  - Doble click para abrir modal completo
  - Sidebar navegable

## 🛠️ Tecnologías

- **HTML5** - Estructura semántica
- **CSS3** - Estilos con variables CSS y diseño responsivo
- **JavaScript ES6+** - Lógica modular
- **D3.js v7** - Visualización de datos

## 📝 Notas sobre CORS

El archivo `default-data.js` contiene los datos como variable JavaScript en lugar de JSON externo para evitar problemas de CORS cuando se abre localmente sin servidor.

Si necesitas cargar JSON externo en un servidor, puedes usar fetch:

```javascript
fetch('data/radar-data.json')
  .then(response => response.json())
  .then(data => {
    state.data = data;
    RadarChart.render();
  });
```

## 📄 Licencia

Uso interno - Área de Telecomunicaciones
