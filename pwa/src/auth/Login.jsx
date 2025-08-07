import { useState, useRef } from 'react';

// // Komponen halaman Login untuk PWA
function Login() {
  const [code, setCode] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputsRef = useRef([]);

  console.log('PWA Login component rendered.'); // // Log untuk debugging

  // // Fungsi untuk menangani perubahan input
  const handleChange = (e, index) => {
    const { value } = e.target;
    // // Hanya izinkan angka dan batasi 1 karakter
    if (/^[0-9]$/.test(value) || value === '') {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // // Pindah fokus ke input berikutnya jika karakter dimasukkan
      if (value !== '' && index < 3) {
        inputsRef.current[index + 1].focus();
      }
    }
  };

  // // Fungsi untuk menangani backspace
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && code[index] === '' && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  // // Fungsi untuk menangani proses login (dummy)
  const handleLogin = (e) => {
    e.preventDefault();
    const verificationCode = code.join('');
    if (verificationCode.length !== 4) {
      setError('Kode verifikasi harus 4 angka.');
      return;
    }
    setLoading(true);
    setError('');
    console.log('Attempting to log in with code:', verificationCode);

    // // Simulasi proses login
    setTimeout(() => {
      // // Logika verifikasi kode akan ditambahkan di sini
      console.log('Login process finished.');
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="glass-card w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold mb-2">Verifikasi Kode</h1>
        <p className="text-gray-300 mb-6">Masukkan 4 angka kode verifikasi dari HP Anda.</p>
        
        <form onSubmit={handleLogin}>
          <div className="flex justify-center gap-3 mb-6">
            {code.map((digit, index) => (
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
          
          {error && <p className="text-red-400 mb-4">{error}</p>}

          <button type="submit" disabled={loading} className="glass-button w-full">
            {loading ? 'Memverifikasi...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
