import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

function App() {
  // Existing video upload state
  const [formData, setFormData] = useState({ title: '', url: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);


  // New image upload state
  const [uploadState, setUploadState] = useState({
    tamil: { file: null, loading: false, message: null },
    english: { file: null, loading: false, message: null }
  });

  // Existing video upload handlers
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        <div className="bg-gray-800 shadow-xl rounded-xl p-8 w-full max-w-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">🚀 Upload Your Video</h2>
          
          {message && (
            <div className={`text-center p-3 ${message.includes('Error') ? 'text-red-500' : 'text-green-400'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter video title"
              required
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3"
            />

            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="Enter YouTube URL"
              pattern="^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+"
              required
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3"
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full px-6 py-3 rounded-lg ${loading ? 'bg-gray-600' : 'bg-blue-500 hover:bg-blue-600'}`}
            >
              {loading ? 'Uploading...' : 'Upload Video'}
            </button>
          </form>
        </div>
      </div>

      {/* Image Upload Sections */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <ImageUploadSection 
          language="tamil"
          uploadState={uploadState}
          setUploadState={setUploadState}
        />
        <ImageUploadSection 
          language="english"
          uploadState={uploadState}
          setUploadState={setUploadState}
        />
        <EventImage />
      </div>
    </div>
  );
}

const ImageUploadSection = ({ language, uploadState, setUploadState }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUploadState(prev => ({
      ...prev,
      [language]: { ...prev[language], file, message: null }
    }));
  };

 const handleImageUpload = async () => {
    if (!uploadState[language].file) {
      setUploadState(prev => ({
        ...prev,
        [language]: { ...prev[language], message: '❌ Please select a file' }
      }));
      return;
    }

    setUploadState(prev => ({
      ...prev,
      [language]: { ...prev[language], loading: true, message: null }
    }));

    const formData = new FormData();
    formData.append('image', uploadState[language].file);

    try {
      const response = await axios.post('https://church-fire.vercel.app/api/image/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });

      if (!response.data) throw new Error('No response from server');

      setUploadState(prev => ({
        ...prev,
        [language]: { file: null, loading: false, message: '✅ Upload successful!' }
      }));
    } catch (error) {
      console.error('Upload error:', error.response?.data || error.message);
      setUploadState(prev => ({
        ...prev,
        [language]: { 
          ...prev[language], 
          loading: false, 
          message: `❌ Upload failed: ${error.response?.data?.message || error.message}`
        }
      }));
    }
};

  return (
    <motion.div
      className="bg-gray-800 shadow-xl rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="text-xl font-bold mb-4 text-center">
        {language === 'tamil' ? '🌟 Upload Tamil Image' : '🌟 Upload English Image'}
      </h3>
      
      <div className="space-y-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-2
                   file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                   file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700
                   hover:file:bg-blue-100"
        />
        
        <motion.button
          onClick={handleImageUpload}
          disabled={uploadState[language].loading}
          className={`w-full px-6 py-3 rounded-lg ${
            uploadState[language].loading 
              ? 'bg-gray-600' 
              : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {uploadState[language].loading ? 'Uploading...' : 'Upload Image'}
        </motion.button>

        {uploadState[language].message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center ${
              uploadState[language].message.includes('❌') 
                ? 'text-red-500' 
                : 'text-green-400'
            }`}
          >
            {uploadState[language].message}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};

const EventImage = () =>{
    const [imageState, setImageState] = useState({
    file: null,
    loading: false,
    message: null
  });

   const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageState(prev => ({
      ...prev,
      file,
      message: null
    }));
  };

const handleImageUpload = async () => {
    if (!imageState.file) {
      setImageState(prev => ({
        ...prev,
        message: '❌ Please select a file'
      }));
      return;
    }

    setImageState(prev => ({
      ...prev,
      loading: true,
      message: null
    }));

    const formData = new FormData();
    formData.append('image', imageState.file);

    try {
      const response = await axios.post('https://church-fire.vercel.app/api/image/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });

      if (!response.data) throw new Error('No response from server');

      setImageState({
        file: null,
        loading: false,
        message: '✅ Upload successful!'
      });
    } catch (error) {
      console.error('Upload error:', error.response?.data || error.message);
      setImageState(prev => ({
        ...prev,
        loading: false,
        message: `❌ Upload failed: ${error.response?.data?.message || error.message}`
      }));
    }
};
return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-lg mx-auto">
        <motion.div
          className="bg-gray-800 shadow-xl rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-xl font-bold mb-4 text-center">
            🌟 Upload Event Image
          </h3>
          
          <div className="space-y-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-2
                       file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                       file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100"
            />

             
            <motion.button
              onClick={handleImageUpload}
              disabled={imageState.loading}
              className={`w-full px-6 py-3 rounded-lg ${
                imageState.loading 
                  ? 'bg-gray-600' 
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {imageState.loading ? 'Uploading...' : 'Upload Image'}
            </motion.button>

            {imageState.message && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-center ${
                  imageState.message.includes('❌') 
                    ? 'text-red-500' 
                    : 'text-green-400'
                }`}
                >
                {imageState.message}
              </motion.p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
)

}



export default App;