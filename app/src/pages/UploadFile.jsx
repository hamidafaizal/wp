import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, RefreshCw } from 'lucide-react'; // // Menambahkan ikon RefreshCw
import Papa from 'papaparse';
import { supabase } from '../supabaseClient';

// // Komponen halaman untuk mengunggah dan memproses file
function UploadFile() {
  const [rank, setRank] = useState(30);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [restarting, setRestarting] = useState(false); // // State untuk loading restart
  const [message, setMessage] = useState('');

  console.log('UploadFile component rendered.');

  const onDrop = useCallback(acceptedFiles => {
    console.log('Files dropped:', acceptedFiles);
    setFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
  });

  const handleProcess = async () => {
    if (files.length === 0) {
      alert('Silakan pilih file CSV terlebih dahulu.');
      return;
    }
    setLoading(true);
    setMessage('Memproses file...');
    console.log(`Processing ${files.length} files with rank: ${rank}`);

    try {
      // // 1. Ambil semua link yang sudah ada dari cache DAN antrean (processed_links)
      setMessage('Memeriksa riwayat link...');
      const [cacheResult, processedResult] = await Promise.all([
        supabase.from('sent_links_cache').select('link'),
        supabase.from('processed_links').select('link')
      ]);

      if (cacheResult.error) throw cacheResult.error;
      if (processedResult.error) throw processedResult.error;

      const cachedLinks = new Set(cacheResult.data.map(item => item.link));
      const processedLinks = new Set(processedResult.data.map(item => item.link));
      const existingLinksSet = new Set([...cachedLinks, ...processedLinks]);
      
      console.log(`Found ${cachedLinks.size} links in cache and ${processedLinks.size} links in queue. Total existing: ${existingLinksSet.size}`);

      const allLinks = new Set();

      const parseFile = (file) => {
        return new Promise((resolve, reject) => {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              try {
                const { data, meta } = results;
                console.log(`Parsing ${file.name}, found ${data.length} rows.`);

                const requiredHeaders = ["Tren", "isAd", "Penjualan (30 Hari)", "productLink"];
                if (!requiredHeaders.every(h => meta.fields.includes(h))) {
                  throw new Error(`File ${file.name} tidak memiliki header yang dibutuhkan.`);
                }

                const nonTurun = data.filter(r => r.Tren && r.Tren.toUpperCase() !== 'TURUN');
                const adLinks = nonTurun.filter(r => r.isAd && r.isAd.toUpperCase() === 'YES').map(r => r.productLink);
                const organikLinks = nonTurun
                  .filter(r => r.isAd && r.isAd.toUpperCase() === 'NO' && r.Tren && r.Tren.toUpperCase() === 'NAIK')
                  .sort((a, b) => (parseInt(b['Penjualan (30 Hari)'] || '0') - parseInt(a['Penjualan (30 Hari)'] || '0')))
                  .slice(0, rank)
                  .map(r => r.productLink);
                
                adLinks.forEach(link => link && allLinks.add(link));
                organikLinks.forEach(link => link && allLinks.add(link));
                
                resolve();
              } catch (error) {
                reject(error);
              }
            },
            error: (error) => reject(error),
          });
        });
      };

      await Promise.all(files.map(file => parseFile(file)));

      const filteredLinks = Array.from(allLinks);
      
      // // 2. Saring link yang sudah ada di cache atau di antrean
      const newUniqueLinks = filteredLinks.filter(link => !existingLinksSet.has(link));
      console.log(`${newUniqueLinks.length} new unique links found after filtering.`);

      if (newUniqueLinks.length > 0) {
        // // Hapus semua link lama dari antrean (processed_links)
        setMessage('Membersihkan antrean link lama...');
        const { error: deleteError } = await supabase.from('processed_links').delete().match({ user_id: (await supabase.auth.getUser()).data.user.id });
        if (deleteError) throw deleteError;

        // // Simpan link baru ke processed_links
        setMessage(`Menyimpan ${newUniqueLinks.length} link baru ke antrean...`);
        const linksToInsert = newUniqueLinks.map(link => ({ link }));
        const { error: insertError } = await supabase.from('processed_links').insert(linksToInsert);
        if (insertError) throw insertError;
        
        setMessage(`Sukses! ${newUniqueLinks.length} link baru berhasil ditambahkan ke antrean.`);
      } else {
        setMessage('Tidak ada link baru yang lolos filter untuk ditambahkan.');
      }

    } catch (error) {
      console.error('Error processing files:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
      setFiles([]);
    }
  };

  // // Fungsi untuk menghapus semua data link
  const handleForceRestart = async () => {
    // // Sebaiknya tambahkan modal konfirmasi di sini sebelum menjalankan
    // // const confirmed = window.confirm('Apakah Anda yakin ingin menghapus SEMUA data link? Aksi ini tidak bisa dibatalkan.');
    // // if (!confirmed) return;

    setRestarting(true);
    setMessage('Menghapus semua data link...');
    console.log('Invoking force_restart_user_data function...');

    try {
      const { data, error } = await supabase.rpc('force_restart_user_data');
      if (error) throw error;

      console.log('Force restart response:', data);
      setMessage(data); // // Menampilkan pesan sukses dari function
    } catch (error) {
      console.error('Error on force restart:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setRestarting(false);
    }
  };

  return (
    <div className="glass-card w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Upload File CSV</h1>
        <button 
          onClick={handleForceRestart} 
          disabled={restarting || loading}
          className="glass-button flex items-center bg-red-600 hover:bg-red-500 disabled:opacity-50"
        >
          <RefreshCw size={20} className="mr-2" />
          <span>{restarting ? 'Restarting...' : 'Force Restart'}</span>
        </button>
      </div>
      
      <div className="space-y-8 flex-grow">
        <div>
          <label htmlFor="rank" className="block text-lg font-medium mb-2">Tentukan Rank</label>
          <input
            type="number"
            id="rank"
            value={rank}
            onChange={(e) => setRank(parseInt(e.target.value, 10))}
            className="w-full max-w-xs p-3 bg-white bg-opacity-20 rounded-lg border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <p className="text-sm text-gray-400 mt-2">
            Tentukan hingga urutan ke berapa link yang di ambil berdasarkan penjualan 30 hari terakhir.
          </p>
        </div>

        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors duration-300 ${isDragActive ? 'border-blue-400 bg-white bg-opacity-20' : 'border-gray-400 hover:border-gray-300'}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center">
            <UploadCloud size={48} className="mb-4 text-gray-300" />
            {
              isDragActive ?
                <p>Lepaskan file di sini ...</p> :
                files.length > 0 ?
                <p>Terpilih: <span className="font-semibold">{files.map(f => f.name).join(', ')}</span></p> :
                <p>Seret & lepas file CSV di sini, atau klik untuk memilih file</p>
            }
          </div>
        </div>
        {message && <p className="text-center mt-4">{message}</p>}
      </div>

      <div className="mt-8">
        <button onClick={handleProcess} disabled={loading || restarting} className="glass-button w-full max-w-xs float-right disabled:opacity-50">
          {loading ? 'Memproses...' : 'Proses'}
        </button>
      </div>
    </div>
  );
}

export default UploadFile;
