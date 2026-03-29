import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import FileUpload from '../components/FileUpload';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CreatorPortfolioPage = () => {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    media_url: '',
    project_type: '',
    platform: ''
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchPortfolio();
    }
  }, [user]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        withCredentials: true
      });
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      navigate('/login');
    }
  };

  const fetchPortfolio = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/creators/${user.user_id}/portfolio`,
        { withCredentials: true }
      );
      setPortfolio(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const mediaUrl = uploadedFiles.length > 0 
      ? uploadedFiles[0].url 
      : formData.media_url;

    if (!mediaUrl) {
      alert('Please upload an image or provide a URL');
      return;
    }

    try {
      await axios.post(
        `${BACKEND_URL}/api/creators/${user.user_id}/portfolio`,
        {
          title: formData.title,
          description: formData.description,
          media_url: mediaUrl,
          project_type: formData.project_type,
          platform: formData.platform
        },
        { withCredentials: true }
      );

      alert('Portfolio item added successfully!');
      setShowAddForm(false);
      setFormData({
        title: '',
        description: '',
        media_url: '',
        project_type: '',
        platform: ''
      });
      setUploadedFiles([]);
      fetchPortfolio();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to add portfolio item');
    }
  };

  const handleDelete = async (portfolioId) => {
    if (!window.confirm('Delete this portfolio item?')) return;

    try {
      await axios.delete(
        `${BACKEND_URL}/api/creators/${user.user_id}/portfolio/${portfolioId}`,
        { withCredentials: true }
      );
      alert('Portfolio item deleted');
      fetchPortfolio();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to delete portfolio item');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <p className="text-xl font-bold">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-2">
              My Portfolio
            </h1>
            <p className="text-base sm:text-lg text-[#4A4A4A] font-medium">
              Showcase your best work
            </p>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-[#A78BFA] hover:bg-[#9333EA] text-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Work
          </Button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-black mb-6">Add Portfolio Item</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block font-bold mb-2">Title *</label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Instagram Campaign for Fashion Brand"
                  className="border-2 border-[#0A0A0A]"
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Description *</label>
                <Textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe this project, your role, and the results..."
                  className="border-2 border-[#0A0A0A] min-h-[100px]"
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Upload Image *</label>
                <FileUpload
                  onFilesSelected={setUploadedFiles}
                  maxFiles={1}
                  maxSizeMB={5}
                  acceptedTypes={['image/*']}
                  existingFiles={uploadedFiles}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500 font-bold">OR</span>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-2">Image URL</label>
                <Input
                  value={formData.media_url}
                  onChange={(e) => setFormData({...formData, media_url: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                  className="border-2 border-[#0A0A0A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-2">Project Type</label>
                  <Input
                    value={formData.project_type}
                    onChange={(e) => setFormData({...formData, project_type: e.target.value})}
                    placeholder="Sponsored Post, Story, Reel..."
                    className="border-2 border-[#0A0A0A]"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">Platform</label>
                  <Input
                    value={formData.platform}
                    onChange={(e) => setFormData({...formData, platform: e.target.value})}
                    placeholder="Instagram, YouTube..."
                    className="border-2 border-[#0A0A0A]"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="bg-[#B4F8C8] hover:bg-green-400 text-black border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
                >
                  Add to Portfolio
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({
                      title: '',
                      description: '',
                      media_url: '',
                      project_type: '',
                      platform: ''
                    });
                    setUploadedFiles([]);
                  }}
                  variant="outline"
                  className="border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Portfolio Grid */}
        {portfolio.length === 0 ? (
          <div className="bg-white border-2 border-[#0A0A0A] rounded-xl p-12 text-center">
            <ImageIcon size={64} className="mx-auto mb-4 text-gray-300" />
            <p className="text-xl font-bold text-gray-600 mb-2">No portfolio items yet</p>
            <p className="text-gray-500">Add your first work to showcase your talent</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolio.map((item) => (
              <div
                key={item.portfolio_id}
                className="bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl overflow-hidden group"
              >
                {/* Image */}
                <div className="aspect-video bg-gray-200 overflow-hidden">
                  <img
                    src={item.media_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-black text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {item.project_type && (
                      <span className="bg-purple-100 text-purple-800 border border-purple-800 px-2 py-1 rounded text-xs font-bold">
                        {item.project_type}
                      </span>
                    )}
                    {item.platform && (
                      <span className="bg-blue-100 text-blue-800 border border-blue-800 px-2 py-1 rounded text-xs font-bold">
                        {item.platform}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => window.open(item.media_url, '_blank')}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-2 border-[#0A0A0A] text-xs font-bold"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button
                      onClick={() => handleDelete(item.portfolio_id)}
                      variant="outline"
                      size="sm"
                      className="border-2 border-red-500 text-red-600 hover:bg-red-50 text-xs font-bold"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorPortfolioPage;
