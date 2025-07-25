import { useState } from 'react';

function App() {
  const [formData, setFormData] = useState({ title: '', url: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [uploadState, setUploadState] = useState({
    tamil: { file: null, loading: false, message: null },
    english: { file: null, loading: false, message: null },
    audio: { file: null, loading: false, message: null }
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('https://church-data.vercel.app/upload/data/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to upload video');

      setMessage('✅ Video uploaded successfully!');
      setFormData({ title: '', url: '' });
    } catch (error) {
      setMessage('❌ Error: Unable to upload video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 space-y-8">
      {/* Video Upload Section */}
      <div className="flex items-center justify-center">
        <div className="bg-gray-800 shadow-xl rounded-xl p-8 w-full max-w-lg transition-all duration-300 hover:shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 text-center">🎥 Upload Video</h2>
          {message && (
            <div className={`text-center p-3 rounded-lg mb-4 transition-all duration-300 ${message.includes('Error') ? 'text-red-500 bg-red-500/10' : 'text-green-400 bg-green-400/10'}`}>
              {message}
            </div>
          )}
          <div className="space-y-6">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter video title"
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 focus:border-blue-500 focus:outline-none transition-colors"
            />
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="Enter YouTube URL"
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 focus:border-blue-500 focus:outline-none transition-colors"
            />
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.title || !formData.url}
              className={`w-full px-6 py-3 rounded-lg transition-all duration-300 ${loading || !formData.title || !formData.url ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 hover:scale-105'}`}
            >
              {loading ? 'Uploading...' : 'Upload Video'}
            </button>
          </div>
        </div>
      </div>

      {/* Upload Grid: Images and Audio */}
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <UploadBlock
          label="📷 Tamil Image"
          endpoint="tam"
          uploadState={uploadState}
          setUploadState={setUploadState}
          type="image"
          lang="tamil"
        />
        <UploadBlock
          label="📷 English Image"
          endpoint="eng"
          uploadState={uploadState}
          setUploadState={setUploadState}
          type="image"
          lang="english"
        />
        <AudioUploadBlock
          label="🎵 Audio File"
          uploadState={uploadState}
          setUploadState={setUploadState}
          lang="audio"
        />
      </div>
    </div>
  );
}

const UploadBlock = ({ label, endpoint, uploadState, setUploadState, type, lang }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUploadState(prev => ({
      ...prev,
      [lang]: { ...prev[lang], file, message: null }
    }));
  };

  const handleUpload = async () => {
    const file = uploadState[lang].file;
    if (!file) {
      return setUploadState(prev => ({
        ...prev,
        [lang]: { ...prev[lang], message: '❌ Please select a file' }
      }));
    }

    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      return setUploadState(prev => ({
        ...prev,
        [lang]: { ...prev[lang], message: '❌ File must be < 20MB' }
      }));
    }

    setUploadState(prev => ({
      ...prev,
      [lang]: { ...prev[lang], loading: true, message: null }
    }));

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`https://church-76ju.vercel.app/api/church/${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setUploadState(prev => ({
        ...prev,
        [lang]: { file: null, loading: false, message: `✅ ${label} uploaded successfully!` }
      }));

      // Clear file input
      const fileInput = document.querySelector(`input[type="file"][accept="image/*"]`);
      if (fileInput) fileInput.value = '';

    } catch (error) {
      let message = `❌ ${label} upload failed: `;
      if (error.message === 'Network Error') message += 'Network error';
      else if (error.message.includes('500')) message += 'Server error';
      else message += error.message;

      setUploadState(prev => ({
        ...prev,
        [lang]: { ...prev[lang], loading: false, message }
      }));
    }
  };

  const current = uploadState[lang];

  return (
    <div className="bg-gray-800 shadow-xl rounded-xl p-6 space-y-4 transition-all duration-300 hover:shadow-2xl hover:scale-105">
      <h3 className="text-lg font-bold text-center">{label}</h3>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:border-blue-500 focus:outline-none transition-colors"
      />
      <button
        onClick={handleUpload}
        disabled={current.loading}
        className={`w-full px-6 py-3 rounded-lg transition-all duration-300 ${current.loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 hover:scale-105'}`}
      >
        {current.loading ? 'Uploading...' : `Upload ${label}`}
      </button>
      {current.message && (
        <p className={`text-center transition-all duration-300 ${current.message.includes('❌') ? 'text-red-500' : 'text-green-400'}`}>
          {current.message}
        </p>
      )}
    </div>
  );
};

const AudioUploadBlock = ({ label, uploadState, setUploadState, lang }) => {
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUploadState(prev => ({
      ...prev,
      [lang]: { ...prev[lang], file, message: null }
    }));
  };

  const handleUpload = async () => {
    const file = uploadState[lang].file;
    if (!file) {
      return setUploadState(prev => ({
        ...prev,
        [lang]: { ...prev[lang], message: '❌ Please select an audio file' }
      }));
    }

    // Validate audio file type
    if (!file.type.startsWith('audio/')) {
      return setUploadState(prev => ({
        ...prev,
        [lang]: { ...prev[lang], message: '❌ Please select a valid audio file' }
      }));
    }

    // Updated size limit to match backend (10MB for database storage)
    const maxSize = 10 * 1024 * 1024; // 10MB for database storage
    if (file.size > maxSize) {
      return setUploadState(prev => ({
        ...prev,
        [lang]: { ...prev[lang], message: '❌ Audio file must be < 10MB for database storage' }
      }));
    }

    setUploadState(prev => ({
      ...prev,
      [lang]: { ...prev[lang], loading: true, message: null }
    }));

    try {
      // Convert file to base64
      const base64Data = await convertToBase64(file);

      // Use the correct API endpoint
      const response = await fetch('https://church-76ju.vercel.app/api/audio/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioData: base64Data,
          filename: file.name,
          originalName: file.name,
          mimetype: file.type
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setUploadState(prev => ({
          ...prev,
          [lang]: { file: null, loading: false, message: `✅ ${label} uploaded successfully!` }
        }));
        
        // Clear file input
        const fileInput = document.querySelector(`input[type="file"][accept="audio/*"]`);
        if (fileInput) fileInput.value = '';
      } else {
        setUploadState(prev => ({
          ...prev,
          [lang]: { ...prev[lang], loading: false, message: `❌ Upload failed: ${result.error}` }
        }));
      }
    } catch (error) {
      let message = `❌ ${label} upload failed: `;
      if (error.message === 'Network Error') message += 'Network error';
      else message += error.message;

      setUploadState(prev => ({
        ...prev,
        [lang]: { ...prev[lang], loading: false, message }
      }));
    }
  };

  const current = uploadState[lang];

  return (
    <div className="bg-gray-800 shadow-xl rounded-xl p-6 space-y-4 transition-all duration-300 hover:shadow-2xl hover:scale-105">
      <h3 className="text-lg font-bold text-center">{label}</h3>
      
      {/* File Info Display */}
      {current.file && (
        <div className="bg-gray-700 rounded-lg p-3 text-sm transition-all duration-300">
          <p className="font-medium text-white truncate">{current.file.name}</p>
          <div className="flex justify-between text-gray-400 mt-1">
            <span>{formatFileSize(current.file.size)}</span>
            <span>{current.file.type}</span>
          </div>
          {current.file.size > 10 * 1024 * 1024 && (
            <p className="text-red-400 text-xs mt-1">⚠️ File too large (max 10MB)</p>
          )}
        </div>
      )}

      <input
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 focus:border-green-500 focus:outline-none transition-colors"
      />
      
      <button
        onClick={handleUpload}
        disabled={current.loading || (current.file && current.file.size > 10 * 1024 * 1024)}
        className={`w-full px-6 py-3 rounded-lg transition-all duration-300 ${
          current.loading || (current.file && current.file.size > 10 * 1024 * 1024)
            ? 'bg-gray-600 cursor-not-allowed' 
            : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 hover:scale-105'
        }`}
      >
        {current.loading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Uploading...</span>
          </div>
        ) : (
          `Upload ${label}`
        )}
      </button>
      
      {current.message && (
        <p className={`text-center transition-all duration-300 ${current.message.includes('❌') ? 'text-red-500' : 'text-green-400'}`}>
          {current.message}
        </p>
      )}
    </div>
  );
};

export default App;