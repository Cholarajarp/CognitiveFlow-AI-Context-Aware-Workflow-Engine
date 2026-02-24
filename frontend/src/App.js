import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { Activity, Play, Save, Monitor, Cpu, History, RefreshCw, Circle, FileText, FileDown, Trash2, PlusCircle } from 'lucide-react';

const API_URL = 'http://localhost:8000';

function App() {
  const [context, setContext] = useState({ title: 'Detecting...', app_name: '...' });
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('analyze');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [workflows, setWorkflows] = useState([]);
  const [recording, setRecording] = useState(true);
  const [backendStatus, setBackendStatus] = useState(false);

  useEffect(() => {
    fetchContext();
    const interval = setInterval(fetchContext, 2000);
    fetchWorkflows();
    return () => clearInterval(interval);
  }, []);

  const getErrorMessage = (error, fallback) => {
    const detail = error?.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) return detail.map((item) => item?.msg || JSON.stringify(item)).join('; ');
    return fallback;
  };

  const fetchContext = async () => {
    try {
      const res = await axios.get(`${API_URL}/context`);
      setContext(res.data);
      setBackendStatus(true);
    } catch (err) {
      console.error("Context fetch error", err);
      setBackendStatus(false);
    }
  };

  const fetchWorkflows = async () => {
    try {
      const res = await axios.get(`${API_URL}/workflows`);
      setWorkflows(res.data);
      setBackendStatus(true);
    } catch (err) {
      console.error("Workflow fetch error", err);
      setBackendStatus(false);
    }
  };

  const handleAIAction = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/ai`, { text: input, mode, record: recording });
      const recordingNote = recording ? '' : '\n\n(Workflow not saved because recording is off.)';
      setResponse(`${res.data.response}${recordingNote}`);
      fetchWorkflows();
    } catch (err) {
      setResponse(`Error: ${getErrorMessage(err, "Error processing request.")}`);
    }
    setLoading(false);
  };

  const handleReplay = async (id) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/workflows/replay/${id}`);
      setResponse(`Replay Result:\n${res.data.new_response}`);
    } catch (err) {
      setResponse(`Error: ${getErrorMessage(err, "Error replaying workflow.")}`);
    }
    setLoading(false);
  };

  const handleNewWorkflow = () => {
    setInput('');
    setResponse('');
    setMode('analyze');
    setRecording(true);
  };

  const handleDeleteWorkflow = async (id) => {
    if (!window.confirm('Delete this workflow from history?')) return;

    setLoading(true);
    try {
      await axios.delete(`${API_URL}/workflows/${id}`);
      setWorkflows((prev) => prev.filter((workflow) => workflow.id !== id));
    } catch (err) {
      setResponse(`Error: ${getErrorMessage(err, "Error deleting workflow.")}`);
    }
    setLoading(false);
  };

  const handleDeleteAllWorkflows = async () => {
    if (workflows.length === 0) return;
    if (!window.confirm('Delete all workflow history? This cannot be undone.')) return;

    setLoading(true);
    try {
      await axios.delete(`${API_URL}/workflows`);
      setWorkflows([]);
      setResponse('Workflow history cleared.');
    } catch (err) {
      setResponse(`Error: ${getErrorMessage(err, "Error clearing workflow history.")}`);
    }
    setLoading(false);
  };

  const createExportName = () => {
    const base = (input || 'ai-response').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return (base || 'ai-response').slice(0, 48);
  };

  const exportAsText = () => {
    if (!response.trim()) return;
    const exportContent = [
      'CognitiveFlow AI Response',
      `Generated: ${new Date().toISOString()}`,
      `Mode: ${mode}`,
      '',
      response,
      ''
    ].join('\n');

    const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${createExportName()}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const exportAsPdf = () => {
    if (!response.trim()) return;

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxWidth = pageWidth - margin * 2;

    let y = margin;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('CognitiveFlow AI Response', margin, y);

    y += 20;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);

    y += 14;
    doc.text(`Mode: ${mode}`, margin, y);

    y += 20;
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(response, maxWidth);

    lines.forEach((line) => {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 14;
    });

    doc.save(`${createExportName()}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans selection:bg-blue-500 selection:text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-3">
          <Cpu className="w-8 h-8 text-blue-400" />
          <h1 className="text-xl font-bold tracking-wide">CognitiveFlow <span className="text-xs font-normal text-gray-400 ml-2">v1.0 MVP</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-900 px-4 py-2 rounded-full border border-gray-700">
            <Monitor className="w-4 h-4 text-green-400" />
            <span className="truncate max-w-xs">{context.app_name} - {context.title}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-900 px-3 py-2 rounded-full border border-gray-700" title={backendStatus ? "Backend Connected" : "Backend Disconnected"}>
             <Circle className={`w-3 h-3 fill-current ${backendStatus ? 'text-green-500' : 'text-red-500'}`} />
             <span className="hidden md:inline">{backendStatus ? "Online" : "Offline"}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Panel: Controls */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Input Section */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Workflow Engine
              </h2>
              <select 
                value={mode} 
                onChange={(e) => setMode(e.target.value)}
                className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="analyze">Analyze Context</option>
                <option value="create">Create Content</option>
                <option value="automate">Automate Task</option>
              </select>
            </div>

            <textarea
              className="w-full h-32 bg-gray-900 border border-gray-700 rounded-lg p-4 text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all"
              placeholder="Describe your workflow or ask AI to analyze current context..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />

            <div className="flex gap-4 mt-4">
              <button 
                onClick={handleAIAction}
                disabled={loading}
                className={`flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                AI Action
              </button>
              
              <button 
                onClick={() => setRecording(!recording)}
                disabled={loading}
                className={`px-6 py-2 rounded-lg font-medium border transition-all flex items-center gap-2 ${recording ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-emerald-500/20 border-emerald-500 text-emerald-300 hover:bg-emerald-500/30'}`}
              >
                <Save className="w-5 h-5" />
                {recording ? 'Stop Recording' : 'Start Recording'}
              </button>

              <button
                onClick={handleNewWorkflow}
                disabled={loading}
                className={`px-6 py-2 rounded-lg font-medium border transition-all flex items-center gap-2 ${loading ? 'border-gray-700 bg-gray-800 text-gray-500 cursor-not-allowed' : 'border-gray-600 bg-gray-700 hover:bg-gray-600'}`}
              >
                <PlusCircle className="w-5 h-5" />
                New Workflow
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl min-h-[300px]">
            <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-300">AI Response</h2>
              <div className="flex gap-2">
                <button
                  onClick={exportAsText}
                  disabled={!response.trim()}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border flex items-center gap-1.5 ${response.trim() ? 'border-slate-500 text-slate-200 hover:bg-slate-700/50' : 'border-slate-700 text-slate-500 cursor-not-allowed'}`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Export TXT
                </button>
                <button
                  onClick={exportAsPdf}
                  disabled={!response.trim()}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border flex items-center gap-1.5 ${response.trim() ? 'border-blue-500 text-blue-200 hover:bg-blue-900/30' : 'border-slate-700 text-slate-500 cursor-not-allowed'}`}
                >
                  <FileDown className="w-3.5 h-3.5" />
                  Export PDF
                </button>
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 min-h-[200px] text-gray-300 whitespace-pre-wrap font-mono text-sm border border-gray-700">
              {response || <span className="text-gray-600 italic">Waiting for input...</span>}
            </div>
          </div>
        </div>

        {/* Right Panel: History */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl h-fit">
          <div className="flex items-center justify-between mb-4 gap-2">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <History className="w-5 h-5 text-purple-400" />
              Recent Workflows
            </h2>
            <button
              onClick={handleDeleteAllWorkflows}
              disabled={loading || workflows.length === 0}
              className={`text-xs px-3 py-1.5 rounded-md border flex items-center gap-1.5 ${workflows.length > 0 && !loading ? 'border-red-500 text-red-300 hover:bg-red-900/30' : 'border-gray-600 text-gray-500 cursor-not-allowed'}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All
            </button>
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {workflows.map((wf) => (
              <div key={wf.id} className="bg-gray-900 p-3 rounded-lg border border-gray-700 hover:border-gray-500 transition-colors group">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${wf.mode === 'analyze' ? 'bg-blue-900 text-blue-300' : wf.mode === 'create' ? 'bg-green-900 text-green-300' : 'bg-orange-900 text-orange-300'}`}>
                    {wf.mode.toUpperCase()}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{new Date(wf.timestamp).toLocaleTimeString()}</span>
                    <button
                      onClick={() => handleDeleteWorkflow(wf.id)}
                      title="Delete workflow"
                      disabled={loading}
                      className={`transition-colors ${loading ? 'text-gray-600 cursor-not-allowed' : 'text-red-400 hover:text-red-300'}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-300 line-clamp-2 mb-2">{wf.text}</p>
                <button 
                  onClick={() => handleReplay(wf.id)}
                  disabled={loading}
                  className={`text-xs flex items-center gap-1 transition-opacity ${loading ? 'text-gray-600 cursor-not-allowed opacity-60' : 'text-blue-400 hover:text-blue-300 opacity-0 group-hover:opacity-100'}`}
                >
                  <RefreshCw className="w-3 h-3" /> Replay
                </button>
              </div>
            ))}
            {workflows.length === 0 && (
              <p className="text-gray-500 text-center py-4 text-sm">No history yet.</p>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;
