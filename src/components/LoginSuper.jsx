import { signInWithEmailAndPassword } from 'firebase/auth';
import { Mail, ShieldCheck } from 'lucide-react';
import { auth } from '../firebase';
import LoginForm from './LoginForm';

// Solo inicia sesión: la app ya no crea la cuenta del administrador si falta.
// Si se borra de Authentication, se vuelve a crear a mano (ver GUIA_MUDANZA_HOSPITAL.md).
const authenticateAdmin = (email, password) => signInWithEmailAndPassword(auth, email, password);

export default function LoginSuper() {
  return (
    <LoginForm
      area="admin"
      icon={ShieldCheck}
      heroTitle="Plataforma de Administración"
      heroText="Gestiona la fila de atención, los módulos y las cuentas del personal del SOME."
      title="Hola, bienvenido"
      subtitle="Ingresa tus credenciales de Jefatura para acceder."
      label="Correo electrónico"
      placeholder="admin@hospital.cl"
      fieldIcon={Mail}
      errorMessage="Credenciales inválidas o no tienes permisos."
      footnote="Acceso exclusivo para Jefatura del SOME."
      authenticate={authenticateAdmin}
    />
  );
}
