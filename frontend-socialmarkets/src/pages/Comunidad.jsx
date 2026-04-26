import { useState } from 'react';
import { 
    FiPlus, FiMessageSquare, FiImage, FiTarget, 
    FiCalendar, FiBarChart2, FiX, FiActivity 
} from 'react-icons/fi';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import './Comunidad.css';

const Comunidad = () => {
    const user = { usuario: "Usuario" }; 
    
    const [showModal, setShowModal] = useState(false);
    const [imagenes, setImagenes] = useState([]);

    const handleImageChange = (e) => {
        if (e.target.files.length + imagenes.length > 4) {
            alert("Máximo 4 imágenes permitidas");
            return;
        }
        const files = Array.from(e.target.files);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagenes([...imagenes, ...newPreviews]);
    };

    const removeImage = (index) => {
        setImagenes(imagenes.filter((_, i) => i !== index));
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="main-wrapper">
                <Topbar user={user} />
                
                <main className="comunidad-container">
                    <header className="comunidad-header">
                        <h1>Comunidad</h1>
                        <p>Explora y comparte análisis de mercado con otros analistas.</p>
                    </header>

                    <div className="feed-analisis">
                        <div className="placeholder-feed">
                            <FiMessageSquare size={40} />
                            <p>Aquí aparecerán los análisis de la comunidad...</p>
                        </div>
                    </div>

                    <div className="action-bar-comunidad">
                        <button className="btn-publish" onClick={() => setShowModal(true)}>
                            <FiPlus /> Publicar Nuevo Análisis
                        </button>
                    </div>
                </main>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass-card">
                        <div className="modal-header">
                            <h2><FiActivity /> Crear Análisis</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>
                                <FiX />
                            </button>
                        </div>

                        <form className="analisis-form" onSubmit={(e) => e.preventDefault()}>
                            <div className="form-group">
                                <label>Activo (Ej: BTC/USD, AAPL)</label>
                                <input type="text" placeholder="Escribe el símbolo del activo..." />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tipo de Análisis</label>
                                    <select>
                                        <option value="TECNICO">Técnico</option>
                                        <option value="FUNDAMENTAL">Fundamental</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Precio Objetivo</label>
                                    <div className="input-with-icon">
                                        <FiTarget />
                                        <input type="number" step="0.01" placeholder="0.00" />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Fecha de Vencimiento Estimada</label>
                                <div className="input-with-icon">
                                    <FiCalendar />
                                    <input type="datetime-local" />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Contenido del Análisis</label>
                                <textarea rows="4" placeholder="Explica tu tesis de inversión..."></textarea>
                            </div>

                            <div className="form-group">
                                <label>Imágenes (Máx. 4)</label>
                                <div className="image-upload-container">
                                    <label className="upload-box">
                                        <FiImage />
                                        <span>Subir</span>
                                        <input 
                                            type="file" 
                                            multiple 
                                            accept="image/*" 
                                            onChange={handleImageChange} 
                                            hidden 
                                            disabled={imagenes.length >= 4}
                                        />
                                    </label>
                                    
                                    {imagenes.map((img, index) => (
                                        <div key={index} className="image-preview">
                                            <img src={img} alt="Preview" />
                                            <button type="button" onClick={() => removeImage(index)}><FiX /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" className="btn-submit-analisis">
                                Publicar Análisis
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Comunidad;