import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

// // Data dummy untuk daftar HP
const initialPhones = [
  { id: 1, name: 'Samsung Galaxy S23', code: 'A1B2-C3D4' },
  { id: 2, name: 'iPhone 15 Pro', code: 'E5F6-G7H8' },
  { id: 3, name: 'Google Pixel 8', code: 'I9J0-K1L2' },
];

// // Komponen halaman untuk manajemen HP
function ManajemenHp() {
  const [phones, setPhones] = useState(initialPhones);

  console.log('ManajemenHp component rendered.'); // // Log untuk debugging

  // // Fungsi untuk menambah HP (placeholder)
  const handleAddPhone = () => {
    console.log('Add Phone button clicked.');
    // // Logika untuk membuka modal atau form tambah HP akan ditambahkan di sini
  };

  // // Fungsi untuk menghapus HP (placeholder)
  const handleDeletePhone = (id) => {
    console.log(`Delete button clicked for phone ID: ${id}`);
    // // Logika untuk menghapus HP dari database akan ditambahkan di sini
    setPhones(phones.filter(phone => phone.id !== id));
  };

  return (
    <div className="glass-card w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manajemen Hp</h1>
        <button onClick={handleAddPhone} className="glass-button flex items-center">
          <Plus size={20} className="mr-2" />
          <span>Tambah Hp</span>
        </button>
      </div>

      {/* // List HP */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white border-opacity-20">
              <th className="p-4">Nama Hp</th>
              <th className="p-4">Kode Verifikasi</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {phones.map((phone) => (
              <tr key={phone.id} className="border-b border-white border-opacity-10 hover:bg-white hover:bg-opacity-5">
                <td className="p-4">{phone.name}</td>
                <td className="p-4 font-mono">{phone.code}</td>
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
    </div>
  );
}

export default ManajemenHp;
