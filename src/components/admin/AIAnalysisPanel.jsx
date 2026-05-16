import React, { useState, useEffect } from 'react';
import { FiDownload, FiRefreshCw, FiLoader, FiAlertCircle, FiCheck } from 'react-icons/fi';
import api from '@/api/client';
import AnalysisMarkdown from './AnalysisMarkdown';

const AIAnalysisPanel = ({ eventId, eventName }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const analysisTypes = [
    { id: 'summary', label: 'Summary', icon: '📋' },
    { id: 'insights', label: 'Insights', icon: '💡' },
    { id: 'overview', label: 'Overview', icon: '👁️' },
    { id: 'attendees', label: 'Attendees', icon: '👥' },
    { id: 'custom', label: 'Custom', icon: '🤖' }
  ];

  useEffect(() => {
    fetchAnalysisHistory();
  }, [eventId]);

  const fetchAnalysisHistory = async () => {
    try {
      const response = await api.get(`/ai/history/${eventId}`);
      if (response.data.success) {
        setHistory(response.data.history);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage('');

      const payload = {
        eventId,
        analysisType: activeTab
      };

      if (activeTab === 'custom') {
        if (!customPrompt.trim()) {
          setError('Please enter a question or prompt');
          setLoading(false);
          return;
        }
        payload.customPrompt = customPrompt;
      }

      const response = await api.post('/ai/analyze', payload);

      if (response.data.success) {
        setAnalysis(response.data);
        setSuccessMessage(
          response.data.isCached
            ? 'Analysis retrieved from cache'
            : 'Analysis completed successfully'
        );
        fetchAnalysisHistory();
      } else {
        setError(response.data.message || 'Analysis failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze submissions');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      if (!analysis?.analysisId) {
        setError('No analysis to export. Please run analysis first.');
        return;
      }

      setExporting(true);
      setError(null);

      const response = await api.post(
        '/ai/export',
        {
          analysisId: analysis.analysisId,
          exportFormat: format
        },
        { responseType: 'blob' }
      );

      const contentType = response.headers['content-type'] || '';
      if (contentType.includes('application/json')) {
        const errorText = await response.data.text();
        const errorData = JSON.parse(errorText);
        setError(errorData.message || 'Export failed');
        return;
      }

      const disposition = response.headers['content-disposition'] || '';
      const fileNameMatch = disposition.match(/filename="?([^"]+)"?/i);
      const extension = format === 'md' ? 'md' : format;
      const fileName = fileNameMatch?.[1] || `analysis-${activeTab}.${extension}`;

      const blob = new Blob([response.data], {
        type: contentType || 'application/octet-stream'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setSuccessMessage(`${format.toUpperCase()} exported successfully`);
    } catch (err) {
      let message = `Failed to export as ${format.toUpperCase()}`;
      if (err.response?.data instanceof Blob) {
        try {
          const errorData = JSON.parse(await err.response.data.text());
          message = errorData.message || message;
        } catch {
          // keep default message
        }
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      }
      setError(message);
      console.error('Export error:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleClearCache = async () => {
    try {
      if (!window.confirm('Clear all cached analyses for this event?')) return;

      const response = await api.delete(`/ai/cache/${eventId}`);
      if (response.data.success) {
        setAnalysis(null);
        setHistory([]);
        setSuccessMessage('Cache cleared successfully');
      }
    } catch (err) {
      setError('Failed to clear cache');
      console.error('Clear cache error:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🤖 AI Analysis
        </h2>
        <p className="text-gray-600 text-sm">
          Use AI to analyze submissions from {eventName}
        </p>
      </div>

      {/* Analysis Type Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
        {analysisTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => {
              setActiveTab(type.id);
              setAnalysis(null);
              setCustomPrompt('');
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === type.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type.icon} {type.label}
          </button>
        ))}
      </div>

      {/* Custom Prompt Input */}
      {activeTab === 'custom' && (
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Ask a question about the submissions:
          </label>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="E.g., What are the top 3 issues reported by workers? Which region had the most participation?"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical min-h-24"
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg flex items-start gap-2">
          <FiAlertCircle className="text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-red-700 text-sm">{error}</div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg flex items-start gap-2">
          <FiCheck className="text-green-600 mt-0.5 flex-shrink-0" />
          <div className="text-green-700 text-sm">{successMessage}</div>
        </div>
      )}

      {/* Analyze Button */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
        >
          {loading ? (
            <>
              <FiLoader className="animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <FiRefreshCw />
              Run Analysis
            </>
          )}
        </button>

        {history.length > 0 && (
          <button
            onClick={handleClearCache}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
          >
            Clear Cache
          </button>
        )}
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Analysis Results
              {analysis.isCached && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  Cached
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-600">
              {analysis.submissionCount} submissions analyzed
            </p>
          </div>

          <div className="bg-white rounded p-4 mb-4 max-h-96 overflow-y-auto">
            <AnalysisMarkdown content={analysis.response} />
          </div>

          {/* Export Options */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => handleExport('pdf')}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium disabled:opacity-50"
            >
              {exporting ? (
                <FiLoader className="animate-spin" />
              ) : (
                <FiDownload />
              )}
              Export as PDF
            </button>

            <button
              onClick={() => handleExport('csv')}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 border border-green-200 rounded-lg hover:bg-green-100 transition-colors font-medium disabled:opacity-50"
            >
              {exporting ? (
                <FiLoader className="animate-spin" />
              ) : (
                <FiDownload />
              )}
              Export as CSV
            </button>

            <button
              onClick={() => handleExport('json')}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors font-medium disabled:opacity-50"
            >
              {exporting ? (
                <FiLoader className="animate-spin" />
              ) : (
                <FiDownload />
              )}
              Export as JSON
            </button>

            <button
              onClick={() => handleExport('md')}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors font-medium disabled:opacity-50"
            >
              {exporting ? (
                <FiLoader className="animate-spin" />
              ) : (
                <FiDownload />
              )}
              Export as Markdown
            </button>
          </div>
        </div>
      )}

      {/* Analysis History */}
      {history.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Analysis History</h3>
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item._id}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">
                      {item.analysisType.charAt(0).toUpperCase() + item.analysisType.slice(1)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 bg-white px-2 py-1 rounded">
                    Used {item.usageCount} time{item.usageCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysisPanel;
