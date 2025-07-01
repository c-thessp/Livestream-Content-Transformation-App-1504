import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useSupabase } from '../contexts/SupabaseContext';

const { FiUpload, FiFile, FiX, FiLoader, FiCheck } = FiIcons;

const Upload = () => {
  const navigate = useNavigate();
  const { processTranscript, saveProcessedContent } = useSupabase();
  const [selectedFile, setSelectedFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (file && (file.type === 'text/plain' || file.name.endsWith('.md') || file.name.endsWith('.txt'))) {
      setSelectedFile(file);
    } else {
      alert('Please select a .txt or .md file');
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const handleProcess = async () => {
    if (!selectedFile) return;

    setProcessing(true);
    try {
      // Read file content
      const transcriptText = await readFileContent(selectedFile);
      
      // Process transcript through your Edge Function
      const processedData = await processTranscript(transcriptText, selectedFile.name);
      
      // Save processed content to database
      const savedContent = await saveProcessedContent({
        file_name: selectedFile.name,
        original_transcript: transcriptText,
        processed_data: processedData,
        created_at: new Date().toISOString()
      });

      // Navigate to processed content page
      navigate(`/content/${savedContent.id}`);
    } catch (error) {
      console.error('Processing failed:', error);
      alert('Processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Upload Your Transcript</h1>
        <p className="text-lg text-gray-600">
          Transform your raw livestream transcript into polished, authentic content
        </p>
      </motion.div>

      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-8"
      >
        {!selectedFile ? (
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
              dragActive
                ? 'border-rose-400 bg-rose-50'
                : 'border-gray-300 hover:border-rose-400 hover:bg-rose-50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <SafeIcon icon={FiUpload} className="text-6xl text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Drop your transcript file here
            </h3>
            <p className="text-gray-600 mb-6">
              or click to browse for .txt or .md files
            </p>
            <input
              type="file"
              accept=".txt,.md"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-rose-500 to-purple-600 text-white font-semibold rounded-lg hover:from-rose-600 hover:to-purple-700 transition-all duration-200 cursor-pointer"
            >
              <SafeIcon icon={FiFile} className="mr-2" />
              Choose File
            </label>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Selected File Display */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-rose-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <SafeIcon icon={FiFile} className="text-white text-xl" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={removeFile}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                disabled={processing}
              >
                <SafeIcon icon={FiX} className="text-xl" />
              </button>
            </div>

            {/* Process Button */}
            <button
              onClick={handleProcess}
              disabled={processing}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
                processing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {processing ? (
                <div className="flex items-center justify-center">
                  <SafeIcon icon={FiLoader} className="animate-spin mr-2" />
                  Processing your transcript...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <SafeIcon icon={FiCheck} className="mr-2" />
                  Transform Content
                </div>
              )}
            </button>
          </div>
        )}
      </motion.div>

      {/* Info Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="font-semibold text-gray-900 mb-3">What You'll Get</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-center">
              <SafeIcon icon={FiCheck} className="text-green-500 mr-2" />
              Extracted insights & key points
            </li>
            <li className="flex items-center">
              <SafeIcon icon={FiCheck} className="text-green-500 mr-2" />
              Enhanced book chapters
            </li>
            <li className="flex items-center">
              <SafeIcon icon={FiCheck} className="text-green-500 mr-2" />
              3-5 blog posts ready to publish
            </li>
            <li className="flex items-center">
              <SafeIcon icon={FiCheck} className="text-green-500 mr-2" />
              Social media content
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="font-semibold text-gray-900 mb-3">File Requirements</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-center">
              <SafeIcon icon={FiCheck} className="text-green-500 mr-2" />
              .txt or .md format
            </li>
            <li className="flex items-center">
              <SafeIcon icon={FiCheck} className="text-green-500 mr-2" />
              Raw transcript content
            </li>
            <li className="flex items-center">
              <SafeIcon icon={FiCheck} className="text-green-500 mr-2" />
              Any length supported
            </li>
            <li className="flex items-center">
              <SafeIcon icon={FiCheck} className="text-green-500 mr-2" />
              Your authentic voice preserved
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default Upload;