import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

// // Komponen halaman Login
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  console.log('Login component rendered.'); // // Log untuk debugging

  // // Fungsi untuk menangani proses login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    console.log('Attempting to log in with email:', email); // // Log email

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.error('Error logging in:', error.message); // // Log error
      setError(error.message);
    } else {
      console.log('Login successful, navigating to home.'); // // Log sukses
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="glass-card w-full max-w-2xl"> {/* // Lebar diubah dari max-w-lg menjadi max-w-2xl */}
        <h1 className="text-3xl font-bold text-center mb-6">Login</h1>
        {error && <p className="text-red-400 text-center mb-4">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-6">
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
              {loading ? 'Loading...' : 'Login'}
            </button>
          </div>
        </form>
        <p className="text-center mt-6">
          Don't have an account? <Link to="/register" className="font-semibold hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
