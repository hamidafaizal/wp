import Sidebar from './components/Sidebar';
import { Outlet } from 'react-router-dom'; // // Mengimpor Outlet untuk merender child routes

// // Komponen utama aplikasi yang berfungsi sebagai layout
function App() {
  console.log('App layout component rendered.'); // // Log untuk debugging

  return (
    // // Menambahkan padding dan gap untuk layout yang lebih baik
    <div className="flex w-full h-screen p-4 gap-4">
      <Sidebar />
      
      {/* // Outlet akan merender komponen halaman sesuai dengan route yang aktif */}
      {/* // Menambahkan overflow-y-auto agar hanya area ini yang bisa di-scroll */}
      <main className="flex-grow overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
