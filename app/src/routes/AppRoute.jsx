import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from '../App';
import Login from '../auth/Login';
import Register from '../auth/Register';
import ProtectedRoute from '../auth/ProtectedRoute';
import UploadFile from '../pages/UploadFile';
import Dashboard from '../pages/Dashboard';
import ManajemenHp from '../pages/ManajemenHp';
import DistribusiLink from '../pages/DistribusiLink'; // // Mengimpor halaman DistribusiLink

// // Komponen untuk mengatur semua routing aplikasi
function AppRoute() {
  console.log('AppRoute component rendered, setting up routes.'); // // Log untuk debugging

  return (
    <Router>
      <Routes>
        {/* // Route induk yang dilindungi dan menggunakan layout App.jsx */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <App />
            </ProtectedRoute>
          }
        >
          {/* // Child route yang akan dirender di dalam <Outlet> App.jsx */}
          <Route index element={<Dashboard />} /> {/* // Halaman default untuk "/" */}
          <Route path="upload" element={<UploadFile />} /> {/* // Halaman untuk "/upload" */}
          <Route path="management" element={<ManajemenHp />} /> {/* // Halaman untuk "/management" */}
          <Route path="distribution" element={<DistribusiLink />} /> {/* // Halaman untuk "/distribution" */}
        </Route>

        {/* // Route publik untuk login dan register */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default AppRoute;
