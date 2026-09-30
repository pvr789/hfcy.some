import { signInWithEmailAndPassword } from 'firebase/auth';
import { IdCard } from 'lucide-react';
import { auth } from '../firebase';
import { formatRut, rutToEmail } from '../lib/utils';
import LoginForm from './LoginForm';

export default function Login() {
  return (
    <LoginForm
      area="operator"
      icon={IdCard}
      heroTitle="Plataforma de Atención"
      heroText="Llama a los pacientes desde tu módulo y mantén informada a la sala de espera en tiempo real."
      title="Hola, bienvenido"
      subtitle="Ingresa tu RUT y contraseña para acceder."
      label="RUT"
      placeholder="Ej. 12345678-9"
      fieldIcon={IdCard}
      formatValue={formatRut}
      maxLength={10}
      errorMessage="RUT o contraseña incorrectos."
      footnote="¿Problemas para ingresar? Contacta a Jefatura del SOME."
      authenticate={(rut, password) => signInWithEmailAndPassword(auth, rutToEmail(rut), password)}
    />
  );
}
