<template>
  <div id="app">
    <header class="navbar">
      <div class="logo">
        <img src="./assets/logo_cero.png" alt="Logo CERO" class="logo-img">
        <div class="logo-text">
          <h1>PROYECTO C.E.R.O.</h1>
          <span>Convivencia y Respeto Escolar</span>
        </div>
      </div>

      <nav class="main-nav">
        <div class="nav-links">
          <button @click="ventana = 'inicio'" :class="{ active: ventana === 'inicio' }">Inicio</button>
          <button @click="ventana = 'sistema'" :class="{ active: ventana === 'sistema' }">Sistema de Reportes</button>
          <button @click="ventana = 'contacto'" :class="{ active: ventana === 'contacto' }">Contacto</button>
        </div>

        <div class="nav-auth">
          <button v-if="!usuarioActivo" @click="ventana = 'login'" class="btn-login-top">
            🔑 Iniciar Sesión
          </button>
          
          <div v-else class="user-logged-info">
            <span>👤 {{ usuarioActivo.nombre }}</span>
            <button @click="cerrarSesion" class="btn-logout-small">Salir</button>
          </div>
        </div>
      </nav>
    </header>

    <main class="content">
      
      <section v-if="ventana === 'login'" class="auth-container animate-fade-in">
        <div class="login-card">
          <h2>Iniciar Sesión</h2>
          <div class="field">
            <label>Correo Electrónico</label>
            <input type="email" v-model="formAuth.correo" placeholder="ejemplo@correo.com">
          </div>
          <div class="field">
            <label>Contraseña</label>
            <input type="password" v-model="formAuth.password" placeholder="••••••••">
          </div>
          <button @click="iniciarSesion" class="btn-submit">Entrar</button>
          <p class="auth-switch">
            ¿No tienes cuenta? <span @click="ventana = 'registro'">Regístrate aquí</span>
          </p>
        </div>
      </section>

      <section v-if="ventana === 'registro'" class="auth-container animate-fade-in">
        <div class="login-card">
          <h2>Crear Cuenta</h2>
          <div class="field">
            <label>Nombre Completo</label>
            <input type="text" v-model="formAuth.nombre" placeholder="Tu nombre">
          </div>
          <div class="field">
            <label>Correo Electrónico</label>
            <input type="email" v-model="formAuth.correo" placeholder="ejemplo@correo.com">
          </div>
          <div class="field">
            <label>Contraseña</label>
            <input type="password" v-model="formAuth.password" placeholder="Mínimo 6 caracteres">
          </div>
          <button @click="registrarUsuario" class="btn-submit">Registrarse</button>
          <p class="auth-switch">
            ¿Ya tienes cuenta? <span @click="ventana = 'login'">Inicia sesión</span>
          </p>
        </div>
      </section>

      <section v-if="ventana === 'inicio'" class="animate-fade-in info-page">
        <div class="info-card">
          <h2>Bienvenido al Proyecto C.E.R.O.</h2>
          <p>
            Nuestra misión es construir un entorno escolar seguro, basado en la 
            <b>C</b>onvivencia, el <b>E</b>ntendimiento, el <b>R</b>espeto y la 
            <b>O</b>peratividad.
          </p>
          <div class="info-grid">
            <div class="info-item"><h3>🛡️ Misión</h3><p>Prevenir el acoso escolar mediante tecnología accesible.</p></div>
            <div class="info-item"><h3>🔒 Privacidad</h3><p>Tus reportes son tratados con absoluta confidencialidad.</p></div>
            <div class="info-item"><h3>🚀 Acción</h3><p>Respuesta rápida por parte del equipo directivo.</p></div>
          </div>
        </div>
      </section>

      <section v-if="ventana === 'sistema'" class="animate-fade-in">
        
        <div v-if="!usuarioActivo" class="auth-needed-message">
          <div class="info-card">
            <p>Para garantizar la seguridad de la comunidad, debes estar identificado antes de enviar un reporte.</p>
            <button @click="ventana = 'login'" class="btn-submit">Ir a Iniciar Sesión</button>
          </div>
        </div>

        <div v-else>
          <div class="sub-nav">
            <button @click="vista = 'estudiante'" :class="{ active: vista === 'estudiante' }">
              Modo Estudiante
            </button>

            <button 
              v-if="usuarioActivo.rol === 'admin' || usuarioActivo.id === 3 || usuarioActivo.id === 5" 
              @click="vista = 'docente'" 
              :class="{ active: vista === 'docente' }">
              Panel de Control
            </button>
          </div>

          <div v-if="vista === 'estudiante'" class="report-container">
            <div class="report-card">
              <h2>Haz tu reporte seguro</h2>
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
          </div>

          <div v-if="vista === 'docente'">
            
            <div v-if="usuarioActivo.rol === 'admin' || usuarioActivo.id === 3 || usuarioActivo.id === 5">
              
              <div v-if="!estaLogueado" class="login-container">
                <div class="login-card">
                  <span class="lock-icon">🔒</span>
                  <h2>Acceso Directivo</h2>
                  <input type="password" v-model="passwordIngresada" placeholder="Contraseña Admin" @keyup.enter="verificarAcceso" />
                  <button @click="verificarAcceso" class="btn-submit">Entrar al Panel</button>
                </div>
              </div>

              <div v-else class="admin-content">
                <div class="admin-header">
                  <button @click="descargarExcel" class="btn-excel">📊 Exportar Excel</button>
                  <button @click="estaLogueado = false" class="btn-logout">Cerrar Sesión Admin</button>
                </div>

                <div class="stats-cards-row">
                  <div class="stat-card pending"><h3>{{ sinAtender }}</h3><p>Sin Atender</p></div>
                  <div class="stat-card processing"><h3>{{ enRevision }}</h3><p>En Revisión</p></div>
                  <div class="stat-card resolved"><h3>{{ resueltos }}</h3><p>Resueltos</p></div>
                </div>

                <div class="admin-section-toggle" style="margin: 20px 0; display: flex; gap: 10px;">
                  <button @click="subTab = 'reportes'" :class="{active: subTab === 'reportes'}" class="btn-tab">
                    📋 Reportes Recibidos
                  </button>
                  <button @click="subTab = 'usuarios'; cargarUsuarios()" :class="{active: subTab === 'usuarios'}" class="btn-tab">
                    👥 Gestionar Usuarios
                  </button>
                </div>

                <div v-if="subTab === 'reportes'" class="table-container animate-fade-in">
                  <table class="modern-table">
                    <thead>
                      <tr>
                        <th>ID</th> <th>Tipo</th> <th>Ubicación</th>
                        <th>Descripción</th> <th>Reportado por</th> 
                        <th>Estado</th> <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="r in reportes" :key="r.id" :class="{ 'high-priority': r.tipo === 'fisico' }">
                        <td>#{{ r.id }}</td>
                        <td><span class="tag">{{ r.tipo }}</span></td>
                        <td>{{ r.ubicacion }}</td>
                        <td>{{ r.descripcion }}</td>
                        <td style="font-weight: bold; color: #2196F3;">{{ r.autor || 'Anónimo' }}</td>
                        <td><span :class="'status-pill ' + r.estado">{{ r.estado }}</span></td>
                        <td>
                          <button class="btn-action" @click="cambiarEstado(r.id, r.estado)" :disabled="r.estado === 'resuelto'">
                            Actualizar
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div v-if="subTab === 'usuarios'" class="table-container animate-fade-in">
                  <h3 style="margin-bottom: 15px;">Control de Accesos y Roles</h3>
                  <table class="modern-table">
                    <thead>
                      <tr>
                        <th>ID</th> <th>Nombre</th> <th>Correo</th> <th>Rol</th> <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="u in listaUsuarios" :key="u.id">
                        <td>#{{ u.id }}</td>
                        <td>{{ u.nombre }}</td>
                        <td>{{ u.correo }}</td>
                        <td><span :class="'status-pill ' + u.rol">{{ u.rol }}</span></td>
                        <td>
                          <button 
                            v-if="u.rol !== 'admin'" 
                            @click="hacerAdmin(u.id)" 
                            class="btn-action-admin">
                            ⬆️ Ascender a Admin
                          </button>
                          <span v-else style="color: #4CAF50; font-weight: bold;">✅ Acceso Total</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>
            </div>

            <div v-else class="info-card animate-fade-in" style="text-align: center; padding: 50px;">
              <div style="font-size: 60px;">🚫</div>
              <h2>Acceso Denegado</h2>
              <p>Esta sección es exclusiva para el personal directivo autorizado.</p>
              <button @click="vista = 'estudiante'" class="btn-submit" style="max-width: 250px; margin: 20px auto;">
                Regresar a Mis Reportes
              </button>
            </div>
          </div>
        </div>
      </section>

      <section v-if="ventana === 'contacto'" class="animate-fade-in contact-page">
        <div class="info-card">
          <h2>Líneas de Atención</h2>
          <div class="contact-grid">
            <div class="contact-item"><strong>📞 Orientación Escolar</strong><p>300 000 0000</p></div>
            <div class="contact-item"><strong>📧 Correo de Soporte</strong><p>contacto@proyectocero.com</p></div>
            <div class="contact-item"><strong>📍 Oficina de Convivencia</strong><p>Bloque A - Segundo Piso</p></div>
          </div>
          <div class="emergency-alert">🚨 Si estás en riesgo inminente, acude a la autoridad escolar.</div>
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
      ventana: 'inicio',
      vista: 'estudiante',
      estaLogueado: false,
      passwordIngresada: '',
      passwordCorrecta: '1234',
      reportes: [],
      form: { tipo: 'fisico', descripcion: '', ubicacion: '', anonimo: true },
      subTab: 'reportes',    // Controla cuál de las dos tablas se muestra en el panel
      listaUsuarios: [],     // Almacenará los usuarios traídos de la DB
      isCargandoUsuarios: false, // Opcional: para mostrar un estado de carga
      // inicio, sistema, login, registro
        usuarioActivo: null, // Guardará los datos del usuario logueado
        formAuth: { nombre: '', correo: '', password: '' }
    }

  },

  computed: {
    sinAtender() { 
      return this.reportes.filter(r => r.estado === 'nuevo').length; 
    },
    enRevision() { 
      return this.reportes.filter(r => r.estado === 'revision').length; 
    },
    resueltos() { 
      return this.reportes.filter(r => r.estado === 'resuelto').length; 
    },
    reportePorArea() {
      const areas = {};
      this.reportes.forEach(r => {
        const area = r.ubicacion || 'No especificado';
        areas[area] = (areas[area] || 0) + 1;
      });
      return areas;
    },
    maxReportes() {
      const valores = Object.values(this.reportePorArea);
      return valores.length > 0 ? Math.max(...valores) : 1;
    }
  },

  mounted() {
  this.obtenerReportes();
  
  // LEER DEL NAVEGADOR:
  const usuarioGuardado = localStorage.getItem('usuarioProyecto');
  if (usuarioGuardado) {
    // Si existe, lo convertimos de vuelta a objeto y lo activamos
    this.usuarioActivo = JSON.parse(usuarioGuardado);
    this.ventana = 'sistema'; // Lo mandamos directo al sistema si ya estaba logueado
  }
},

  methods: {
  // --- AUTENTICACIÓN ---
  async registrarUsuario() {
    try {
      // Importante: tu backend espera /api/registro
      const res = await api.post('/registro', this.formAuth);
      
      if (res.data.success) {
        alert("¡Cuenta creada con éxito! Ahora puedes iniciar sesión.");
        this.ventana = 'login'; 
        this.formAuth = { nombre: '', correo: '', password: '' };
      }
    } catch (error) {
      console.error(error);
      alert("Error al registrar: " + (error.response?.data?.message || "Servidor no disponible"));
    }
  },

  async iniciarSesion() {
  try {
    const datosLogin = {
      correo: this.formAuth.correo.trim(),
      password: this.formAuth.password
    };
    const res = await api.post('/login', datosLogin);

    if (res.data.success) {
      this.usuarioActivo = res.data.user;
      
      // GUARDAR EN NAVEGADOR: Convertimos el objeto a texto para guardarlo
      localStorage.setItem('usuarioProyecto', JSON.stringify(res.data.user));
      
      this.ventana = 'sistema';
      this.formAuth = { nombre: '', correo: '', password: '' };
      alert("¡Bienvenido/a " + this.usuarioActivo.nombre + "!");
    }
  } catch (error) {
    alert("Correo o contraseña incorrectos");
  }
},

  // --- REPORTES ---
  async enviarReporte() {
  if (!this.form.descripcion || !this.form.ubicacion) {
    return alert("Por favor completa los campos");
  }
  try {
    // IMPORTANTE: Creamos un nuevo objeto que incluya el usuario_id
    const reporteCompleto = {
      tipo: this.form.tipo,
      descripcion: this.form.descripcion,
      ubicacion: this.form.ubicacion,
      anonimo: this.form.anonimo,
      // Si usuarioActivo existe, mandamos su id, si no, mandamos null
      usuario_id: this.usuarioActivo ? this.usuarioActivo.id : null 
    };

    await api.post('/reportes', reporteCompleto); 
    alert("Reporte Enviado ✅");
    
    this.form.descripcion = '';
    this.form.ubicacion = '';
    this.obtenerReportes();
  } catch (e) {
    console.error("Error al enviar:", e);
    alert("Error al enviar el reporte");
  }
},

  async obtenerReportes() {
    try {
      // Tu backend usa /api/estadisticas para traer los datos
      const res = await api.get('/estadisticas');
      this.reportes = res.data;
    } catch (e) {
      console.error("Error al obtener reportes:", e);
    }
  },

  cerrarSesion() {
  // Limpiamos la variable y el almacenamiento del navegador
  this.usuarioActivo = null;
  localStorage.removeItem('usuarioProyecto');
  this.ventana = 'inicio';
  alert("Sesión cerrada correctamente");
},

  // --- OTROS MÉTODOS ---
  verificarAcceso() {
    if (String(this.passwordIngresada) === '1234') {
      this.estaLogueado = true;
      this.passwordIngresada = ''; 
      this.obtenerReportes();
    } else {
      alert("Pin Incorrecto");
    }
  },

  descargarExcel() {
    if (this.reportes.length === 0) return alert("No hay datos");
    const data = this.reportes.map(r => ({
      ID: r.id, Tipo: r.tipo, Desc: r.descripcion, Ubic: r.ubicacion, Estado: r.estado
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reportes");
    XLSX.writeFile(workbook, "Reportes_Proyecto_CERO.xlsx");
  },

  // Dentro de methods: { ... }
async cargarUsuarios() {
    const res = await api.get('/usuarios');
    this.listaUsuarios = res.data;
},
async hacerAdmin(idUsuario) {
    if (confirm("¿Seguro que quieres dar permisos de administrador?")) {
        await api.put(`/usuarios/rol/${idUsuario}`, { nuevoRol: 'admin' });
        alert("¡Usuario ahora es Administrador!");
        this.cargarUsuarios(); // Recargamos la lista
    }
},


async cargarUsuarios() {
    try {
      this.isCargandoUsuarios = true;
      const response = await api.get('/usuarios'); // Asegúrate que tu backend tenga esta ruta
      this.listaUsuarios = response.data;
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      alert("No se pudo obtener la lista de usuarios.");
    } finally {
      this.isCargandoUsuarios = false;
    }
  },

  // Función para el botón "Ascender a Admin"
  async hacerAdmin(idUsuario) {
    const confirmacion = confirm("¿Estás seguro de otorgar permisos de Administrador a este usuario?");
    
    if (confirmacion) {
      try {
        // Enviamos la actualización al servidor
        await api.put(`/usuarios/rol/${idUsuario}`, { nuevoRol: 'admin' });
        
        alert("¡Permisos actualizados con éxito!");
        
        // Refrescamos la lista para que el botón desaparezca y salga el check verde
        await this.cargarUsuarios(); 
      } catch (error) {
        console.error("Error al actualizar rol:", error);
        alert("Hubo un error al intentar cambiar el rango.");
      }
    }
  },

  async cambiarEstado(id, estadoActual) {
  let nuevoEstado = 'nuevo';
  
  // Lógica de rotación de estados
  if (estadoActual === 'nuevo') nuevoEstado = 'revision';
  else if (estadoActual === 'revision') nuevoEstado = 'resuelto';
  else return alert("Este reporte ya está resuelto.");

  try {
    await api.put(`/reportes/${id}`, { estado: nuevoEstado });
    alert(`Estado actualizado a: ${nuevoEstado}`);
    this.obtenerReportes(); // Recargar la tabla de reportes
  } catch (error) {
    console.error("Error al cambiar estado:", error);
    alert("No se pudo actualizar el estado.");
  }
},

}

};



</script>

<style>
:root { --primary: #4f46e5; --bg: #f8fafc; }
body { background: var(--bg); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; }

/* NAVBAR */
.navbar { display: flex; justify-content: space-between; align-items: center; padding: 1rem 5%; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
.main-nav button { background: none; border: none; padding: 10px 20px; font-weight: bold; cursor: pointer; color: #64748b; border-bottom: 2px solid transparent; }
.main-nav button.active { color: var(--primary); border-bottom-color: var(--primary); }

/* SUB-NAV */
.sub-nav { display: flex; justify-content: center; gap: 15px; margin-bottom: 2rem; padding-top: 1rem; }
.sub-nav button { background: white; border: 1px solid #ddd; padding: 8px 25px; border-radius: 25px; cursor: pointer; transition: 0.3s; }
.sub-nav button.active { background: var(--primary); color: white; border-color: var(--primary); }

.content { padding: 2rem 5%; }

/* TARJETAS DE INFORMACIÓN */
.info-card { background: white; padding: 3rem; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); text-align: center; max-width: 900px; margin: auto; }
.info-grid, .contact-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 2rem; }
.info-item, .contact-item { background: #f1f5f9; padding: 20px; border-radius: 12px; }
.emergency-alert { margin-top: 2rem; padding: 15px; background: #fee2e2; color: #b91c1c; border-radius: 10px; font-weight: bold; }

/* ESTILOS DE DASHBOARD Y FORMULARIO (Resumidos) */
.report-card { background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); max-width: 600px; margin: auto; }
.input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
.field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 15px; text-align: left; }
.field input, .field select, .field textarea { padding: 12px; border: 1px solid #ddd; border-radius: 8px; }
.btn-submit { background: var(--primary); color: white; border: none; padding: 14px; width: 100%; border-radius: 8px; cursor: pointer; font-weight: bold; }

.stats-cards-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px; }
.stat-card { background: white; padding: 20px; border-radius: 12px; text-align: center; border-left: 5px solid var(--primary); }
.stat-card.pending { border-left-color: #f59e0b; }
.stat-card.processing { border-left-color: #3b82f6; }
.stat-card.resolved { border-left-color: #10b981; }

.login-container { display: flex; justify-content: center; padding-top: 50px; }
.login-card { background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 20px rgba(0,0,0,0.1); width: 100%; max-width: 350px; text-align: center; }
.login-card input { width: 100%; padding: 12px; margin: 15px 0; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box; }

.chart-container { background: white; padding: 20px; border-radius: 15px; margin-bottom: 20px; }
.bar-item { display: grid; grid-template-columns: 120px 1fr; align-items: center; margin-bottom: 10px; gap: 15px; }
.bar-wrapper { background: #f1f5f9; border-radius: 10px; height: 20px; overflow: hidden; }
.bar-fill { background: var(--primary); height: 100%; transition: width 0.5s; display: flex; justify-content: flex-end; align-items: center; padding-right: 10px; }
.bar-value { color: white; font-size: 0.8rem; font-weight: bold; }

.table-container { background: white; border-radius: 15px; overflow: hidden; }
.modern-table { width: 100%; border-collapse: collapse; }
.modern-table th, .modern-table td { padding: 15px; border-bottom: 1px solid #eee; text-align: left; }
.status-pill { padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: bold; }
.status-pill.nuevo { background: #fef3c7; color: #d97706; }
.status-pill.en_revision { background: #dbeafe; color: #2563eb; }
.status-pill.resuelto { background: #dcfce7; color: #16a34a; }

.admin-header { display: flex; justify-content: flex-end; gap: 10px; margin-bottom: 15px; }
.btn-excel { background: #16a34a; color: white; border: none; padding: 8px 15px; border-radius: 8px; cursor: pointer; }
.btn-logout { background: #ef4444; color: white; border: none; padding: 8px 15px; border-radius: 8px; cursor: pointer; }

.animate-fade-in { animation: fadeIn 0.5s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.logo-img {
  width: 45px;
  height: 45px;
  border-radius: 50%; /* Esto lo hace circular */
  object-fit: cover;
  margin-right: 12px;
  border: 2px solid var(--primary);
}

.bar-fill {
  height: 100%;
  background-color: #3498db;
  transition: width 0.5s ease-in-out; /* Esto hace que la barra crezca suavemente */
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 10px;
  color: white;
}


.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 5%;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.main-nav {
  display: flex;
  align-items: center;
  gap: 30px; /* Espacio entre links y botón de login */
}

.btn-login-top {
  background-color: #fdf2b3; /* El amarillo de la foto ConviVe */
  border-radius: 50px;
  padding: 10px 25px;
  font-weight: bold;
  border: none;
  cursor: pointer;
}

</style>