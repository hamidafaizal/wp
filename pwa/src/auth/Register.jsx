import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

// // Komponen halaman Registrasi PWA
function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  console.log('PWA Register component rendered.');

  // // Fungsi untuk menangani proses registrasi email dan password
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage('');
    console.log('Attempting to register with email:', email);

    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      console.error('Error registering:', error.message);
      setError(error.message);
    } else {
      console.log('Registration successful, please check your email for verification.');
      setMessage('Registration successful! Please check your email to verify your account.');
      // // Setelah registrasi berhasil, arahkan ke halaman login
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
        <p className="text-gray-300 mb-6">Daftarkan akun PWA Anda untuk menerima link.</p>
        
        {error && <p className="text-red-400 mb-4">{error}</p>}
        {message && <p className="text-green-400 mb-4">{message}</p>}
        
        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 bg-white bg-opacity-20 rounded-lg border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 bg-white bg-opacity-20 rounded-lg border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <button type="submit" disabled={loading} className="glass-button w-full">
              {loading ? 'Loading...' : 'Register'}
            </button>
          </div>
        </form>
        <p className="text-center mt-6">
          Sudah punya akun? <Link to="/login" className="font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
