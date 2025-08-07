import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from '../App';
import Login from '../auth/Login';
import Register from '../auth/Register';
import ProtectedRoute from '../auth/ProtectedRoute';

// // Komponen untuk mengatur semua routing PWA
function AppRoute() {
  console.log('PWA AppRoute component rendered.'); // // Log untuk debugging

  return (
    <Router>
      <Routes>
        {/* // Rute utama yang dilindungi */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <App />
            </ProtectedRoute>
          } 
        />
        <Route path="/login" element={<Login />} />
        {/* // Rute untuk halaman registrasi */}
        <Route path="/register" element={<Register />} />
        {/* // Rute /verify telah dihapus karena verifikasi sekarang menjadi bagian dari registrasi */}
      </Routes>
    </Router>
  );
}

export default AppRoute;
