import { useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

// // Komponen halaman Registrasi PWA dengan verifikasi terintegrasi
function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const inputsRef = useRef([]);

  console.log('PWA Register component rendered.'); // // Log untuk debugging

  // // Fungsi untuk menangani perubahan input kode verifikasi
  const handleCodeChange = (e, index) => {
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
  const handleCodeKeyDown = (e, index) => {
    if (e.key === 'Backspace' && verificationCode[index] === '' && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  // // Fungsi untuk menangani proses registrasi dan penautan akun
  const handleRegisterAndLink = async (e) => {
    e.preventDefault();
    const codeString = verificationCode.join('');
    if (codeString.length !== 4) {
      setError('Kode verifikasi harus 4 angka.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage('');
    console.log('Attempting to register and link with email:', email); // // Log email

    // // Langkah 1: Daftarkan pengguna baru
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (signUpError) {
      console.error('Error during sign up:', signUpError.message); // // Log error
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (!signUpData.user) {
        setError('Gagal membuat pengguna. Silakan coba lagi.');
        setLoading(false);
        return;
    }
    
    console.log('Sign up successful, user created with ID:', signUpData.user.id);

    // // Langkah 2: Tautkan akun baru dengan kode verifikasi
    console.log(`Calling RPC 'link_pwa_to_admin_rpc' with user_id: ${signUpData.user.id} and code: ${codeString}`);
    const { data: rpcData, error: rpcError } = await supabase.rpc('link_pwa_to_admin_rpc', {
        p_user_id: signUpData.user.id,
        p_verification_code: codeString
    });

    console.log('RPC call result data:', rpcData); // // Log hasil RPC
    console.error('RPC call result error:', rpcError); // // Log error RPC

    if (rpcError) {
        console.error('Error linking account after sign up:', rpcError.message);
        setError(`Registrasi berhasil, tetapi gagal menautkan akun: ${rpcError.message}. Pastikan kode verifikasi benar.`);
    } else {
        console.log('Account linked successfully.');
        setMessage('Registrasi dan penautan akun berhasil! Silakan login.');
        setTimeout(() => {
            navigate('/login');
        }, 3000);
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center h-screen p-4">
      <div className="glass-card w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold mb-2">Register PWA</h1>
        <p className="text-gray-300 mb-6">Daftar dan tautkan akun Anda.</p>
        
        {error && <p className="text-red-400 mb-4">{error}</p>}
        {message && <p className="text-green-400 mb-4">{message}</p>}
        
        <form onSubmit={handleRegisterAndLink} className="space-y-6">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 bg-white bg-opacity-20 rounded-lg border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 bg-white bg-opacity-20 rounded-lg border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          
          <div>
            <p className="text-gray-300 mb-3">Kode Verifikasi</p>
            <div className="flex justify-center gap-3">
              {verificationCode.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputsRef.current[index] = el}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleCodeChange(e, index)}
                  onKeyDown={(e) => handleCodeKeyDown(e, index)}
                  className="w-14 h-16 text-center text-3xl font-bold bg-white bg-opacity-20 rounded-lg border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="glass-button w-full">
            {loading ? 'Memproses...' : 'Register & Link'}
          </button>
        </form>
        <p className="text-center mt-6">
          Sudah punya akun? <Link to="/login" className="font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
