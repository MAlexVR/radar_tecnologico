/**
 * Radar Tecnológico - Área de Telecomunicaciones
 * Aplicación Principal
 * 
 * @version 1.0.0
 * @description Visualización interactiva de radar tecnológico usando D3.js
 * 
 * Módulos:
 * - CONFIG: Configuración global
 * - State: Estado de la aplicación
 * - Utils: Funciones utilitarias
 * - Tooltip: Gestión de tooltips
 * - Modal: Sistema de modales
 * - Sidebar: Panel lateral
 * - RadarChart: Renderizado del radar
 * - ZoomControls: Control de zoom
 * - FileOps: Operaciones de archivo
 */

const RadarApp = (() => {
  'use strict';

  /* ==========================================================================
     CONFIGURACIÓN
     ========================================================================== */
  const CONFIG = {
    dimensions: {
      centerRadius: 0.12,
      driverRadius: 0.35,
      areaRadius: 0.62,
      techRadius: 0.88
    },
    zoom: {
      min: 0.4,
      max: 4,
      step: 0.3
    },
    animation: {
      duration: 300
    }
  };

  /* ==========================================================================
     ESTADO DE LA APLICACIÓN
     ========================================================================== */
  const state = {
    data: null,
    svg: null,
    width: 0,
    height: 0,
    radius: 0,
    mainGroup: null,
    zoomBehavior: null,
    currentZoom: 1,
    currentTransform: null,
    sidebarOpen: true,
    root: null,
    activeDriverIdx: null,
    activeAreaIdx: null
  };

  /* ==========================================================================
     UTILIDADES
     ========================================================================== */
  const Utils = {
    /**
     * Trunca un texto a una longitud máxima
     * @param {string} text - Texto a truncar
     * @param {number} maxLength - Longitud máxima
     * @returns {string} Texto truncado
     */
    truncate(text, maxLength) {
      return text.length <= maxLength ? text : text.substring(0, maxLength - 1) + "…";
    },

    /**
     * Extrae el nombre corto de un direccionador
     * @param {string} name - Nombre completo del direccionador
     * @returns {string} Nombre corto
     */
    getDriverShortName(name) {
      const match = name.match(/^\d+\.\s*([^(:]+)/);
      return match ? match[1].trim() : name.split(":")[0];
    },

    /**
     * Extrae el número de un direccionador
     * @param {string} name - Nombre del direccionador
     * @returns {string} Número del direccionador
     */
    getDriverNumber(name) {
      const match = name.match(/^(\d+)\./);
      return match ? match[1] : "";
    },

    /**
     * Divide el texto en líneas para etiquetas del radar
     * @param {string} text - Texto a dividir
     * @param {number} maxLines - Número máximo de líneas
     * @param {number} maxCharsPerLine - Caracteres máximos por línea
     * @returns {string[]} Array de líneas
     */
    splitTextForLabel(text, maxLines, maxCharsPerLine) {
      let cleaned = text.replace(/^\d+\.\s*/, "");
      const stopIdx = cleaned.search(/[:(]/);
      if (stopIdx > 0) cleaned = cleaned.substring(0, stopIdx).trim();
      
      const words = cleaned.split(/\s+/);
      const lines = [];
      let currentLine = "";
      
      for (const word of words) {
        if (lines.length >= maxLines) break;
        const testLine = currentLine ? currentLine + " " + word : word;
        if (testLine.length <= maxCharsPerLine) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            lines.push(word.substring(0, maxCharsPerLine));
            currentLine = "";
          }
        }
      }
      if (currentLine && lines.length < maxLines) lines.push(currentLine);
      return lines;
    },

    /**
     * Crea una función con debounce
     * @param {Function} fn - Función a ejecutar
     * @param {number} wait - Tiempo de espera en ms
     * @returns {Function} Función con debounce
     */
    debounce(fn, wait) {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), wait);
      };
    }
  };

  /* ==========================================================================
     TOOLTIP
     ========================================================================== */
  const Tooltip = {
    el: null,

    init() {
      this.el = document.getElementById("tooltip");
    },

    show(event, title, category, hint, badge) {
      this.el.querySelector(".tooltip-title").textContent = title;
      this.el.querySelector(".tooltip-category").textContent = category;
      this.el.querySelector(".tooltip-hint").innerHTML = 
        hint + (badge ? `<div class="tooltip-badge">${badge}</div>` : "");
      this.el.classList.add("visible");
      this.move(event);
    },

    move(event) {
      const rect = this.el.getBoundingClientRect();
      const x = Math.min(event.clientX + 15, window.innerWidth - rect.width - 20);
      const y = Math.min(event.clientY + 15, window.innerHeight - rect.height - 20);
      this.el.style.left = x + "px";
      this.el.style.top = y + "px";
    },

    hide() {
      this.el.classList.remove("visible");
    }
  };

  /* ==========================================================================
     MODAL
     ========================================================================== */
  const Modal = {
    el: null,
    titleEl: null,
    bodyEl: null,
    breadcrumbEl: null,

    init() {
      this.el = document.getElementById("modal");
      this.titleEl = document.getElementById("modalTitle");
      this.bodyEl = document.getElementById("modalBody");
      this.breadcrumbEl = document.getElementById("modalBreadcrumb");

      document.getElementById("modalClose").addEventListener("click", () => this.close());
      this.el.addEventListener("click", (e) => {
        if (e.target === this.el) this.close();
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") this.close();
      });
    },

    open() {
      this.el.classList.add("active");
      document.body.style.overflow = "hidden";
    },

    close() {
      this.el.classList.remove("active");
      document.body.style.overflow = "";
    },

    showDriver(driver) {
      const idx = state.data.indexOf(driver);
      this.titleEl.textContent = Utils.getDriverShortName(driver.direccionador);
      this.titleEl.style.color = driver.color;
      this.breadcrumbEl.innerHTML = `<span class="modal-breadcrumb-current">Direccionador ${Utils.getDriverNumber(driver.direccionador)}</span>`;

      const areas = driver.areas_tecnologicas || [];
      let html = `<div class="modal-section-title">Áreas Tecnológicas (${areas.length})</div><ul class="modal-list">`;
      
      areas.forEach((area, i) => {
        const count = area.lineas_tecnologicas?.length || 0;
        html += `<li class="modal-item modal-item--clickable" data-driver="${idx}" data-area="${i}">
          <div class="modal-item-title">${area.nombre_area}</div>
          <div class="modal-item-meta">${count} línea${count !== 1 ? "s" : ""}</div>
        </li>`;
      });
      html += "</ul>";
      
      this.bodyEl.innerHTML = html;
      this.bodyEl.querySelectorAll("[data-area]").forEach((item) => {
        item.addEventListener("click", () => {
          this.showArea(driver, driver.areas_tecnologicas[parseInt(item.dataset.area)]);
        });
      });
      this.open();
    },

    showArea(driver, area) {
      const dIdx = state.data.indexOf(driver);
      const aIdx = driver.areas_tecnologicas.indexOf(area);
      
      this.titleEl.textContent = area.nombre_area;
      this.titleEl.style.color = driver.color;
      this.breadcrumbEl.innerHTML = `
        <span class="modal-breadcrumb-link" data-back="driver" data-driver="${dIdx}">${Utils.getDriverShortName(driver.direccionador)}</span>
        <span class="modal-breadcrumb-sep">›</span>
        <span class="modal-breadcrumb-current">${Utils.truncate(area.nombre_area, 30)}</span>`;

      this.breadcrumbEl.querySelector('[data-back="driver"]').addEventListener("click", () => this.showDriver(driver));

      const lines = area.lineas_tecnologicas || [];
      let html = `<div class="modal-section-title">Líneas Tecnológicas (${lines.length})</div><ul class="modal-list">`;
      
      lines.forEach((line, i) => {
        const count = line.sublineas?.length || 0;
        html += `<li class="modal-item modal-item--clickable" data-driver="${dIdx}" data-area="${aIdx}" data-line="${i}">
          <div class="modal-item-title">${line.nombre_linea}</div>
          <div class="modal-item-meta">${count} sublínea${count !== 1 ? "s" : ""}</div>
        </li>`;
      });
      html += "</ul>";
      
      this.bodyEl.innerHTML = html;
      this.bodyEl.querySelectorAll("[data-line]").forEach((item) => {
        item.addEventListener("click", () => {
          this.showLine(driver, area, area.lineas_tecnologicas[parseInt(item.dataset.line)]);
        });
      });
      this.open();
    },

    showLine(driver, area, line) {
      const dIdx = state.data.indexOf(driver);
      const aIdx = driver.areas_tecnologicas.indexOf(area);
      
      this.titleEl.textContent = line.nombre_linea;
      this.titleEl.style.color = driver.color;
      this.breadcrumbEl.innerHTML = `
        <span class="modal-breadcrumb-link" data-back="driver" data-driver="${dIdx}">${Utils.getDriverShortName(driver.direccionador)}</span>
        <span class="modal-breadcrumb-sep">›</span>
        <span class="modal-breadcrumb-link" data-back="area" data-driver="${dIdx}" data-area="${aIdx}">${Utils.truncate(area.nombre_area, 18)}</span>
        <span class="modal-breadcrumb-sep">›</span>
        <span class="modal-breadcrumb-current">${Utils.truncate(line.nombre_linea, 18)}</span>`;

      this.breadcrumbEl.querySelector('[data-back="driver"]').addEventListener("click", () => this.showDriver(driver));
      this.breadcrumbEl.querySelector('[data-back="area"]').addEventListener("click", () => this.showArea(driver, area));

      const subs = line.sublineas || [];
      let html = `<button class="modal-back" data-driver="${dIdx}" data-area="${aIdx}">← Volver</button>
        <div class="modal-section-title">Sublíneas (${subs.length})</div>
        <ul class="modal-list">`;

      if (subs.length > 0) {
        subs.forEach((sub) => {
          html += `<li class="modal-item modal-item--subline" style="border-left-color:${driver.color}">
            <div class="modal-item-title">${sub}</div>
          </li>`;
        });
      } else {
        html += `<li class="modal-item modal-item--subline" style="border-left-color:${driver.color}">
          <div class="modal-item-title" style="color:var(--text-muted);font-style:italic">No hay sublíneas definidas.</div>
        </li>`;
      }
      html += "</ul>";
      
      this.bodyEl.innerHTML = html;
      this.bodyEl.querySelector(".modal-back").addEventListener("click", () => this.showArea(driver, area));
      this.open();
    }
  };

  /* ==========================================================================
     SIDEBAR
     ========================================================================== */
  const Sidebar = {
    init() {
      document.getElementById("sidebarClose").addEventListener("click", () => this.toggle(false));
      document.getElementById("sidebarToggle").addEventListener("click", () => this.toggle(true));
      document.getElementById("btnResetView").addEventListener("click", () => {
        RadarChart.clearHighlight();
        this.clearActiveStates();
        ZoomControls.reset();
      });
      document.getElementById("btnShowAll").addEventListener("click", () => {
        RadarChart.clearHighlight();
        this.clearActiveStates();
      });
    },

    toggle(open) {
      state.sidebarOpen = open;
      document.getElementById("sidebar").classList.toggle("collapsed", !open);
      document.getElementById("sidebarToggle").classList.toggle("hidden", open);
    },

    build() {
      const container = document.getElementById("sidebarContent");
      container.innerHTML = "";

      state.data.forEach((driver, driverIdx) => {
        const card = document.createElement("div");
        card.className = "driver-card";
        card.dataset.driverIdx = driverIdx;

        const techCount = driver.areas_tecnologicas.reduce(
          (sum, a) => sum + (a.lineas_tecnologicas?.length || 0), 0
        );

        let areasHTML = '<div class="area-list">';
        driver.areas_tecnologicas.forEach((area, areaIdx) => {
          const lineCount = area.lineas_tecnologicas?.length || 0;
          areasHTML += `
            <div class="area-item" data-driver-idx="${driverIdx}" data-area-idx="${areaIdx}">
              <div class="area-dot" style="background:${driver.color}"></div>
              <div class="area-name">${area.nombre_area}</div>
              <div class="area-count">${lineCount}</div>
            </div>`;
        });
        areasHTML += "</div>";

        card.innerHTML = `
          <div class="driver-header" data-driver-idx="${driverIdx}">
            <div class="driver-number" style="background:${driver.color}">${Utils.getDriverNumber(driver.direccionador)}</div>
            <div class="driver-info">
              <div class="driver-name">${Utils.getDriverShortName(driver.direccionador)}</div>
              <div class="driver-meta">${driver.areas_tecnologicas.length} áreas · ${techCount} tecnologías</div>
            </div>
            <div class="driver-expand">▼</div>
          </div>
          ${areasHTML}`;

        container.appendChild(card);

        // Event listeners
        card.querySelector(".driver-header").addEventListener("click", () => {
          const isExpanded = card.classList.contains("expanded");
          document.querySelectorAll(".driver-card").forEach((c) => c.classList.remove("expanded", "active"));
          document.querySelectorAll(".area-item").forEach((a) => a.classList.remove("active"));
          
          if (!isExpanded) {
            card.classList.add("expanded", "active");
            state.activeDriverIdx = driverIdx;
            state.activeAreaIdx = null;
            RadarChart.highlightDriver(driverIdx);
          } else {
            state.activeDriverIdx = null;
            state.activeAreaIdx = null;
            RadarChart.clearHighlight();
          }
        });

        card.querySelectorAll(".area-item").forEach((item) => {
          item.addEventListener("click", (e) => {
            e.stopPropagation();
            const areaIdx = parseInt(item.dataset.areaIdx);
            document.querySelectorAll(".area-item").forEach((a) => a.classList.remove("active"));
            item.classList.add("active");
            state.activeDriverIdx = driverIdx;
            state.activeAreaIdx = areaIdx;
            RadarChart.highlightArea(driverIdx, areaIdx);
          });

          item.addEventListener("dblclick", (e) => {
            e.stopPropagation();
            Modal.showArea(driver, driver.areas_tecnologicas[parseInt(item.dataset.areaIdx)]);
          });
        });

        card.querySelector(".driver-header").addEventListener("dblclick", (e) => {
          e.stopPropagation();
          Modal.showDriver(driver);
        });
      });
    },

    clearActiveStates() {
      document.querySelectorAll(".driver-card").forEach((c) => c.classList.remove("expanded", "active"));
      document.querySelectorAll(".area-item").forEach((a) => a.classList.remove("active"));
      state.activeDriverIdx = null;
      state.activeAreaIdx = null;
    }
  };

  /* ==========================================================================
     RADAR CHART
     ========================================================================== */
  const RadarChart = {
    init() {
      this.render();
      window.addEventListener("resize", Utils.debounce(() => this.render(), 300));
    },

    render() {
      const container = document.getElementById("chart-container");
      container.innerHTML = "";

      state.width = container.clientWidth;
      state.height = container.clientHeight;
      state.radius = Math.min(state.width, state.height) * 0.46;

      state.svg = d3.select(container)
        .append("svg")
        .attr("width", state.width)
        .attr("height", state.height);

      state.mainGroup = state.svg.append("g")
        .attr("transform", `translate(${state.width / 2},${state.height / 2})`);

      this.setupZoom();
      this.buildHierarchy();
      this.drawRings();
      this.drawRingLabels();
      this.drawDriverSectors();
      this.drawAreaSectors();
      this.drawTechNodes();
      this.drawCenter();
      Sidebar.build();
    },

    setupZoom() {
      state.zoomBehavior = d3.zoom()
        .scaleExtent([CONFIG.zoom.min, CONFIG.zoom.max])
        .on("zoom", (e) => {
          state.currentZoom = e.transform.k;
          state.currentTransform = e.transform;
          state.mainGroup.attr("transform", e.transform);
          document.getElementById("zoomLevel").textContent = Math.round(state.currentZoom * 100) + "%";
        });

      const initialTransform = d3.zoomIdentity.translate(state.width / 2, state.height / 2);
      state.svg.call(state.zoomBehavior).call(state.zoomBehavior.transform, initialTransform);
      state.currentTransform = initialTransform;
    },

    buildHierarchy() {
      const hierarchy = {
        name: "MEGATENDENCIAS",
        children: state.data.map((driver, driverIdx) => ({
          ...driver,
          name: driver.direccionador,
          driverIdx,
          type: "driver",
          children: driver.areas_tecnologicas.map((area, areaIdx) => ({
            ...area,
            name: area.nombre_area,
            driverIdx,
            areaIdx,
            type: "area",
            children: area.lineas_tecnologicas.map((line, lineIdx) => ({
              ...line,
              name: line.nombre_linea,
              driverIdx,
              areaIdx,
              lineIdx,
              type: "tech",
              size: 1
            }))
          }))
        }))
      };

      state.root = d3.hierarchy(hierarchy).sum((d) => d.size || 0);
      d3.partition().size([2 * Math.PI, state.radius])(state.root);
    },

    drawRings() {
      const rings = [
        CONFIG.dimensions.driverRadius,
        CONFIG.dimensions.areaRadius,
        CONFIG.dimensions.techRadius
      ];

      state.mainGroup.selectAll(".ring-guide")
        .data(rings)
        .enter()
        .append("circle")
        .attr("class", "ring-guide")
        .attr("r", (d) => state.radius * d);
    },

    drawRingLabels() {
      const labels = [
        { r: (CONFIG.dimensions.centerRadius + CONFIG.dimensions.driverRadius) / 2, text: "DIRECCIONADORES DE DESARROLLO" },
        { r: (CONFIG.dimensions.driverRadius + CONFIG.dimensions.areaRadius) / 2, text: "ÁREAS TECNOLÓGICAS" },
        { r: (CONFIG.dimensions.areaRadius + CONFIG.dimensions.techRadius) / 2, text: "LÍNEAS TECNOLÓGICAS" }
      ];

      labels.forEach((l) => {
        state.mainGroup.append("text")
          .attr("class", "ring-label")
          .attr("x", 0)
          .attr("y", -(state.radius * l.r))
          .attr("text-anchor", "middle")
          .attr("dy", "-0.5em")
          .text(l.text);
      });
    },

    drawDriverSectors() {
      const arc = d3.arc()
        .startAngle((d) => d.x0)
        .endAngle((d) => d.x1)
        .innerRadius(state.radius * CONFIG.dimensions.centerRadius)
        .outerRadius(state.radius * CONFIG.dimensions.driverRadius);

      const groups = state.mainGroup.selectAll(".driver-group")
        .data(state.root.children)
        .enter()
        .append("g")
        .attr("class", "driver-group");

      groups.append("path")
        .attr("class", "sector-path sector-driver")
        .attr("d", arc)
        .attr("fill", (d) => d.data.color)
        .attr("opacity", 0.35)
        .attr("stroke", "#0a0e27")
        .attr("stroke-width", 2)
        .attr("data-driver-idx", (d) => d.data.driverIdx)
        .on("mouseenter", (e, d) => {
          Tooltip.show(e, d.data.direccionador, "Direccionador de Desarrollo", "Clic para ver áreas", `${d.data.areas_tecnologicas?.length || 0} áreas`);
          this.highlightDriver(d.data.driverIdx);
        })
        .on("mousemove", (e) => Tooltip.move(e))
        .on("mouseleave", () => {
          Tooltip.hide();
          if (state.activeDriverIdx === null) this.clearHighlight();
          else this.restoreActiveHighlight();
        })
        .on("click", (e, d) => {
          Tooltip.hide();
          Modal.showDriver(d.data);
        });

      // Multi-line labels
      groups.each(function(d) {
        const g = d3.select(this);
        const midAngle = (d.x0 + d.x1) / 2;
        const r = state.radius * (CONFIG.dimensions.centerRadius + CONFIG.dimensions.driverRadius) / 2;
        const x = Math.cos(midAngle - Math.PI / 2) * r;
        const y = Math.sin(midAngle - Math.PI / 2) * r;

        let rotation = (midAngle * 180 / Math.PI) - 90;
        if (rotation > 90) rotation -= 180;
        if (rotation < -90) rotation += 180;

        const lines = Utils.splitTextForLabel(d.data.direccionador, 3, 18);
        const text = g.append("text")
          .attr("class", "label-driver")
          .attr("x", x)
          .attr("y", y)
          .attr("transform", `rotate(${rotation},${x},${y})`)
          .attr("text-anchor", "middle")
          .attr("fill", d.data.color)
          .attr("data-driver-idx", d.data.driverIdx)
          .style("font-size", "8px")
          .style("font-weight", "600");

        const lineHeight = 1.15;
        const startDy = -(lines.length - 1) * lineHeight / 2;
        lines.forEach((line, i) => {
          text.append("tspan")
            .attr("x", x)
            .attr("dy", i === 0 ? `${startDy}em` : `${lineHeight}em`)
            .text(line);
        });
      });
    },

    drawAreaSectors() {
      const areas = [];
      state.root.each((d) => { if (d.depth === 2) areas.push(d); });

      const arc = d3.arc()
        .startAngle((d) => d.x0)
        .endAngle((d) => d.x1)
        .innerRadius(state.radius * CONFIG.dimensions.driverRadius)
        .outerRadius(state.radius * CONFIG.dimensions.areaRadius);

      const groups = state.mainGroup.selectAll(".area-group")
        .data(areas)
        .enter()
        .append("g")
        .attr("class", "area-group");

      groups.append("path")
        .attr("class", "sector-path sector-area")
        .attr("d", arc)
        .attr("fill", (d) => d3.color(d.parent.data.color).brighter(0.4))
        .attr("opacity", 0.18)
        .attr("stroke", "rgba(255,255,255,0.05)")
        .attr("data-driver-idx", (d) => d.data.driverIdx)
        .attr("data-area-idx", (d) => d.data.areaIdx)
        .on("mouseenter", (e, d) => {
          const lineCount = d.data.lineas_tecnologicas?.length || 0;
          Tooltip.show(e, d.data.nombre_area, Utils.getDriverShortName(d.parent.data.direccionador), "Clic para ver líneas", `${lineCount} líneas`);
          this.highlightArea(d.data.driverIdx, d.data.areaIdx);
        })
        .on("mousemove", (e) => Tooltip.move(e))
        .on("mouseleave", () => {
          Tooltip.hide();
          if (state.activeDriverIdx === null) this.clearHighlight();
          else this.restoreActiveHighlight();
        })
        .on("click", (e, d) => {
          Tooltip.hide();
          Modal.showArea(state.data[d.data.driverIdx], d.data);
        });

      // Multi-line labels
      groups.each(function(d) {
        const g = d3.select(this);
        const midAngle = (d.x0 + d.x1) / 2;
        const r = state.radius * (CONFIG.dimensions.driverRadius + CONFIG.dimensions.areaRadius) / 2;
        const x = Math.cos(midAngle - Math.PI / 2) * r;
        const y = Math.sin(midAngle - Math.PI / 2) * r;

        let rotation = (midAngle * 180 / Math.PI) - 90;
        if (rotation > 90) rotation -= 180;
        if (rotation < -90) rotation += 180;

        const lines = Utils.splitTextForLabel(d.data.nombre_area, 2, 16);
        const text = g.append("text")
          .attr("class", "label-area")
          .attr("x", x)
          .attr("y", y)
          .attr("transform", `rotate(${rotation},${x},${y})`)
          .attr("text-anchor", "middle")
          .attr("fill", "#94a3b8")
          .attr("data-driver-idx", d.data.driverIdx)
          .attr("data-area-idx", d.data.areaIdx)
          .style("font-size", "7px")
          .style("font-weight", "500");

        const lineHeight = 1.15;
        const startDy = -(lines.length - 1) * lineHeight / 2;
        lines.forEach((line, i) => {
          text.append("tspan")
            .attr("x", x)
            .attr("dy", i === 0 ? `${startDy}em` : `${lineHeight}em`)
            .text(line);
        });
      });
    },

    drawTechNodes() {
      const techs = [];
      state.root.each((d) => { if (d.depth === 3) techs.push(d); });

      const nodeGroups = state.mainGroup.selectAll(".tech-node")
        .data(techs)
        .enter()
        .append("g")
        .attr("class", "tech-node")
        .attr("transform", (d) => {
          const midAngle = (d.x0 + d.x1) / 2;
          const r = state.radius * CONFIG.dimensions.techRadius;
          d.tx = Math.cos(midAngle - Math.PI / 2) * r;
          d.ty = Math.sin(midAngle - Math.PI / 2) * r;
          d.midAngle = midAngle;
          return `translate(${d.tx},${d.ty})`;
        })
        .attr("data-driver-idx", (d) => d.data.driverIdx)
        .attr("data-area-idx", (d) => d.data.areaIdx)
        .attr("data-line-idx", (d) => d.data.lineIdx);

      nodeGroups.append("circle")
        .attr("r", 5)
        .attr("fill", (d) => state.data[d.data.driverIdx].color)
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .style("cursor", "pointer");

      nodeGroups.append("text")
        .attr("dy", "0.35em")
        .attr("transform", (d) => {
          const deg = (d.midAngle * 180 / Math.PI) - 90;
          return (deg > 90 || deg < -90) ? `rotate(${deg + 180})` : `rotate(${deg})`;
        })
        .attr("x", (d) => {
          const deg = (d.midAngle * 180 / Math.PI) - 90;
          return (deg > 90 || deg < -90) ? -9 : 9;
        })
        .attr("text-anchor", (d) => {
          const deg = (d.midAngle * 180 / Math.PI) - 90;
          return (deg > 90 || deg < -90) ? "end" : "start";
        })
        .attr("fill", "#94a3b8")
        .style("font-size", "7px")
        .style("text-shadow", "0 1px 4px rgba(0,0,0,0.9)")
        .text((d) => Utils.truncate(d.data.nombre_linea, 28));

      // Event listeners
      nodeGroups.on("mouseenter", function(e, d) {
        const subCount = d.data.sublineas?.length || 0;
        const driver = state.data[d.data.driverIdx];
        const area = driver.areas_tecnologicas[d.data.areaIdx];
        Tooltip.show(e, d.data.nombre_linea, `${Utils.getDriverShortName(driver.direccionador)} → ${area.nombre_area}`, "Clic para ver sublíneas", `${subCount} sublíneas`);
      });

      nodeGroups.on("mousemove", function(e) { Tooltip.move(e); });
      nodeGroups.on("mouseleave", function() { Tooltip.hide(); });

      nodeGroups.on("click", function(e, d) {
        e.stopPropagation();
        e.preventDefault();
        Tooltip.hide();
        const driver = state.data[d.data.driverIdx];
        const area = driver.areas_tecnologicas[d.data.areaIdx];
        const line = area.lineas_tecnologicas[d.data.lineIdx];
        Modal.showLine(driver, area, line);
      });
    },

    drawCenter() {
      const g = state.mainGroup.append("g").attr("class", "center-group");
      
      g.append("circle")
        .attr("r", state.radius * CONFIG.dimensions.centerRadius)
        .attr("fill", "#0a0e27")
        .attr("stroke", "#38bdf8")
        .attr("stroke-width", 2)
        .style("filter", "drop-shadow(0 0 20px rgba(56,189,248,0.4))");
      
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "-0.3em")
        .attr("fill", "#fff")
        .style("font-size", "8px")
        .style("font-weight", "600")
        .style("letter-spacing", "0.05em")
        .text("MEGATENDENCIAS");
      
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "1em")
        .attr("fill", "#38bdf8")
        .style("font-size", "11px")
        .style("font-weight", "700")
        .text("2035");
    },

    highlightDriver(driverIdx) {
      d3.selectAll(".sector-path,.tech-node,.label-driver,.label-area")
        .classed("dimmed", true)
        .classed("highlighted", false);
      
      d3.selectAll(".sector-path")
        .filter(function() { return +this.getAttribute("data-driver-idx") === driverIdx; })
        .classed("dimmed", false)
        .classed("highlighted", true);
      
      d3.selectAll(".tech-node")
        .filter(function() { return +this.getAttribute("data-driver-idx") === driverIdx; })
        .classed("dimmed", false)
        .classed("highlighted", true);
      
      d3.selectAll(".label-driver,.label-area")
        .filter(function() { return +this.getAttribute("data-driver-idx") === driverIdx; })
        .classed("dimmed", false);
    },

    highlightArea(driverIdx, areaIdx) {
      d3.selectAll(".sector-path,.tech-node,.label-driver,.label-area")
        .classed("dimmed", true)
        .classed("highlighted", false);
      
      d3.selectAll(".sector-driver")
        .filter(function() { return +this.getAttribute("data-driver-idx") === driverIdx; })
        .classed("dimmed", false);
      
      d3.selectAll(".sector-area")
        .filter(function() {
          return +this.getAttribute("data-driver-idx") === driverIdx &&
                 +this.getAttribute("data-area-idx") === areaIdx;
        })
        .classed("dimmed", false)
        .classed("highlighted", true);
      
      d3.selectAll(".tech-node")
        .filter(function() {
          return +this.getAttribute("data-driver-idx") === driverIdx &&
                 +this.getAttribute("data-area-idx") === areaIdx;
        })
        .classed("dimmed", false)
        .classed("highlighted", true);
      
      d3.selectAll(".label-driver")
        .filter(function() { return +this.getAttribute("data-driver-idx") === driverIdx; })
        .classed("dimmed", false);
      
      d3.selectAll(".label-area")
        .filter(function() {
          return +this.getAttribute("data-driver-idx") === driverIdx &&
                 +this.getAttribute("data-area-idx") === areaIdx;
        })
        .classed("dimmed", false);
    },

    clearHighlight() {
      d3.selectAll(".sector-path,.tech-node,.label-driver,.label-area")
        .classed("dimmed", false)
        .classed("highlighted", false);
    },

    restoreActiveHighlight() {
      if (state.activeDriverIdx !== null) {
        if (state.activeAreaIdx !== null) {
          this.highlightArea(state.activeDriverIdx, state.activeAreaIdx);
        } else {
          this.highlightDriver(state.activeDriverIdx);
        }
      }
    }
  };

  /* ==========================================================================
     ZOOM CONTROLS
     ========================================================================== */
  const ZoomControls = {
    init() {
      document.getElementById("zoomIn").addEventListener("click", () => this.zoomTo(1.3));
      document.getElementById("zoomOut").addEventListener("click", () => this.zoomTo(0.7));
      document.getElementById("zoomReset").addEventListener("click", () => this.reset());
    },

    zoomTo(factor) {
      const centerX = state.width / 2;
      const centerY = state.height / 2;
      state.svg.transition()
        .duration(CONFIG.animation.duration)
        .call(state.zoomBehavior.scaleBy, factor, [centerX, centerY]);
    },

    reset() {
      const resetTransform = d3.zoomIdentity.translate(state.width / 2, state.height / 2);
      state.svg.transition()
        .duration(CONFIG.animation.duration)
        .call(state.zoomBehavior.transform, resetTransform);
    }
  };

  /* ==========================================================================
     FILE OPERATIONS
     ========================================================================== */
  const FileOps = {
    init() {
      const fileInput = document.getElementById("jsonUpload");
      
      fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const data = JSON.parse(ev.target.result);
            if (this.validateData(data)) {
              state.activeDriverIdx = null;
              state.activeAreaIdx = null;
              Sidebar.clearActiveStates();
              state.data = data;
              RadarChart.render();
              alert("✓ Datos cargados correctamente (" + data.length + " direccionadores)");
            } else {
              alert("✗ Formato inválido. El archivo debe contener un array de direccionadores con la estructura correcta.");
            }
          } catch (err) {
            alert("✗ Error al procesar el archivo: " + err.message);
          }
        };
        reader.onerror = () => alert("✗ Error al leer el archivo");
        reader.readAsText(file);
        fileInput.value = "";
      });

      document.getElementById("btnSave").addEventListener("click", () => this.saveJSON());
      document.getElementById("btnExport").addEventListener("click", () => this.exportPNG());
    },

    validateData(data) {
      return Array.isArray(data) && 
             data.length > 0 && 
             data[0]?.direccionador && 
             data[0]?.areas_tecnologicas;
    },

    saveJSON() {
      const jsonString = JSON.stringify(state.data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `radar-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    exportPNG() {
      const svgNode = state.svg.node();
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgNode);
      
      const canvas = document.createElement("canvas");
      canvas.width = state.width * 2;
      canvas.height = state.height * 2;
      
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#0a0e27";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const img = new Image();
      const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = `radar-telecom-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  };

  /* ==========================================================================
     INICIALIZACIÓN
     ========================================================================== */
  return {
    init() {
      // Cargar datos por defecto (desde el script de datos)
      if (typeof DEFAULT_RADAR_DATA !== 'undefined') {
        state.data = DEFAULT_RADAR_DATA;
      } else {
        console.error('DEFAULT_RADAR_DATA no está definido. Asegúrese de incluir default-data.js');
        return;
      }

      // Inicializar módulos
      Tooltip.init();
      Modal.init();
      Sidebar.init();
      RadarChart.init();
      ZoomControls.init();
      FileOps.init();
    }
  };
})();

// Iniciar aplicación cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => RadarApp.init());
