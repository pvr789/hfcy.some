import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const formatRut = (value) => {
    let clean = value.replace(/[^0-9kK]/g, '').toUpperCase();
    if (clean.length === 0) return '';
    if (clean.length <= 1) return clean;
    return `${clean.slice(0, -1)}-${clean.slice(-1)}`;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const loginEmail = `${rut}@some.cl`;
      await signInWithEmailAndPassword(auth, loginEmail, password);
      navigate('/dashboard'); 
    } catch (err) {
      console.error("Login failed:", err);
      setError(`RUT o contraseña incorrectos.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="blobs">
        <div className="blob blob-1"></div>
      </div>
      <form onSubmit={handleLogin} className="login-form fade-in">
        <h2>Hola, bienvenido a la Plataforma de Atención</h2>
        <p className="login-subtitle">Ingresa tu RUT y contraseña para acceder.</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="input-group">
          <label>RUT</label>
          <input 
            type="text" 
            value={rut} 
            onChange={(e) => setRut(formatRut(e.target.value.trim()))} 
            placeholder="Ej. 12345678-9"
            required
            maxLength={10}
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
        
        <button type="submit" className="btn primary massive" disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
