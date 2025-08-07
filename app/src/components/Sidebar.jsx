import { useNavigate, NavLink } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Upload, Smartphone, Link as LinkIcon } from 'lucide-react'; // // Mengimpor ikon

// // Komponen Sidebar untuk navigasi dan aksi
function Sidebar() {
  const navigate = useNavigate();
  console.log('Sidebar component rendered.'); // // Log untuk debugging

  // // Fungsi untuk menangani proses logout
  const handleLogout = async () => {
    console.log('Logout button clicked.');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    } else {
      console.log('Logout successful, navigating to login.');
      navigate('/login');
    }
  };

  // // Styling untuk link navigasi
  const navLinkClass = "flex items-center p-3 my-2 rounded-lg transition-colors duration-200";
  const activeLinkClass = "bg-white bg-opacity-20";
  const inactiveLinkClass = "hover:bg-white hover:bg-opacity-10";

  return (
    // // Menghapus h-screen agar tinggi sidebar fleksibel mengikuti parent
    <aside className="glass-card w-64 p-4 flex flex-col">
      <div className="flex-grow">
        <h2 className="text-2xl font-bold text-white mb-10 text-center">Winning Product</h2>
        
        {/* // Navigasi */}
        <nav>
          <NavLink 
            to="/upload"
            className={({ isActive }) => `${navLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}
          >
            <Upload className="mr-3" size={20} />
            <span>Upload File</span>
          </NavLink>
          <NavLink 
            to="/management"
            className={({ isActive }) => `${navLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}
          >
            <Smartphone className="mr-3" size={20} />
            <span>Manajemen Hp</span>
          </NavLink>
          <NavLink 
            to="/distribution"
            className={({ isActive }) => `${navLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}
          >
            <LinkIcon className="mr-3" size={20} />
            <span>Distribusi Link</span>
          </NavLink>
        </nav>
      </div>
      
      <div>
        <button onClick={handleLogout} className="glass-button w-full">
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
