import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from '../App';
import Login from '../auth/Login';
// import ProtectedRoute from '../auth/ProtectedRoute'; // // Proteksi dinonaktifkan sementara

// // Komponen untuk mengatur semua routing PWA
function AppRoute() {
  console.log('PWA AppRoute component rendered.'); // // Log untuk debugging

  return (
    <Router>
      <Routes>
        {/* // Route utama sekarang langsung menampilkan App tanpa proteksi */}
        <Route 
          path="/" 
          element={<App />} 
        />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default AppRoute;
