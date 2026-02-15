<template>
  <div id="app">
    <header class="navbar">
      <div class="logo">
        <span class="icon">🛡️</span> 
        <div class="logo-text">
          <h1>PROYECTO C.E.R.O.</h1>
          <span>Convivencia y Respeto Escolar</span>
        </div>
      </div>
      <div class="nav-controls">
        <button @click="vista = 'estudiante'" :class="{ active: vista === 'estudiante' }">Modo Estudiante</button>
        <button @click="vista = 'docente'" :class="{ active: vista === 'docente' }">Panel de Control</button>
      </div>
    </header>

    <main class="content">
      <section v-if="vista === 'estudiante'" class="hero animate-fade-in">
        <div class="report-card">
          <h2>Haz tu reporte seguro</h2>
          <p>Tu identidad está protegida por el sistema C.E.R.O.</p>
          <div class="input-grid">
            <div class="field">
              <label>¿Qué tipo de situación es?</label>
              <select v-model="form.tipo">
                <option value="fisico">👊 Físico</option>
                <option value="verbal">🗣️ Verbal</option>
                <option value="psicologico">🧠 Psicológico</option>
                <option value="ciberbullying">💻 Ciberbullying</option>
              </select>
            </div>
            <div class="field">
              <label>¿Dónde ocurrió?</label>
              <input v-model="form.ubicacion" placeholder="Ej: Patio, Salón 3A...">
            </div>
          </div>
          <div class="field">
            <label>Cuéntanos los detalles</label>
            <textarea v-model="form.descripcion" rows="4" placeholder="Describe lo ocurrido..."></textarea>
          </div>
          <button @click="enviarReporte" class="btn-submit">🚀 Enviar Reporte Seguro</button>
        </div>
      </section>

      <section v-if="vista === 'docente'" class="dashboard animate-fade-in">
        
        <div v-if="!estaLogueado" class="login-container">
          <div class="login-card">
            <span class="lock-icon">🔒</span>
            <h2>Acceso Directivo</h2>
            <p>Ingrese la clave de seguridad</p>
            <input type="password" v-model="passwordIngresada" placeholder="Contraseña" @keyup.enter="verificarAcceso" />
            <button @click="verificarAcceso" class="btn-submit">Entrar al Sistema</button>
          </div>
        </div>

        <div v-else class="admin-content">
          <div style="text-align: right; margin-bottom: 15px;">
            <button @click="estaLogueado = false" class="btn-logout">🚪 Cerrar Sesión</button>
          </div>

          <div class="stats-cards-row">
            <div class="stat-card pending">
              <div class="stat-icon">🔔</div>
              <div class="stat-info"><h3>{{ conteoEstados.nuevo }}</h3><p>Sin Atender</p></div>
            </div>
            <div class="stat-card processing">
              <div class="stat-icon">🔍</div>
              <div class="stat-info"><h3>{{ conteoEstados.en_revision }}</h3><p>En Revisión</p></div>
            </div>
            <div class="stat-card resolved">
              <div class="stat-icon">✅</div>
              <div class="stat-info"><h3>{{ conteoEstados.resuelto }}</h3><p>Resueltos</p></div>
            </div>
          </div>

          <div class="analytics-row">
            <div class="chart-container card">
              <h3>📍 Mapa de Calor: Ubicaciones Críticas</h3>
              <div class="bar-chart">
                <div v-for="(count, area) in reportePorArea" :key="area" class="bar-item">
                  <div class="bar-label">{{ area }}</div>
                  <div class="bar-wrapper">
                    <div class="bar-fill" :style="{ width: (count / maxReportes * 100) + '%' }">
                      <span class="bar-value">{{ count }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="table-container">
            <div class="table-header">
              <h3>Registro de Incidencias</h3>
              <div class="actions">
                <button @click="obtenerReportes" class="btn-refresh">🔄 Sincronizar</button>
                <button @click="descargarExcel" class="btn-excel">📊 Excel</button>
              </div>
            </div>
            <table class="modern-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Situación</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="reporte in reportes" :key="reporte.id">
                  <td>#{{ reporte.id }}</td>
                  <td><span :class="'tag ' + reporte.tipo_bullying">{{ reporte.tipo_bullying }}</span></td>
                  <td>{{ reporte.descripcion }}</td>
                  <td><span :class="'status-pill ' + reporte.estado">{{ reporte.estado }}</span></td>
                  <td>
                    <button class="btn-action" @click="cambiarEstado(reporte.id, reporte.estado)" :disabled="reporte.estado === 'resuelto'">
                      {{ reporte.estado === 'nuevo' ? '🔍 Revisar' : reporte.estado === 'en_revision' ? '✅ Resolver' : 'Finalizado' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import api from './services/api';
import * as XLSX from 'xlsx';

export default {
  data() {
    return {
      vista: 'estudiante',
      estaLogueado: false,
      passwordIngresada: '',
      passwordCorrecta: 'cero2026',
      reportes: [],
      form: { tipo: 'fisico', descripcion: '', ubicacion: '', anonimo: true }
    }
  },
  computed: {
    reportePorArea() {
      const areas = {};
      this.reportes.forEach(r => {
        const area = r.ubicacion_colegio || 'No especificado';
        areas[area] = (areas[area] || 0) + 1;
      });
      return areas;
    },
    maxReportes() {
      const valores = Object.values(this.reportePorArea);
      return valores.length > 0 ? Math.max(...valores) : 1;
    },
    conteoEstados() {
      const conteo = { nuevo: 0, en_revision: 0, resuelto: 0 };
      this.reportes.forEach(r => { if (conteo.hasOwnProperty(r.estado)) conteo[r.estado]++; });
      return conteo;
    }
  },
  mounted() { this.obtenerReportes(); },
  methods: {
    verificarAcceso() {
      if (this.passwordIngresada === this.passwordCorrecta) {
        this.estaLogueado = true;
        this.passwordIngresada = '';
        this.obtenerReportes();
      } else { alert("❌ Clave incorrecta"); }
    },
    async enviarReporte() {
      if (!this.form.descripcion || !this.form.ubicacion) { alert("Completa los campos"); return; }
      try {
        await api.post('/reportes', {
          tipo: this.form.tipo, descripcion: this.form.descripcion,
          anonimo: this.form.anonimo, ubicacion: this.form.ubicacion
        });
        alert("✅ Enviado");
        this.form.descripcion = ''; this.form.ubicacion = '';
        this.obtenerReportes();
      } catch (e) { alert("Error al enviar"); }
    },
    async obtenerReportes() {
      try {
        const res = await api.get('/estadisticas');
        this.reportes = res.data;
      } catch (e) { console.error(e); }
    },
    async cambiarEstado(id, estadoActual) {
      let nuevoEstado = estadoActual === 'nuevo' ? 'en_revision' : 'resuelto';
      try {
        await api.put(`/reportes/${id}`, { nuevoEstado });
        this.obtenerReportes();
      } catch (e) { alert("Error"); }
    },
    descargarExcel() {
      const datos = this.reportes.map(r => ({
        ID: r.id, Fecha: r.fecha_incidente, Tipo: r.tipo_bullying,
        Descripcion: r.descripcion, Ubicacion: r.ubicacion_colegio, Estado: r.estado
      }));
      const hoja = XLSX.utils.json_to_sheet(datos);
      const libro = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(libro, hoja, "Reportes");
      XLSX.writeFile(libro, "Reportes_CERO.xlsx");
    }
  }
}
</script>

<style>
:root { --primary: #4f46e5; --bg: #f8fafc; }
body { background: var(--bg); font-family: sans-serif; margin: 0; }
.navbar { display: flex; justify-content: space-between; padding: 1rem 5%; background: white; border-bottom: 1px solid #e2e8f0; }
.logo-text h1 { margin: 0; font-size: 1.2rem; color: var(--primary); }
.nav-controls button { background: none; border: none; padding: 10px; cursor: pointer; font-weight: bold; color: #64748b; }
.nav-controls button.active { color: var(--primary); border-bottom: 2px solid var(--primary); }
.content { padding: 2rem 5%; }
.stats-cards-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
.stat-card { background: white; padding: 15px; border-radius: 12px; display: flex; align-items: center; gap: 10px; border-left: 5px solid #cbd5e1; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.stat-card.pending { border-left-color: #f59e0b; }
.stat-card.processing { border-left-color: #3b82f6; }
.stat-card.resolved { border-left-color: #10b981; }
.login-container { display: flex; justify-content: center; padding-top: 50px; }
.login-card { background: white; padding: 30px; border-radius: 15px; text-align: center; box-shadow: 0 10px 20px rgba(0,0,0,0.1); width: 100%; max-width: 350px; }
.login-card input { width: 100%; padding: 10px; margin: 15px 0; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;}
.report-card { background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); max-width: 600px; margin: auto; }
.input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
.field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 10px; text-align: left;}
.field input, .field select, .field textarea { padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; }
.btn-submit { background: var(--primary); color: white; border: none; padding: 12px; width: 100%; border-radius: 8px; cursor: pointer; font-weight: bold; }
.btn-excel { background: #1d6f42; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; margin-left: 10px; }
.btn-logout { background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 0.8rem; }
.analytics-row { margin-bottom: 2rem; }
.chart-container { background: white; padding: 20px; border-radius: 12px; }
.bar-item { display: grid; grid-template-columns: 100px 1fr; align-items: center; margin-bottom: 8px; gap: 10px; }
.bar-wrapper { background: #f1f5f9; border-radius: 10px; height: 18px; overflow: hidden; }
.bar-fill { background: var(--primary); height: 100%; transition: width 0.5s; display: flex; justify-content: flex-end; align-items: center; padding-right: 5px; }
.bar-value { color: white; font-size: 0.7rem; }
.table-container { background: white; border-radius: 12px; overflow: hidden; }
.table-header { padding: 15px; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; }
.modern-table { width: 100%; border-collapse: collapse; }
.modern-table th, .modern-table td { padding: 12px; border-bottom: 1px solid #eee; text-align: left; font-size: 0.9rem; }
.status-pill { padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; }
.status-pill.nuevo { background: #fef3c7; color: #d97706; }
.status-pill.en_revision { background: #dbeafe; color: #2563eb; }
.status-pill.resuelto { background: #dcfce7; color: #16a34a; }
.btn-action { background: var(--primary); color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; }
.tag { padding: 2px 6px; border-radius: 10px; font-size: 0.7rem; font-weight: bold; background: #eee; }
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
</style>