import { useState, useRef, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

// // Komponen halaman untuk memasukkan kode verifikasi setelah login
function VerifyCode() {
  const [verificationCode, setVerificationCode] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('Masukkan kode verifikasi dari admin.');
  const inputsRef = useRef([]);
  const navigate = useNavigate();

  console.log('PWA VerifyCode component rendered.');

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
      setError('Kode verifikasi harus 4 angka.');
      return;
    }

    setLoading(true);
    setError(null);
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
            setError(error.message);
        } else if (!data) {
            console.error('Linking failed. Code not found or already used.');
            setError('Kode verifikasi tidak valid atau sudah digunakan.');
        } else {
            console.log('Account linked successfully.');
            setMessage('Akun berhasil ditautkan! Anda akan dialihkan.');
            setTimeout(() => {
                navigate('/');
            }, 2000);
        }
    } catch (err) {
        console.error('Unexpected error during linking:', err.message);
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen p-4">
      <div className="glass-card w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold mb-2">Verifikasi Kode</h1>
        <p className="text-gray-300 mb-6">{message}</p>
        
        {error && <p className="text-red-400 mb-4">{error}</p>}
        
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
            <button type="submit" disabled={loading} className="glass-button w-full">
              {loading ? 'Menghubungkan...' : 'Hubungkan Akun'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VerifyCode;
