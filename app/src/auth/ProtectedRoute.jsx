import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

// // Komponen untuk melindungi route yang memerlukan autentikasi
function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // // Mengambil sesi yang sedang aktif
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
      console.log('Checked session state:', session); // // Log status sesi
    };

    fetchSession();

    // // Mendengarkan perubahan status autentikasi
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      console.log('Auth state changed:', session); // // Log perubahan status
    });

    // // Berhenti mendengarkan saat komponen di-unmount
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    // // Tampilkan loading indicator saat sesi sedang diperiksa
    return <div>Loading...</div>;
  }

  // // Jika tidak ada sesi (user tidak login), arahkan ke halaman login
  if (!session) {
    console.log('No active session, redirecting to login.'); // // Log redirect
    return <Navigate to="/login" />;
  }

  // // Jika ada sesi (user sudah login), tampilkan konten yang dilindungi
  return children;
}

export default ProtectedRoute;
