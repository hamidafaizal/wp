import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PwaUpdater from './components/PwaUpdater';
import { LogOut, Trash2, Copy } from 'lucide-react';
import { supabase } from './supabaseClient';

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
  const [links, setLinks] = useState([]);
  const [isLinked, setIsLinked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '']);
  const [linking, setLinking] = useState(false);
  const [message, setMessage] = useState('');
  const inputsRef = useRef([]);
  const navigate = useNavigate();

  // // Fungsi untuk mengambil status verifikasi dan link
  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // // Cek status verifikasi dari tabel registered_phones
        const { data, error } = await supabase
          .from('registered_phones')
          .select('id')
          .eq('linked_pwa_user_id', user.id)
          .single();
        
        if (data) {
          setIsLinked(true);
          console.log('Account is linked. Fetching links...');
          // TODO: Fetch links from Supabase once the table is ready
        } else {
          setIsLinked(false);
          console.log('Account is not linked. Showing verification form.');
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error.message);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // // Fungsi untuk menangani perubahan input kode verifikasi
  const handleChange = (e, index) => {
    const { value } = e.target;
    if (/^[0-9]$/.test(value) || value === '') {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

      if (value !== '' && index < 3) {
        inputsRef.current[index + 1].focus();
      }
    }
  };

  // // Fungsi untuk menangani backspace pada input kode
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && verificationCode[index] === '' && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  // // Fungsi untuk menautkan akun PWA dengan kode verifikasi admin
  const handleLinkAccount = async (e) => {
    e.preventDefault();
    const codeString = verificationCode.join('');
    if (codeString.length !== 4) {
      setMessage('Kode verifikasi harus 4 angka.');
      return;
    }

    setLinking(true);
    setMessage('');
    console.log('Attempting to link account with code:', codeString);
    
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error('User not logged in.');
        }

        const { data, error } = await supabase.rpc('link_pwa_to_admin_rpc', {
            p_user_id: user.id,
            p_verification_code: codeString
        });

        if (error) {
            console.error('Error linking account:', error.message);
            setMessage(error.message);
        } else if (!data) {
            console.error('Linking failed. Code not found or already used.');
            setMessage('Kode verifikasi tidak valid atau sudah digunakan.');
        } else {
            console.log('Account linked successfully.');
            setMessage('Akun berhasil ditautkan!');
            setIsLinked(true);
        }
    } catch (err) {
        console.error('Unexpected error during linking:', err.message);
        setMessage('Terjadi kesalahan, coba lagi nanti.');
    } finally {
        setLinking(false);
    }
  };

  // // Fungsi untuk logout
  const handleLogout = async () => {
    console.log('Logging out...');
    await supabase.auth.signOut();
    navigate('/login');
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
      
      {isLinked ? (
        <>
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
                onDelete={() => {}}
                onCopy={() => {}}
              />
            ))}
          </main>

          {/* // Footer */}
          <footer className="flex-shrink-0 mt-4">
            <button className="glass-button w-full bg-red-500 bg-opacity-30 hover:bg-opacity-40">
              Hapus Semua Link
            </button>
          </footer>
        </>
      ) : (
        <div className="flex items-center justify-center h-full">
            <div className="glass-card w-full max-w-sm text-center">
                <h1 className="text-2xl font-bold mb-2">Verifikasi Kode</h1>
                {message && <p className={`mb-4 ${message.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>{message}</p>}
                
                <form onSubmit={handleLinkAccount} className="space-y-6">
                    <div className="flex justify-center gap-3 mb-6">
                        {verificationCode.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => inputsRef.current[index] = el}
                                type="text"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleChange(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                className="w-14 h-16 text-center text-3xl font-bold bg-white bg-opacity-20 rounded-lg border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                required
                            />
                        ))}
                    </div>
                    <div>
                        <button type="submit" disabled={linking} className="glass-button w-full">
                            {linking ? 'Menghubungkan...' : 'Hubungkan Akun'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}

export default App;
