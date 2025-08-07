import { Trash2, Copy } from 'lucide-react';
import { useState } from 'react';

// // Komponen untuk menampilkan satu batch link sebagai satu bubble
function ChatBubble({ batch, onDelete }) {
  const [copyText, setCopyText] = useState('Salin Semua');

  // // Fungsi untuk menyalin semua link dalam batch ke clipboard
  const handleCopyAll = () => {
    console.log(`Copying ${batch.links.length} links.`); // // Log untuk debugging
    const linksAsString = batch.links.join('\n');
    navigator.clipboard.writeText(linksAsString).then(() => {
      setCopyText('Tersalin!');
      setTimeout(() => setCopyText('Salin Semua'), 2000); // // Reset teks tombol setelah 2 detik
    }).catch(err => {
      console.error('Failed to copy links:', err); // // Log error
      setCopyText('Gagal!');
    });
  };

  return (
    <div className="bg-white bg-opacity-10 rounded-xl p-4 flex items-center gap-4 animate-fade-in">
      <div className="flex-grow">
        <p className="font-semibold text-white">Batch Diterima</p>
        <p className="text-sm text-gray-300">{batch.links.length} link</p>
      </div>
      <button 
        onClick={handleCopyAll} 
        className="glass-button !px-4 !py-2 flex items-center gap-2"
        aria-label="Salin semua link"
      >
        <Copy size={16} />
        <span>{copyText}</span>
      </button>
      <button 
        onClick={() => onDelete(batch.id)} 
        className="p-2 text-red-400 hover:text-red-300 transition-colors"
        aria-label="Hapus batch link"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}

export default ChatBubble;
