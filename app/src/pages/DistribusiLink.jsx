import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Send, Share2, Save } from 'lucide-react';

// // Komponen terpisah untuk satu card batch
function BatchCard({ batch, onCapacityChange, onSend, phones, onPhoneChange }) {
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    setIsSending(true);
    await onSend(batch.id);
    setIsSending(false);
  };

  return (
    <div className="bg-white bg-opacity-10 p-6 rounded-xl border border-white border-opacity-20">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Batch {batch.batch_number}</h3>
        <button onClick={handleSend} disabled={isSending || !batch.selected_phone_id || batch.links?.length === 0} className="glass-button flex items-center text-sm py-1 px-3 disabled:opacity-50 disabled:cursor-not-allowed">
          {isSending ? <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div> : <Send size={16} className="mr-2" />}
          {isSending ? 'Mengirim...' : 'Kirim'}
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor={`capacity-${batch.batch_number}`} className="block text-sm font-medium mb-1">Kapasitas Batch</label>
            <input
              type="number"
              id={`capacity-${batch.batch_number}`}
              value={batch.capacity}
              onChange={(e) => onCapacityChange(batch.batch_number, parseInt(e.target.value, 10) || 0)}
              className="w-full p-2 bg-white bg-opacity-20 rounded-lg border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label htmlFor={`phone-${batch.batch_number}`} className="block text-sm font-medium mb-1">Kirim ke HP</label>
            <select
              id={`phone-${batch.batch_number}`}
              value={batch.selected_phone_id || ''}
              onChange={(e) => onPhoneChange(batch.batch_number, e.target.value)}
              className="w-full p-2 bg-gray-700 bg-opacity-50 rounded-lg border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="" disabled>Pilih HP</option>
              {phones.map(phone => (
                <option key={phone.id} value={phone.id}>{phone.phone_name}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium mb-2">Jumlah Link: <span className="font-semibold">{batch.links?.length || 0}</span></p>
          <div className="bg-black bg-opacity-20 p-3 rounded-lg h-32 overflow-y-auto">
            {batch.links && batch.links.length > 0 ? (
              batch.links.map((link, index) => (
                <div key={index} className="flex text-xs text-gray-300">
                  <span className="w-8 text-gray-500">{index + 1}.</span>
                  <p className="truncate flex-1">{link}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400">Batch kosong</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// // Komponen utama halaman Distribusi Link
function DistribusiLink() {
  const [batchCount, setBatchCount] = useState(1);
  const [batches, setBatches] = useState([]);
  const [phones, setPhones] = useState([]); // // State untuk menyimpan daftar HP
  const [availableLinkCount, setAvailableLinkCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setMessage('');
    console.log('Fetching data from Supabase...'); // // Log untuk debugging
    try {
      // // Ambil daftar HP yang terdaftar
      const { data: phoneData, error: phoneError } = await supabase.from('registered_phones').select('id, phone_name');
      if (phoneError) throw phoneError;
      setPhones(phoneData || []);
      console.log('Fetched phones:', phoneData); // // Log untuk debugging

      // // Ambil konfigurasi batch yang ada
      const { data: batchData, error: batchError } = await supabase.from('link_batches').select('*').order('batch_number');
      if (batchError) throw batchError;
      
      const { count, error: countError } = await supabase.from('processed_links').select('*', { count: 'exact', head: true });
      if (countError) throw countError;

      console.log('Fetched batches:', batchData); // // Log untuk debugging
      console.log('Available links count:', count); // // Log untuk debugging

      setBatches(batchData || []);
      setBatchCount(batchData?.length > 0 ? batchData.length : 1);
      setAvailableLinkCount(count || 0);
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBatchCountChange = (count) => {
    const newCount = Math.max(1, count);
    setBatchCount(newCount);

    setBatches(currentBatches => {
      const newBatchArray = [];
      for (let i = 1; i <= newCount; i++) {
        const existing = currentBatches.find(b => b.batch_number === i);
        newBatchArray.push(existing || { batch_number: i, capacity: 100, links: [], selected_phone_id: null });
      }
      return newBatchArray;
    });
  };
  
  const handleCapacityChange = (batchNumber, newCapacity) => {
    setBatches(currentBatches =>
      currentBatches.map(b =>
        b.batch_number === batchNumber ? { ...b, capacity: newCapacity } : b
      )
    );
  };

  const handlePhoneChange = (batchNumber, phoneId) => {
    console.log(`Batch ${batchNumber} changed to phone ID: ${phoneId}`); // // Log untuk debugging
    setBatches(currentBatches =>
      currentBatches.map(b =>
        b.batch_number === batchNumber ? { ...b, selected_phone_id: parseInt(phoneId, 10) } : b
      )
    );
  };

  const handleSaveConfig = async () => {
    setLoading(true);
    setMessage('Menyimpan konfigurasi...');
    console.log('Saving batch configuration:', batches); // // Log untuk debugging
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error: deleteError } = await supabase.from('link_batches').delete().match({ user_id: user.id });
      if (deleteError) throw deleteError;

      const newConfig = batches.map(b => ({
        user_id: user.id,
        batch_number: b.batch_number,
        capacity: b.capacity,
        links: b.links || [],
        selected_phone_id: b.selected_phone_id
      }));

      const { error: insertError } = await supabase.from('link_batches').insert(newConfig);
      if (insertError) throw insertError;

      setMessage('Konfigurasi berhasil disimpan!');
      await fetchData();
    } catch (error) {
      console.error('Error saving config:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    setLoading(true);
    setMessage('Memulai proses distribusi...');
    console.log('Invoking distribute_links_rpc function...'); // // Log untuk debugging
    try {
      const { data, error } = await supabase.rpc('distribute_links_rpc');
      
      if (error) throw error;

      console.log('RPC function response:', data); // // Log untuk debugging
      setMessage(data);
      await fetchData();
    } catch (error) {
      console.error('Error invoking RPC function:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendBatch = async (batchId) => {
    setMessage(`Mengirim Batch ID: ${batchId}...`);
    console.log(`Invoking send_batch_and_cache_links for batch ID: ${batchId}`); // // Log untuk debugging
    try {
      const { data, error } = await supabase.rpc('send_batch_and_cache_links', { p_batch_id: batchId });
      if (error) throw error;

      console.log('Send batch response:', data); // // Log untuk debugging
      setMessage(data);
      await fetchData();
    } catch (error) {
      console.error('Error sending batch:', error);
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="glass-card w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Distribusi Link</h1>
        <div className="flex gap-4">
          <button onClick={handleSaveConfig} disabled={loading} className="glass-button flex items-center">
            <Save size={20} className="mr-2" />
            <span>{loading ? 'Menyimpan...' : 'Simpan Konfigurasi'}</span>
          </button>
          <button onClick={handleShare} disabled={loading} className="glass-button flex items-center bg-blue-600 hover:bg-blue-500">
            <Share2 size={20} className="mr-2" />
            <span>{loading ? 'Memproses...' : 'Bagikan Link'}</span>
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        <label htmlFor="batch-count" className="block text-lg font-medium mb-2">Tentukan Jumlah Batch</label>
        <input
          type="number"
          id="batch-count"
          value={batchCount}
          onChange={(e) => handleBatchCountChange(parseInt(e.target.value, 10) || 1)}
          min="1"
          className="w-full max-w-xs p-3 bg-white bg-opacity-20 rounded-lg border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div className="mb-6 bg-white bg-opacity-5 p-4 rounded-lg">
        <p className="text-lg">Link Tersedia untuk Didistribusikan: <span className="font-bold text-xl text-green-400">{availableLinkCount}</span></p>
      </div>
      
      {message && <p className="text-center mb-4">{message}</p>}

      <div className="flex-grow space-y-6 overflow-y-auto pr-2">
        {batches.map((batch) => (
          <BatchCard 
            key={batch.id || batch.batch_number} 
            batch={batch} 
            onCapacityChange={handleCapacityChange}
            onSend={handleSendBatch}
            phones={phones}
            onPhoneChange={handlePhoneChange}
          />
        ))}
      </div>
    </div>
  );
}

export default DistribusiLink;
