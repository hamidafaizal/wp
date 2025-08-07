import { useRegisterSW } from 'virtual:pwa-register/react';

// // Komponen untuk menangani pembaruan PWA
function PwaUpdater() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('Service Worker terdaftar:', r);
    },
    onRegisterError(error) {
      console.log('Error saat registrasi Service Worker:', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (offlineReady || needRefresh) {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4 text-white z-50">
        <div className="mb-2">
          {offlineReady ? (
            <span>Aplikasi siap digunakan offline.</span>
          ) : (
            <span>Versi baru tersedia, muat ulang?</span>
          )}
        </div>
        {needRefresh && (
          <button 
            onClick={() => updateServiceWorker(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1 px-3 rounded-md mr-2"
          >
            Muat Ulang
          </button>
        )}
        <button 
          onClick={close}
          className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded-md"
        >
          Tutup
        </button>
      </div>
    );
  }

  return null;
}

export default PwaUpdater;
