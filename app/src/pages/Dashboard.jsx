// // Komponen untuk halaman utama/dashboard
function Dashboard() {
  console.log('Dashboard component rendered.'); // // Log untuk debugging
  return (
    <div className="glass-card w-full h-full flex flex-col items-center justify-center">
      <h1 className="text-5xl font-extrabold">Welcome</h1>
      <p className="mt-4 text-lg">This is the main content area.</p>
    </div>
  );
}

export default Dashboard;
