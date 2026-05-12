import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Camera, Info, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import './Registro.css';

/**
 * Página de registro para nuevos analistas en la plataforma
 */
const Registro = () => {
    const navigate = useNavigate();
    // Estados para los datos del formulario, errores y gestión de la foto de perfil
    const [datos, setDatos] = useState({ usuario: '', hashClave: '', biografia: '' });
    const [errores, setErrores] = useState({});
    const [foto, setFoto] = useState(null);
    const [preview, setPreview] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [errorUsuario, setErrorUsuario] = useState('');

    // Actualizar los datos del usuario mientras escribe y limpiar errores
    const handleInputChange = (e) => {
        setDatos({ ...datos, [e.target.name]: e.target.value });
        if (e.target.name === 'usuario') setErrorUsuario('');
        setErrores({ ...errores, [e.target.name]: false });
    };

    // Procesar la imagen seleccionada para mostrar una previsualización
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFoto(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    // Enviar los datos del nuevo usuario al servidor
    const handleSubmit = async (e) => {
        e.preventDefault();
        let nuevosErrores = {};

        // Comprobamos que el usuario y la contraseña no estén vacíos
        if (!datos.usuario.trim()) nuevosErrores.usuario = true;
        if (!datos.hashClave.trim()) nuevosErrores.hashClave = true;

        if (Object.keys(nuevosErrores).length > 0) {
            setErrores(nuevosErrores);
            return;
        }

        setCargando(true);
        // Usamos FormData para poder enviar tanto el JSON como el archivo de imagen
        const formData = new FormData();
        formData.append('usuario', new Blob([JSON.stringify(datos)], { type: 'application/json' }));
        if (foto) formData.append('foto', foto);

        try {
            // Intentamos crear la cuenta en el backend
            await axios.post('http://localhost:8080/api/usuarios/registrar', formData);
            // Si tiene éxito, vamos al login con un mensaje de bienvenida
            navigate('/login', { state: { mensajeExito: '¡Cuenta creada con éxito!' } });
        } catch (error) {
            // Si el nombre de usuario ya está cogido, mostramos el aviso
            if (error.response?.data?.toString().toLowerCase().includes("existe")) {
                setErrorUsuario("Este analista ya está registrado");
            }
        } finally {
            setCargando(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="container-auth wide"
        >
            <h2 className="brand-logo">Social<span className="brand-green">Markets</span></h2>
            <p className="subtitle">Únete a la comunidad de analistas</p>

            <form className="form-auth" onSubmit={handleSubmit}>
                {/* Sección para subir y previsualizar la foto de perfil */}
                <div className="profile-upload-section">
                    <label htmlFor="foto" className="avatar-clickable-area">
                        <div className="avatar-preview-container">
                            {preview ? <img src={preview} alt="Preview" /> : <Camera size={24} />}
                            <div className="upload-badge">+</div>
                        </div>
                        <span className="upload-label-text">Foto de Perfil</span>
                    </label>
                    <input type="file" id="foto" accept="image/*" onChange={handleFileChange} hidden />
                </div>

                {/* Campos de texto para el nombre de usuario y la contraseña */}
                <div className="grid-inputs">
                    <div className={`input-group-modern ${errorUsuario || errores.usuario ? 'error' : ''}`}>
                        <label><UserPlus size={14} /> Usuario</label>
                        <input name="usuario" onChange={handleInputChange} />
                    </div>

                    <div className={`input-group-modern ${errores.hashClave ? 'error' : ''}`}>
                        <label><ShieldCheck size={14} /> Contraseña</label>
                        <input type="password" name="hashClave" onChange={handleInputChange} />
                    </div>
                </div>

                {/* Campo opcional para una breve descripción biográfica */}
                <div className="input-group-modern">
                    <label><Info size={14} /> Biografía</label>
                    <textarea name="biografia" rows="1" onChange={handleInputChange} />
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={cargando}
                    className="btn-gradient"
                    style={{ margin: '1rem auto 0', width: '100%' }}
                >
                    {cargando ? <span className="loader small"></span> : 'Crear Cuenta'}
                </motion.button>

                <p className="auth-footer">
                    ¿Ya eres miembro? <Link to="/login">Inicia sesión</Link>
                </p>
            </form>
        </motion.div>
    );
};

export default Registro;