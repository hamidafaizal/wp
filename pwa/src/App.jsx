import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PwaUpdater from './components/PwaUpdater';
import ChatBubble from './components/ChatBubble';
import { LogOut } from 'lucide-react';
import { supabase } from './supabaseClient';

// // Komponen utama PWA
function App() {
  const [batches, setBatches] = useState([]);
  const [phoneInfo, setPhoneInfo] = useState({ name: '', id: null });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // // Fungsi untuk mengambil data awal (nama HP dan batch link)
  const fetchData = useCallback(async (user) => {
    console.log('Fetching initial PWA data for user:', user.id);
    try {
      const { data: phoneData, error: phoneError } = await supabase
        .from('registered_phones')
        .select('id, phone_name')
        .eq('linked_pwa_user_id', user.id)
        .single();
      
      if (phoneError || !phoneData) throw new Error('Akun Anda tidak tertaut dengan HP manapun.');
      
      setPhoneInfo({ name: phoneData.phone_name, id: phoneData.id });
      console.log(`Phone loaded: ${phoneData.phone_name} (ID: ${phoneData.id})`);

      const { data: batchData, error: batchError } = await supabase
        .from('pwa_links')
        .select('id, links') // // Mengambil kolom 'links' (array)
        .eq('phone_id', phoneData.id);

      if (batchError) throw batchError;

      setBatches(batchData || []);
      console.log(`Fetched ${batchData.length} existing batches.`);

    } catch (error) {
      console.error('Error fetching PWA data:', error.message);
      setMessage(`Error: ${error.message}`);
      await supabase.auth.signOut();
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        fetchData(user);
      } else {
        setLoading(false);
        navigate('/login');
      }
    });
  }, [fetchData, navigate]);

  // // Listener untuk batch baru (real-time)
  useEffect(() => {
    if (!phoneInfo.id) return;

    console.log(`Setting up real-time subscription for phone_id: ${phoneInfo.id}`);
    const channel = supabase
      .channel('pwa_links_changes')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'pwa_links',
          filter: `phone_id=eq.${phoneInfo.id}`
        },
        (payload) => {
          console.log('New batch received:', payload.new);
          setBatches((currentBatches) => [...currentBatches, payload.new]);
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription.');
      supabase.removeChannel(channel);
    };
  }, [phoneInfo.id]);

  const handleLogout = async () => {
    console.log('Logging out...');
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleDelete = async (id) => {
    setBatches(batches.filter(batch => batch.id !== id));
    console.log('Attempting to delete batch with id:', id);
    const { error } = await supabase.from('pwa_links').delete().eq('id', id);
    if (error) {
      console.error('Error deleting batch:', error.message);
      setMessage('Gagal menghapus batch, silakan muat ulang.');
      supabase.auth.getUser().then(({ data: { user } }) => user && fetchData(user));
    }
  };

  const handleDeleteAll = async () => {
    console.log('Attempting to delete all batches...');
    // // Kita perlu fungsi RPC baru untuk ini, untuk sementara kita hapus dari client
    const { error } = await supabase
      .from('pwa_links')
      .delete()
      .eq('phone_id', phoneInfo.id);

    if (error) {
      console.error('Error deleting all batches:', error.message);
      setMessage(`Gagal menghapus semua batch: ${error.message}`);
    } else {
      console.log('All batches deleted successfully.');
      setBatches([]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen p-4">
      <PwaUpdater />
      
      <header className="glass-card flex-shrink-0 !p-4 mb-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">{phoneInfo.name}</h1>
          <button onClick={handleLogout} className="glass-button !px-3 !py-2">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-grow overflow-y-auto pr-2 space-y-4">
        {message && <p className="text-center text-red-400">{message}</p>}
        {batches.length === 0 && !message && (
            <div className="text-center text-gray-400 pt-10">
                <p>Belum ada batch link yang diterima.</p>
            </div>
        )}
        {batches.map(batch => (
          <ChatBubble 
            key={batch.id} 
            batch={batch} 
            onDelete={handleDelete}
          />
        ))}
      </main>

      <footer className="flex-shrink-0 mt-4">
        <button onClick={handleDeleteAll} className="glass-button w-full bg-red-500 bg-opacity-30 hover:bg-opacity-40">
          Hapus Semua Link
        </button>
      </footer>
    </div>
  );
}

export default App;
