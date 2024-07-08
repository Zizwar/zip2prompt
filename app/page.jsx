"use client";
import React, { useState } from 'react';
import { FolderTree, File, Upload, Download, Copy, CheckCircle } from 'lucide-react';

const FileTree = ({ structure, onSelect, selectedFiles }) => {
  const renderTree = (node) => (
    <ul className="pl-4">
      {Object.entries(node).map(([key, value]) => (
        <li key={key} className="my-2">
          {typeof value === 'object' ? (
            <div className="flex items-center">
              <FolderTree className="mr-2 text-yellow-500" size={18} />
              <span className="font-semibold">{key}</span>
            </div>
          ) : (
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedFiles.includes(value)}
                onChange={() => onSelect(value)}
                className="mr-2"
              />
              <File className="mr-2 text-blue-500" size={18} />
              <span>{key}</span>
            </div>
          )}
          {typeof value === 'object' && renderTree(value)}
        </li>
      ))}
    </ul>
  );

  return renderTree(structure);
};

const ZipExtractor = () => {
  const [fileStructure, setFileStructure] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [mergedContent, setMergedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('zipFile', file);

    try {
      const response = await fetch('http://localhost:3001/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setFileStructure(data.structure);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (filePath) => {
    setSelectedFiles(prev => 
      prev.includes(filePath)
        ? prev.filter(f => f !== filePath)
        : [...prev, filePath]
    );
  };

  const handleExtract = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: selectedFiles }),
      });
      const data = await response.json();
      setMergedContent(data.content);
    } catch (error) {
      console.error('Error extracting files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(mergedContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">ZipInsight</h1>
          <p className="text-xl text-gray-600">استكشف وادمج محتويات ملفات ZIP بسهولة</p>
        </div>
        
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ارفع ملف ZIP
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                    <span>حدد ملف ZIP</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileUpload} accept=".zip" />
                  </label>
                </div>
                <p className="text-xs text-gray-500">ZIP حتى 10 ميجابايت</p>
              </div>
            </div>
          </div>

          {isLoading && (
            <div className="text-center py-4">
              <div className="spinner"></div>
              <p className="mt-2 text-sm text-gray-600">جاري المعالجة...</p>
            </div>
          )}

          {fileStructure && (
            <div className="grid md:grid-cols-2 gap-6 p-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">هيكل الملفات</h2>
                <div className="border rounded-md p-4 bg-gray-50">
                  <FileTree 
                    structure={fileStructure} 
                    onSelect={handleSelect}
                    selectedFiles={selectedFiles}
                  />
                </div>
                <button 
                  onClick={handleExtract}
                  className="mt-4 w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  استخراج الملفات المحددة
                </button>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">المحتوى المدمج</h2>
                <textarea 
                  value={mergedContent}
                  readOnly
                  className="w-full h-64 p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
                {mergedContent && (
                  <div className="mt-4 flex space-x-2">
                    <button 
                      onClick={() => {
                        const blob = new Blob([mergedContent], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'merged_content.txt';
                        a.click();
                      }}
                      className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      <Download className="inline mr-2" size={18} />
                      تنزيل المحتوى
                    </button>
                    <button 
                      onClick={handleCopy}
                      className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      {copied ? (
                        <><CheckCircle className="inline mr-2" size={18} /> تم النسخ</>
                      ) : (
                        <><Copy className="inline mr-2" size={18} /> نسخ المحتوى</>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZipExtractor;