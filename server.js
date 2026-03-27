const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

// Configuración de la sesión extendida para evitar desync con el frontend
app.use(session({
    secret: 'secreto_seguro_media_res',
    resave: false,
    saveUninitialized: false,
    rolling: true, // Renovar cookie con cada request
    cookie: { secure: false, maxAge: 12 * 60 * 60 * 1000 } // 12 horas, el frontend maneja la inactividad real de 1 min
}));

// Parseo de JSON
app.use(express.json());

// Servir archivos estáticos desde una carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// USUARIOS HARCODEADOS (Para simplicidad del requerimiento)
const usuariosValidos = {
    "lcalderon": { password: "4235950", role: "user" },
    "jmunua": { password: "abastecedor", role: "admin" }
};

// --- RUTAS DE AUTENTICACIÓN ---
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    if (usuariosValidos[username] && usuariosValidos[username].password === password) {
        req.session.user = username;
        req.session.role = usuariosValidos[username].role;
        return res.json({ success: true, message: 'Login exitoso', username, role: req.session.role });
    }
    
    return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
});

app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true, message: 'Logout exitoso' });
});

app.get('/api/check-session', (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user, role: req.session.role });
    } else {
        res.json({ loggedIn: false });
    }
});

// Middleware para verificar sesión
function checkAuth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ success: false, message: 'No autenticado' });
    }
}

// --- RUTAS DE DATOS ---

// Guardar o actualizar un desglose (Upsert)
app.post('/api/desgloses', checkAuth, (req, res) => {
    const desglose = req.body;
    
    // Carpeta del día: datos/YYYY-MM-DD
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const folderPath = path.join(__dirname, 'datos', `${year}-${month}-${day}`);
    
    // Crear la carpeta si no existe
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
    
    // Nombre de archivo con ID si existe, o generar nuevo
    const filename = desglose.id ? desglose.id : `desglose_${Date.now()}.json`;
    const filePath = path.join(folderPath, filename);
    
    // Guardar con metadata de quién lo hizo
    desglose.creadoPor = desglose.creadoPor || req.session.user; 
    desglose.fechaCreacion = desglose.fechaCreacion || new Date().toISOString();
    desglose.fechaActualizacion = new Date().toISOString(); // Tracking de updates
    
    if (!desglose.id) {
        desglose.id = filename; 
    }

    fs.writeFile(filePath, JSON.stringify(desglose, null, 4), 'utf8', (err) => {
        if (err) {
            console.error('Error al guardar el archivo:', err);
            return res.status(500).json({ success: false, message: 'Error interno al guardar' });
        }
        res.json({ success: true, message: 'Desglose guardado correctamente', id: desglose.id });
    });
});


// Listar desgloses históricos (de todos los días)
app.get('/api/desgloses', checkAuth, (req, res) => {
    const datosPath = path.join(__dirname, 'datos');
    const desgloses = [];
    
    if (fs.existsSync(datosPath)) {
        const fechas = fs.readdirSync(datosPath);
        
        fechas.forEach(fecha => {
            const fechaPath = path.join(datosPath, fecha);
            const stats = fs.statSync(fechaPath);
            
            if (stats.isDirectory()) {
                const archivos = fs.readdirSync(fechaPath);
                archivos.forEach(archivo => {
                    if (archivo.endsWith('.json')) {
                        const filePath = path.join(fechaPath, archivo);
                        try {
                            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                            data.id = archivo;
                            data.carpetaFecha = fecha;
                            
                            // Lógica de roles
                            if (req.session.role === 'admin' || data.creadoPor === req.session.user) {
                                desgloses.push(data);
                            }
                        } catch (e) {
                            console.error('Error parseando JSON:', filePath);
                        }
                    }
                });
            }
        });
    }
    
    // Ordenar de más reciente a más antiguo
    desgloses.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
    
    res.json(desgloses);
});

// Eliminar un desglose específico
app.delete('/api/desgloses/:fecha/:id', checkAuth, (req, res) => {
    const { fecha, id } = req.params;
    const filePath = path.join(__dirname, 'datos', fecha, id);
    
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({ success: true, message: 'Desglose eliminado' });
    } else {
        res.status(404).json({ success: false, message: 'Archivo no encontrado' });
    }
});

// --- API Ofertas (Grupos Consolidados) ---
const ofertasPath = path.join(__dirname, 'datos', 'ofertas.json');

app.get('/api/ofertas', checkAuth, (req, res) => {
    if (fs.existsSync(ofertasPath)) {
        try {
            const data = JSON.parse(fs.readFileSync(ofertasPath, 'utf8'));
            res.json(data);
        } catch (e) {
            res.json([]);
        }
    } else {
        res.json([]);
    }
});

app.post('/api/ofertas', checkAuth, (req, res) => {
    const { nombre, ids_desgloses } = req.body;
    
    let ofertas = [];
    if (fs.existsSync(ofertasPath)) {
        try {
            ofertas = JSON.parse(fs.readFileSync(ofertasPath, 'utf8'));
        } catch (e) {
            ofertas = [];
        }
    }

    const nuevaOferta = {
        id: Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9),
        nombre: nombre || 'Grupo sin nombre',
        ids_desgloses: ids_desgloses || [],
        fechaCreacion: new Date().toISOString(),
        creadoPor: req.session.user
    };

    ofertas.push(nuevaOferta);

    // Asegurar directorio datos/ (ya existe por desgloses, pero por si acaso)
    const datosDir = path.join(__dirname, 'datos');
    if (!fs.existsSync(datosDir)) {
        fs.mkdirSync(datosDir, { recursive: true });
    }

    fs.writeFile(ofertasPath, JSON.stringify(ofertas, null, 2), 'utf8', (err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error interno al guardar la oferta' });
        }
        res.json({ success: true, message: 'Oferta guardada correctamente', oferta: nuevaOferta });
    });
});

app.delete('/api/ofertas/:id', checkAuth, (req, res) => {
    const { id } = req.params;
    
    if (fs.existsSync(ofertasPath)) {
        try {
            let ofertas = JSON.parse(fs.readFileSync(ofertasPath, 'utf8'));
            const initialLength = ofertas.length;
            ofertas = ofertas.filter(o => o.id !== id);
            
            if (ofertas.length < initialLength) {
                fs.writeFileSync(ofertasPath, JSON.stringify(ofertas, null, 2), 'utf8');
                res.json({ success: true, message: 'Oferta eliminada' });
            } else {
                res.status(404).json({ success: false, message: 'Oferta no encontrada' });
            }
        } catch (e) {
            res.status(500).json({ success: false, message: 'Error interno al borrar la oferta' });
        }
    } else {
        res.status(404).json({ success: false, message: 'Archivo de ofertas no encontrado' });
    }
});

// Ruta default
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
