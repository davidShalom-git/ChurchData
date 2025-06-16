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
        <TamilImageUpload 
          uploadState={uploadState}
          setUploadState={setUploadState}
        />
        <EnglishImageUpload 
          uploadState={uploadState}
          setUploadState={setUploadState}
        />
      </div>
      
      {/* Event Image Upload Section */}
      <div className="flex items-center justify-center">
        <EventImageUpload />
      </div>
    </div>
  );
}

const TamilImageUpload = ({ uploadState, setUploadState }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUploadState(prev => ({
      ...prev,
      tamil: { ...prev.tamil, file, message: null }
    }));
  };

  const handleImageUpload = async () => {
    if (!uploadState.tamil.file) {
      setUploadState(prev => ({
        ...prev,
        tamil: { ...prev.tamil, message: '❌ Please select a file' }
      }));
      return;
    }

    // Add file size validation
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (uploadState.tamil.file.size > maxSize) {
      setUploadState(prev => ({
        ...prev,
        tamil: { ...prev.tamil, message: '❌ File must be smaller than 5MB' }
      }));
      return;
    }

    setUploadState(prev => ({
      ...prev,
      tamil: { ...prev.tamil, loading: true, message: null }
    }));

    const formData = new FormData();
    formData.append('image', uploadState.tamil.file);

    try {
      const response = await axios.post('https://church-76ju.vercel.app/api/church/tam', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        },
        timeout: 30000
      });

      if (!response.data) throw new Error('No response from server');

      setUploadState(prev => ({
        ...prev,
        tamil: { file: null, loading: false, message: '✅ Tamil image uploaded successfully!' }
      }));
    } catch (error) {
      console.error('Tamil upload error:', error);

      let errorMessage = '❌ Tamil upload failed: ';
      if (error.message === 'Network Error') {
        errorMessage += 'Network error - Please check connection';
      } else if (error.response?.status === 500) {
        errorMessage += 'Server error - Please try again later';
      } else {
        errorMessage += error.response?.data?.message || error.message;
      }

      setUploadState(prev => ({
        ...prev,
        tamil: { 
          ...prev.tamil, 
          loading: false, 
          message: errorMessage
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
        🌟 Upload Tamil Image
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
          disabled={uploadState.tamil.loading}
          className={`w-full px-6 py-3 rounded-lg ${
            uploadState.tamil.loading 
              ? 'bg-gray-600' 
              : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {uploadState.tamil.loading ? 'Uploading...' : 'Upload Tamil Image'}
        </motion.button>

        {uploadState.tamil.message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center ${
              uploadState.tamil.message.includes('❌') 
                ? 'text-red-500' 
                : 'text-green-400'
            }`}
          >
            {uploadState.tamil.message}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};

const EnglishImageUpload = ({ uploadState, setUploadState }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUploadState(prev => ({
      ...prev,
      english: { ...prev.english, file, message: null }
    }));
  };

  const handleImageUpload = async () => {
    if (!uploadState.english.file) {
      setUploadState(prev => ({
        ...prev,
        english: { ...prev.english, message: '❌ Please select a file' }
      }));
      return;
    }

    // Add file size validation
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (uploadState.english.file.size > maxSize) {
      setUploadState(prev => ({
        ...prev,
        english: { ...prev.english, message: '❌ File must be smaller than 5MB' }
      }));
      return;
    }

    setUploadState(prev => ({
      ...prev,
      english: { ...prev.english, loading: true, message: null }
    }));

    const formData = new FormData();
    formData.append('image', uploadState.english.file);

    try {
      const response = await axios.post('https://church-76ju.vercel.app/api/church/eng', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        },
        timeout: 30000
      });

      if (!response.data) throw new Error('No response from server');

      setUploadState(prev => ({
        ...prev,
        english: { file: null, loading: false, message: '✅ English image uploaded successfully!' }
      }));
    } catch (error) {
      console.error('English upload error:', error);

      let errorMessage = '❌ English upload failed: ';
      if (error.message === 'Network Error') {
        errorMessage += 'Network error - Please check connection';
      } else if (error.response?.status === 500) {
        errorMessage += 'Server error - Please try again later';
      } else {
        errorMessage += error.response?.data?.message || error.message;
      }

      setUploadState(prev => ({
        ...prev,
        english: { 
          ...prev.english, 
          loading: false, 
          message: errorMessage
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
        🌟 Upload English Image
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
          disabled={uploadState.english.loading}
          className={`w-full px-6 py-3 rounded-lg ${
            uploadState.english.loading 
              ? 'bg-gray-600' 
              : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {uploadState.english.loading ? 'Uploading...' : 'Upload English Image'}
        </motion.button>

        {uploadState.english.message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center ${
              uploadState.english.message.includes('❌') 
                ? 'text-red-500' 
                : 'text-green-400'
            }`}
          >
            {uploadState.english.message}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};


const EventImageUpload = () => {
  const [imageState, setImageState] = useState({
    file: null,
    category: 'general',
    description: '',
    loading: false,
    message: null
  });
  const fileInputRef = useRef(null); // To reset file input

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageState(prev => ({
      ...prev,
      file,
      message: null
    }));
  };

  const handleCategoryChange = (e) => {
    setImageState(prev => ({
      ...prev,
      category: e.target.value
    }));
  };

  const handleDescriptionChange = (e) => {
    setImageState(prev => ({
      ...prev,
      description: e.target.value
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

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (imageState.file.size > maxSize) {
      setImageState(prev => ({
        ...prev,
        message: '❌ File must be smaller than 5MB'
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
    formData.append('category', imageState.category);
    formData.append('description', imageState.description);

    try {
      const response = await axios.post('https://church-76ju.vercel.app/api/church/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        },
        timeout: 30000
      });

      if (!response.data) throw new Error('No response from server');

      setImageState({
        file: null,
        category: 'general',
        description: '',
        loading: false,
        message: '✅ Event image uploaded successfully!'
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Event upload error:', error);
      let errorMessage = '❌ Event upload failed: ';
      if (error.code === 'ECONNABORTED') {
        errorMessage += 'Request timed out - Please try again';
      } else if (error.message === 'Network Error') {
        errorMessage += 'Network error - Please check connection';
      } else if (error.response) {
        if (error.response.status === 500) {
          errorMessage += 'Server error - Please try again later';
        } else if (error.response.status === 400) {
          errorMessage += error.response.data.message || 'Invalid file or request';
        } else {
          errorMessage += error.response.data.message || 'Unexpected error';
        }
      } else {
        errorMessage += error.message;
      }

      setImageState(prev => ({
        ...prev,
        loading: false,
        message: errorMessage
      }));
    }
  };

  return (
    <div className="w-full max-w-lg">
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
            ref={fileInputRef}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-2
                     file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                     file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700
                     hover:file:bg-blue-100"
          />

          <select
            value={imageState.category}
            onChange={handleCategoryChange}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-2"
          >
            <option value="general">General</option>
            <option value="tamil">Tamil</option>
            <option value="english">English</option>
            <option value="event">Event</option>
          </select>

          <input
            type="text"
            value={imageState.description}
            onChange={handleDescriptionChange}
            placeholder="Image description (optional)"
            maxLength={500}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-2"
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
            {imageState.loading ? 'Uploading...' : 'Upload Event Image'}
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
  );
};



export default App;