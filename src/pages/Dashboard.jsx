import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useSupabase } from '../contexts/SupabaseContext';

const { FiUpload, FiFileText, FiTrendingUp, FiClock, FiArrowRight } = FiIcons;

const Dashboard = () => {
  const { getProcessingHistory } = useSupabase();
  const [stats, setStats] = useState({
    totalProcessed: 0,
    thisMonth: 0,
    recentFiles: []
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const history = await getProcessingHistory();
        const currentMonth = new Date().getMonth();
        const thisMonth = history.filter(item => 
          new Date(item.created_at).getMonth() === currentMonth
        ).length;

        setStats({
          totalProcessed: history.length,
          thisMonth,
          recentFiles: history.slice(0, 3)
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    loadStats();
  }, [getProcessingHistory]);

  const statCards = [
    {
      title: 'Total Processed',
      value: stats.totalProcessed,
      icon: FiFileText,
      color: 'from-rose-400 to-pink-500'
    },
    {
      title: 'This Month',
      value: stats.thisMonth,
      icon: FiTrendingUp,
      color: 'from-purple-400 to-indigo-500'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Your Content Transformation Hub
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Transform your raw livestream transcripts into polished content that preserves your authentic voice
        </p>
        <Link
          to="/upload"
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-rose-500 to-purple-600 text-white font-semibold rounded-xl hover:from-rose-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <SafeIcon icon={FiUpload} className="mr-2 text-xl" />
          Start Processing
          <SafeIcon icon={FiArrowRight} className="ml-2" />
        </Link>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}>
                <SafeIcon icon={stat.icon} className="text-white text-2xl" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-lg"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Processing</h2>
          <Link
            to="/history"
            className="text-rose-600 hover:text-rose-700 font-medium flex items-center"
          >
            View All
            <SafeIcon icon={FiArrowRight} className="ml-1" />
          </Link>
        </div>

        {stats.recentFiles.length > 0 ? (
          <div className="space-y-4">
            {stats.recentFiles.map((file) => (
              <Link
                key={file.id}
                to={`/content/${file.id}`}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-rose-400 to-purple-500 rounded-lg flex items-center justify-center">
                    <SafeIcon icon={FiFileText} className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{file.file_name}</p>
                    <p className="text-sm text-gray-500">
                      Processed {new Date(file.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <SafeIcon icon={FiArrowRight} className="text-gray-400" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <SafeIcon icon={FiClock} className="text-4xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No processing history yet</p>
            <p className="text-sm text-gray-400 mt-1">Upload your first transcript to get started</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;