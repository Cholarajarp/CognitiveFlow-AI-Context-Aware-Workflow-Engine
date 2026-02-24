import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Play, Save, Monitor, Cpu, History, RefreshCw, Zap, Command, Layers } from 'lucide-react';

const API_URL = 'http://localhost:8000';

function App() {
  const [context, setContext] = useState({ title: 'Detecting...', app_name: '...' });
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('analyze');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [workflows, setWorkflows] = useState([]);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const interval = setInterval(fetchContext, 2000);
    fetchWorkflows();
    return () => clearInterval(interval);
  }, []);

  const fetchContext = async () => {
    try {
      const res = await axios.get(`${API_URL}/context`);
      setContext(res.data);
      setError(null);
    } catch (err) {
      console.error("Context fetch error", err);
      // Don't set error state here to avoid flashing UI on minor glitches
    }
  };

  const fetchWorkflows = async () => {
    try {
      const res = await axios.get(`${API_URL}/workflows`);
      setWorkflows(res.data);
    } catch (err) {
      console.error("Workflow fetch error", err);
    }
  };

  const handleAIAction = async () => {
    if (!input) return;
    setLoading(true);
    setResponse('');
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/ai`, { text: input, mode });
      setResponse(res.data.response);
      fetchWorkflows();
    } catch (err) {
      setError("Failed to process request. Please check backend connection.");
      setResponse("Error: Could not connect to AI Engine.");
    }
    setLoading(false);
  };

  const handleReplay = async (id) => {
    setLoading(true);
    setResponse('Replaying workflow...');
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/workflows/replay/${id}`);
      setResponse(`[REPLAY RESULT]\n${res.data.new_response}`);
    } catch (err) {
      setError("Failed to replay workflow.");
      setResponse("Error during replay.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen text-gray-100 font-sans selection:bg-blue-500/30 selection:text-blue-200 flex flex-col">
      {/* Header */}
      <header className="bg-gray-900/90 backdrop-blur-md border-b border-gray-800 p-4 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="p-2 bg-blue-600/10 rounded-lg group-hover:bg-blue-600/20 transition-colors">
              <Cpu className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                CognitiveFlow
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-900/50 text-blue-300 border border-blue-800/50">PRO</span>
              </h1>
              <p className="text-xs text-gray-500 font-medium">Context-Aware Workflow Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border transition-all duration-300 ${context.app_name !== 'Unknown' ? 'bg-gray-800/50 border-gray-700/50' : 'bg-red-900/10 border-red-900/20'}`}>
              <Monitor className={`w-4 h-4 ${context.app_name !== 'Unknown' ? 'text-emerald-400' : 'text-red-400'}`} />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Active Context</span>
                <span className="text-sm font-medium text-gray-200 truncate max-w-[200px]">
                  {context.app_name}
                  <span className="text-gray-500 mx-1">•</span>
                  {context.title}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 fade-in">
        
        {/* Main Interface */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Controls Card */}
          <div className="card p-1">
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-blue-400 font-semibold">
                  <Activity className="w-5 h-5" />
                  <h2>Command Center</h2>
                </div>
                <div className="relative">
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="appearance-none bg-gray-900 border border-gray-700 rounded-md py-1.5 pl-3 pr-8 text-sm focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer hover:border-gray-600 transition-colors"
                  >
                    <option value="analyze">Analyze Context</option>
                    <option value="create">Create Content</option>
                    <option value="automate">Automate Task</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <Layers className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="relative group">
                <textarea
                  className="input-base w-full h-32 p-4 text-base leading-relaxed resize-none"
                  placeholder="Describe your workflow or ask AI to analyze current context..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                   <span className="text-xs text-gray-600 font-mono">{input.length} chars</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAIAction}
                  disabled={loading || !input}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 group"
                >
                  {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 group-hover:text-yellow-300 transition-colors" />}
                  <span className="tracking-wide">{loading ? 'Processing...' : 'Execute Workflow'}</span>
                </button>

                <button
                  onClick={() => setRecording(!recording)}
                  className={`btn-secondary w-40 flex items-center justify-center gap-2 ${recording ? 'bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500/20' : ''}`}
                >
                  <div className={`w-2 h-2 rounded-full ${recording ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
                  {recording ? 'Recording' : 'Record'}
                </button>
              </div>
            </div>

            {/* Progress Bar (Fake for visual) */}
            {loading && (
              <div className="h-0.5 w-full bg-gray-800 overflow-hidden rounded-b-xl">
                <div className="h-full bg-blue-500 animate-[loading_1.5s_ease-in-out_infinite] w-1/3"></div>
              </div>
            )}
          </div>

          {/* Response Area */}
          <div className="card min-h-[400px] flex flex-col">
            <div className="p-4 border-b border-gray-700/50 flex justify-between items-center bg-gray-800/50 rounded-t-xl">
              <h3 className="font-semibold text-gray-300 flex items-center gap-2">
                <Command className="w-4 h-4 text-purple-400" />
                System Output
              </h3>
              {response && (
                 <button onClick={() => {navigator.clipboard.writeText(response)}} className="text-xs text-gray-500 hover:text-white transition-colors">
                   Copy Output
                 </button>
              )}
            </div>
            <div className="p-6 flex-1 font-mono text-sm leading-relaxed text-gray-300 overflow-y-auto max-h-[500px] custom-scrollbar">
              {error ? (
                <div className="text-red-400 bg-red-900/10 p-4 rounded-lg border border-red-900/30 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  {error}
                </div>
              ) : response ? (
                <div className="whitespace-pre-wrap animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {response}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4 opacity-50">
                  <Monitor className="w-12 h-12" />
                  <p>Ready to process your workflow.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: History */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between mb-2">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
               <History className="w-4 h-4" />
               Timeline
             </h3>
             <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-500">{workflows.length}</span>
          </div>

          <div className="space-y-3 h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar pb-20">
            {workflows.map((wf) => (
              <div
                key={wf.id}
                className="bg-gray-800/40 p-4 rounded-lg border border-gray-700/50 hover:bg-gray-800 hover:border-gray-600 transition-all group cursor-pointer"
                onClick={() => handleReplay(wf.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
                    wf.mode === 'analyze' ? 'bg-blue-900/30 text-blue-400 border border-blue-900/50' :
                    wf.mode === 'create' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-900/50' :
                    'bg-orange-900/30 text-orange-400 border border-orange-900/50'
                  }`}>
                    {wf.mode}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {new Date(wf.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <p className="text-xs text-gray-300 line-clamp-2 mb-3 font-medium leading-relaxed">{wf.text}</p>

                <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity pt-2 border-t border-gray-700/50 mt-2">
                   <span className="text-[10px] text-gray-500">ID: #{wf.id}</span>
                   <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium">
                    <RefreshCw className="w-3 h-3" /> Replay
                  </button>
                </div>
              </div>
            ))}
            {workflows.length === 0 && (
              <div className="text-center py-10 border-2 border-dashed border-gray-800 rounded-xl">
                <p className="text-gray-600 text-sm">No recent activity.</p>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;
