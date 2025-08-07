import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

// // Komponen untuk melindungi route yang memerlukan autentikasi di PWA
function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // // Mengambil sesi yang sedang aktif
    const fetchSession = async () => {
      console.log('Checking for active Supabase session...');
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
      console.log('Session check complete. Active session:', !!session); // // Log status sesi
    };

    fetchSession();

    // // Mendengarkan perubahan status autentikasi secara real-time
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session); // // Log perubahan status
      setSession(session);
      setLoading(false);
    });

    // // Berhenti mendengarkan saat komponen di-unmount
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    // // Tampilkan loading indicator saat sesi sedang diperiksa
    return <div>Loading...</div>;
  }

  if (!session) {
    // // Jika tidak ada sesi, alihkan ke halaman login
    console.log('No active session found, redirecting to login.');
    return <Navigate to="/login" />;
  }

  // // Jika ada sesi, tampilkan konten yang dilindungi
  return children;
}

export default ProtectedRoute;
