import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useSupabase } from '../contexts/SupabaseContext';

const { FiDownload, FiCopy, FiEye, FiBookOpen, FiEdit, FiShare2, FiCheck } = FiIcons;

const ProcessedContent = () => {
  const { id } = useParams();
  const { getProcessedContent } = useSupabase();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('insights');
  const [copiedSection, setCopiedSection] = useState(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await getProcessedContent(id);
        setContent(data);
      } catch (error) {
        console.error('Error loading content:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [id, getProcessedContent]);

  const copyToClipboard = async (text, section) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const downloadContent = (text, filename) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'insights', label: 'Insights', icon: FiEye },
    { id: 'chapters', label: 'Book Chapters', icon: FiBookOpen },
    { id: 'blogs', label: 'Blog Posts', icon: FiEdit },
    { id: 'social', label: 'Social Media', icon: FiShare2 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Content not found</p>
      </div>
    );
  }

  const processedData = content.processed_data || {};

  const renderContentSection = (sectionData, sectionKey) => {
    if (!sectionData) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No content available for this section</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {Array.isArray(sectionData) ? (
          sectionData.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.title || `${sectionKey} ${index + 1}`}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => copyToClipboard(item.content || item, `${sectionKey}-${index}`)}
                    className="p-2 text-gray-500 hover:text-rose-600 transition-colors"
                  >
                    <SafeIcon 
                      icon={copiedSection === `${sectionKey}-${index}` ? FiCheck : FiCopy} 
                      className="text-lg" 
                    />
                  </button>
                  <button
                    onClick={() => downloadContent(
                      item.content || item, 
                      `${content.file_name}-${sectionKey}-${index + 1}.txt`
                    )}
                    className="p-2 text-gray-500 hover:text-rose-600 transition-colors"
                  >
                    <SafeIcon icon={FiDownload} className="text-lg" />
                  </button>
                </div>
              </div>
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-gray-700 font-sans">
                  {item.content || item}
                </pre>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 capitalize">{sectionKey}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => copyToClipboard(sectionData, sectionKey)}
                  className="p-2 text-gray-500 hover:text-rose-600 transition-colors"
                >
                  <SafeIcon 
                    icon={copiedSection === sectionKey ? FiCheck : FiCopy} 
                    className="text-lg" 
                  />
                </button>
                <button
                  onClick={() => downloadContent(sectionData, `${content.file_name}-${sectionKey}.txt`)}
                  className="p-2 text-gray-500 hover:text-rose-600 transition-colors"
                >
                  <SafeIcon icon={FiDownload} className="text-lg" />
                </button>
              </div>
            </div>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-gray-700 font-sans">
                {sectionData}
              </pre>
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{content.file_name}</h1>
            <p className="text-gray-600 mt-1">
              Processed on {new Date(content.created_at).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={() => downloadContent(
              JSON.stringify(processedData, null, 2),
              `${content.file_name}-complete.json`
            )}
            className="px-4 py-2 bg-gradient-to-r from-rose-500 to-purple-600 text-white font-semibold rounded-lg hover:from-rose-600 hover:to-purple-700 transition-all duration-200"
          >
            <SafeIcon icon={FiDownload} className="mr-2" />
            Download All
          </button>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative py-4 px-1 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-rose-600 border-b-2 border-rose-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={tab.icon} />
                  <span>{tab.label}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'insights' && renderContentSection(processedData.insights, 'insights')}
          {activeTab === 'chapters' && renderContentSection(processedData.chapters, 'chapters')}
          {activeTab === 'blogs' && renderContentSection(processedData.blogs, 'blogs')}
          {activeTab === 'social' && renderContentSection(processedData.social, 'social')}
        </div>
      </motion.div>
    </div>
  );
};

export default ProcessedContent;