import { Navigate } from 'react-router-dom';

// // Komponen untuk melindungi route yang memerlukan autentikasi di PWA
function ProtectedRoute({ children }) {
  // // Periksa apakah ada tanda "isLoggedIn" di localStorage
  const isLoggedIn = localStorage.getItem('pwaIsLoggedIn') === 'true';
  console.log('ProtectedRoute check, isLoggedIn:', isLoggedIn); // // Log status login

  if (!isLoggedIn) {
    // // Jika tidak login, arahkan ke halaman login
    console.log('Redirecting to /login');
    return <Navigate to="/login" />;
  }

  // // Jika sudah login, tampilkan konten
  return children;
}

export default ProtectedRoute;
