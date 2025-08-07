import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PwaUpdater from './components/PwaUpdater';
import { LogOut, Trash2, Copy } from 'lucide-react';

// // Data dummy untuk link
const dummyLinks = [
  { id: 1, url: 'https://example.com/product/super-widget-pro' },
  { id: 2, url: 'https://example.com/product/ultra-gadget-max' },
  { id: 3, url: 'https://example.com/product/mega-device-2024' },
  { id: 4, url: 'https://example.com/product/another-cool-item' },
  { id: 5, url: 'https://example.com/product/awesome-stuff-plus' },
];

// // Komponen untuk satu bubble chat
function ChatBubble({ link, onDelete, onCopy }) {
  return (
    <div className="bg-white bg-opacity-10 rounded-xl p-3 flex items-center gap-3">
      <p className="flex-grow text-gray-300 truncate">{link.url}</p>
      <button onClick={() => onCopy(link.url)} className="p-2 text-gray-400 hover:text-white transition-colors">
        <Copy size={18} />
      </button>
      <button onClick={() => onDelete(link.id)} className="p-2 text-red-400 hover:text-red-300 transition-colors">
        <Trash2 size={18} />
      </button>
    </div>
  );
}

// // Komponen utama PWA
function App() {
  const [links, setLinks] = useState(dummyLinks);
  const navigate = useNavigate();

  // // Fungsi untuk logout
  const handleLogout = () => {
    console.log('Logging out...');
    localStorage.removeItem('pwaIsLoggedIn');
    navigate('/login');
  };

  // // Fungsi untuk menghapus semua link (dummy)
  const handleClearAll = () => {
    console.log('Clearing all links...');
    setLinks([]);
  };

  // // Fungsi untuk menghapus satu link (dummy)
  const handleDeleteLink = (id) => {
    console.log(`Deleting link with id: ${id}`);
    setLinks(currentLinks => currentLinks.filter(link => link.id !== id));
  };

  // // Fungsi untuk menyalin link (dummy)
  const handleCopyLink = (url) => {
    console.log(`Copying link: ${url}`);
    navigator.clipboard.writeText(url);
    // // Tambahkan notifikasi singkat di sini jika perlu
  };

  return (
    <div className="flex flex-col h-screen p-4">
      <PwaUpdater />
      
      {/* // Header */}
      <header className="glass-card flex-shrink-0 !p-4 mb-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Nama HP (Dummy)</h1>
          <button onClick={handleLogout} className="glass-button !px-3 !py-2">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* // Konten Utama */}
      <main className="flex-grow overflow-y-auto pr-2 space-y-4">
        {links.map(link => (
          <ChatBubble 
            key={link.id} 
            link={link} 
            onDelete={handleDeleteLink}
            onCopy={handleCopyLink}
          />
        ))}
      </main>

      {/* // Footer */}
      <footer className="flex-shrink-0 mt-4">
        <button onClick={handleClearAll} className="glass-button w-full bg-red-500 bg-opacity-30 hover:bg-opacity-40">
          Hapus Semua Link
        </button>
      </footer>
    </div>
  );
}

export default App;
