import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function LoginSuper() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate('/dashboard'); 
    } catch (err) {
      console.error("Login failed:", err);

      setError(`Credenciales inválidas o no tienes permisos.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="blobs">
        <div className="blob blob-1"></div>
      </div>
      <form onSubmit={handleLogin} className="login-form fade-in" style={{ borderColor: 'rgba(255, 60, 60, 0.2)' }}>
        <h2>Hola, bienvenido a la Plataforma de Administración</h2>
        <p className="login-subtitle">Ingresa tus credenciales para acceder.</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="input-group">
          <label>Correo Electrónico</label>
          <input 
            type="text" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="admin@hospital.cl"
            required
          />
        </div>
        <div className="input-group">
          <label>Contraseña</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
          />
        </div>
        
        <button type="submit" className="btn primary massive" disabled={loading} style={{ background: '#0f172a' }}>
          {loading ? 'Validando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
