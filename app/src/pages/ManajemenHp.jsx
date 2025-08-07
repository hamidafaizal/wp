import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Plus, Trash2, X, ClipboardCopy, Smartphone } from 'lucide-react';

// // Komponen halaman untuk manajemen HP
function ManajemenHp() {
  const [phones, setPhones] = useState([]);
  const [newPhoneName, setNewPhoneName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState(null);

  // // Mengambil daftar HP dari Supabase
  const fetchPhones = async (currentUserId) => {
    console.log('Fetching phones for admin user:', currentUserId); // // Log untuk debugging
    if (!currentUserId) {
      console.log('Admin user ID is null, skipping fetch.'); // // Log untuk debugging
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('registered_phones')
        .select('*')
        .eq('user_id', currentUserId); // // Memastikan hanya mengambil HP milik admin yang login
      if (error) {
        console.error('Error fetching phones:', error.message);
        throw error;
      }
      setPhones(data);
      console.log('Fetched phones:', data); // // Log untuk debugging
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // // Mendengarkan perubahan status autentikasi
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUserId = session?.user?.id;
      setUserId(currentUserId);
      console.log('Auth state changed, admin user ID:', currentUserId); // // Log untuk debugging
      fetchPhones(currentUserId);
    });

    // // Ambil sesi awal
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUserId = session?.user?.id;
      setUserId(currentUserId);
      fetchPhones(currentUserId);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // // Fungsi untuk menangani penambahan HP
  const handleAddPhone = async () => {
    console.log('Attempting to add new phone with name:', newPhoneName); // // Log untuk debugging
    setSubmitting(true);
    setMessage('');
    try {
      if (!newPhoneName) {
        throw new Error('Nama HP tidak boleh kosong.');
      }
      // // Memanggil RPC yang sudah diperbarui
      const { data, error } = await supabase.rpc('register_phone_rpc', {
        phone_name_in: newPhoneName
      });
      if (error) {
        console.error('Error adding phone via RPC:', error.message); // // Log untuk debugging
        throw error;
      }
      
      setVerificationCode(data);
      setMessage('HP berhasil didaftarkan. Gunakan kode ini untuk verifikasi di PWA.');
      console.log('Phone registered successfully, verification code:', data); // // Log untuk debugging
      
      // // Memperbarui daftar HP setelah pendaftaran
      fetchPhones(userId);
      setNewPhoneName('');

    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // // Fungsi untuk menghapus HP
  const handleDeletePhone = async (id) => {
    console.log(`Attempting to delete phone with ID: ${id}`); // // Log untuk debugging
    // // Menggunakan modal custom, bukan window.confirm
    if (!confirm('Apakah Anda yakin ingin menghapus HP ini? Aksi ini tidak dapat dibatalkan.')) {
        return;
    }
    
    try {
      const { error } = await supabase
        .from('registered_phones')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('Error deleting phone:', error.message); // // Log untuk debugging
        throw error;
      }
      
      setPhones(phones.filter(phone => phone.id !== id));
      setMessage('HP berhasil dihapus.');
      console.log(`Phone with ID: ${id} deleted successfully.`); // // Log untuk debugging
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };
  
  // // Fungsi untuk menyalin kode verifikasi
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
        setMessage('Kode verifikasi berhasil disalin!');
        console.log('Verification code copied to clipboard.'); // // Log untuk debugging
    }).catch(err => {
        console.error('Failed to copy code:', err); // // Log untuk debugging
        setMessage('Gagal menyalin kode.');
    });
  };

  return (
    <div className="glass-card w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manajemen Hp</h1>
        <button onClick={() => setIsModalOpen(true)} className="glass-button flex items-center">
          <Plus size={20} className="mr-2" />
          <span>Tambah Hp</span>
        </button>
      </div>
      
      {message && <p className={`text-center mb-4 ${message.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>{message}</p>}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="glass-card w-full max-w-md relative">
            <button onClick={() => { setIsModalOpen(false); setVerificationCode(''); }} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-4">Tambah HP Baru</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="phone-name" className="block text-sm font-medium mb-1">Nama HP</label>
                <input
                  type="text"
                  id="phone-name"
                  value={newPhoneName}
                  onChange={(e) => setNewPhoneName(e.target.value)}
                  className="w-full p-3 bg-white bg-opacity-20 rounded-lg border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Contoh: HP Faiz"
                />
              </div>
              <button onClick={handleAddPhone} disabled={submitting} className="glass-button w-full">
                {submitting ? 'Menambahkan...' : 'Daftarkan HP'}
              </button>
              {verificationCode && (
                <div className="bg-white bg-opacity-10 p-4 rounded-lg mt-4 text-center">
                  <p className="text-sm text-gray-300">Kode Verifikasi:</p>
                  <p className="text-3xl font-bold tracking-widest mt-2">{verificationCode}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex-grow flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : phones.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center text-gray-400">
          <Smartphone size={64} className="mb-4" />
          <p>Belum ada HP yang terdaftar.</p>
        </div>
      ) : (
        <div className="overflow-x-auto flex-grow">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white border-opacity-20">
                <th className="p-4">Nama Hp</th>
                <th className="p-4">Kode Verifikasi</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {phones.map((phone) => (
                <tr key={phone.id} className="border-b border-white border-opacity-10 hover:bg-white hover:bg-opacity-5">
                  <td className="p-4">{phone.phone_name}</td>
                  <td className="p-4 font-mono flex items-center gap-2">
                    {phone.verification_code}
                    <button onClick={() => handleCopyCode(phone.verification_code)} className="p-1 rounded-lg text-gray-400 hover:bg-white hover:bg-opacity-10">
                      <ClipboardCopy size={16} />
                    </button>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${phone.is_verified ? 'bg-green-500 bg-opacity-30 text-green-200' : 'bg-yellow-500 bg-opacity-30 text-yellow-200'}`}>
                      {phone.is_verified ? 'Terverifikasi' : 'Belum Verifikasi'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDeletePhone(phone.id)} className="text-red-400 hover:text-red-300">
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ManajemenHp;
