import { useCallback, useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';

import UserView from './components/UserView';
import Login from './components/Login';
import LoginSuper from './components/LoginSuper';
import SuperAdmin from './components/SuperAdmin';
import ClientAdmin from './components/ClientAdmin';
import Home from './components/Home';
import LoadingScreen from './components/ui/LoadingScreen';
import { SUPER_ADMIN_EMAIL } from './lib/constants';
import { freeModulesOf } from './lib/modules';
import { describeSchedule } from './lib/schedule';
import useSystemStatus from './hooks/useSystemStatus';

function DashboardRouter() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const userRoleRef = useRef(null);
  const operatorKeysRef = useRef([]);
  const kickingRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const system = useSystemStatus();

  useEffect(() => {
    let unsubUserDoc = null;

    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        if (unsubUserDoc) unsubUserDoc();
        if (userRoleRef.current === 'superuser') {
          navigate('/loginS');
        } else {
          navigate('/');
        }
        setLoading(false);
      } else {
        setUser(u);
        try {
          const userDocRef = doc(db, 'users', u.uid);
          const userSnap = await getDoc(userDocRef);
          
          let role = 'operator';

          if (userSnap.exists()) {
            const userData = userSnap.data();
            // Bloquear acceso si la cuenta está inhabilitada (solo para operadores)
            if (userData.isActive === false && userData.role !== 'superuser') {
              await signOut(auth);
              alert("Tu cuenta ha sido inhabilitada por el administrador.");
              return;
            }
            role = userData.role || 'operator';
            operatorKeysRef.current = [userData.rut, u.uid]; // así se identifica en los módulos
          } else {
            // Auto-registro para el super admin hardcodeado si aún no está en la colección
            if (u.email === SUPER_ADMIN_EMAIL) {
              await setDoc(userDocRef, {
                rut: u.email.split('@')[0],
                name: 'Super Administrador',
                role: 'superuser',
                createdAt: new Date().toISOString()
              });
              role = 'superuser';
            }
          }
          
          setUserRole(role);
          userRoleRef.current = role;

          // Si el usuario es un operador normal, escuchamos en tiempo real si lo deshabilitan.
          // (El cierre del sistema, manual o por horario, lo vigila el efecto de más abajo.)
          if (role !== 'superuser') {
            unsubUserDoc = onSnapshot(userDocRef, async (docSnap) => {
              if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.isActive === false) {
                  await signOut(auth);
                  alert("Tu cuenta ha sido inhabilitada por el administrador. Has sido desconectado.");
                }
              }
            });
          }

        } catch (e) {
          console.error("Error fetching role:", e);
        }
        setLoading(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubUserDoc) unsubUserDoc();
    };
  }, [navigate]);

  // Sistema cerrado (por Jefatura o fuera de horario): el operador libera su módulo y se desconecta.
  // Vale tanto para quien está trabajando como para quien intenta entrar con el sistema cerrado.
  const isAdmin = userRole === 'superuser' || user?.email === SUPER_ADMIN_EMAIL;
  const { loaded: systemLoaded, open: systemOpen, manualOpen } = system;
  const { open: openTime, close: closeTime } = system.schedule;
  useEffect(() => {
    if (!user || !userRole || isAdmin || !systemLoaded || systemOpen || kickingRef.current) return;
    kickingRef.current = true;
    const message = manualOpen
      ? `Fuera de horario: el sistema atiende ${describeSchedule({ open: openTime, close: closeTime })}. La sesión se cerró.`
      : 'El sistema ha sido cerrado temporalmente por Jefatura. Has sido desconectado.';
    (async () => {
      try {
        await freeModulesOf(operatorKeysRef.current);
      } catch (e) {
        console.error(e);
      }
      await signOut(auth);
      alert(message);
      kickingRef.current = false;
    })();
  }, [user, userRole, isAdmin, systemLoaded, systemOpen, manualOpen, openTime, closeTime]);

  const handleLogout = useCallback(() => signOut(auth), []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) return null;

  if (userRole === 'superuser' || user.email === SUPER_ADMIN_EMAIL) {
    return <SuperAdmin onLogout={handleLogout} />;
  }

  return <ClientAdmin onLogout={handleLogout} />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        
        <Route path="/visor" element={<UserView />} />
        <Route path="/login" element={<Login />} />
        <Route path="/loginS" element={<LoginSuper />} />
        <Route path="/dashboard" element={<DashboardRouter />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
