import { useState } from 'react'

function App() {
  const [formData, setFormData] = useState({ title: '', url: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('http://localhost:2000/upload/data/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to upload video')

      setMessage('✅ Video uploaded successfully!')
      setFormData({ title: '', url: '' })
    } catch (error) {
      setMessage('❌ Error: Unable to upload video')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-6">
      <div className="bg-gray-800 shadow-xl rounded-xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">🚀 Upload Your Video</h2>
        
        {message && <div className={`text-center p-3 ${message.includes('Error') ? 'text-red-500' : 'text-green-400'}`}>{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter video title"
              required
              className="peer w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div className="relative">
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="Enter YouTube URL"
              pattern="^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+"
              required
              className="peer w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full font-semibold px-6 py-3 rounded-lg transition-colors duration-300 ${loading ? 'bg-gray-600' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
          >
            {loading ? 'Uploading...' : 'Upload Video'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default App