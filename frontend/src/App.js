import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Play, Save, Monitor, Cpu, History, RefreshCw } from 'lucide-react';

const API_URL = 'http://localhost:8000';

function App() {
  const [context, setContext] = useState({ title: 'Detecting...', app_name: '...' });
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('analyze');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [workflows, setWorkflows] = useState([]);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    const interval = setInterval(fetchContext, 2000);
    fetchWorkflows();
    return () => clearInterval(interval);
  }, []);

  const fetchContext = async () => {
    try {
      const res = await axios.get(`${API_URL}/context`);
      setContext(res.data);
    } catch (err) {
      console.error("Context fetch error", err);
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
    try {
      const res = await axios.post(`${API_URL}/ai`, { text: input, mode });
      setResponse(res.data.response);
      fetchWorkflows();
    } catch (err) {
      setResponse("Error processing request.");
    }
    setLoading(false);
  };

  const handleReplay = async (id) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/workflows/replay/${id}`);
      setResponse(`Replay Result:\n${res.data.new_response}`);
    } catch (err) {
      setResponse("Error replaying workflow.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans selection:bg-blue-500 selection:text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-3">
          <Cpu className="w-8 h-8 text-blue-400" />
          <h1 className="text-xl font-bold tracking-wide">CognitiveFlow <span className="text-xs font-normal text-gray-400 ml-2">v1.0 MVP</span></h1>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-400 bg-gray-900 px-4 py-2 rounded-full border border-gray-700">
          <Monitor className="w-4 h-4 text-green-400" />
          <span className="truncate max-w-xs">{context.app_name} - {context.title}</span>
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
                Execute AI Action
              </button>
              
              <button 
                onClick={() => setRecording(!recording)}
                className={`px-6 py-2 rounded-lg font-medium border transition-all flex items-center gap-2 ${recording ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`}
              >
                <Save className="w-5 h-5" />
                {recording ? 'Recording...' : 'Record'}
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl min-h-[300px]">
            <h2 className="text-lg font-semibold mb-4 text-gray-300">AI Response</h2>
            <div className="bg-gray-900 rounded-lg p-4 min-h-[200px] text-gray-300 whitespace-pre-wrap font-mono text-sm border border-gray-700">
              {response || <span className="text-gray-600 italic">Waiting for input...</span>}
            </div>
          </div>
        </div>

        {/* Right Panel: History */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl h-fit">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-purple-400" />
            Recent Workflows
          </h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {workflows.map((wf) => (
              <div key={wf.id} className="bg-gray-900 p-3 rounded-lg border border-gray-700 hover:border-gray-500 transition-colors group">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${wf.mode === 'analyze' ? 'bg-blue-900 text-blue-300' : wf.mode === 'create' ? 'bg-green-900 text-green-300' : 'bg-orange-900 text-orange-300'}`}>
                    {wf.mode.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">{new Date(wf.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-sm text-gray-300 line-clamp-2 mb-2">{wf.text}</p>
                <button 
                  onClick={() => handleReplay(wf.id)}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
