import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogOut, PlayCircle, ShieldCheck } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const CandidateDashboard = () => {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<any>(null);

  useEffect(() => {
    axios.get(`${API_URL}/api/assessment/active`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setAssessment(res.data)).catch(console.error);
  }, [token]);

  const handleStart = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/assessment/start/${assessment.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/candidate/assessment/${res.data.id}`);
    } catch (err) {
      alert('Error starting assessment');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary-900 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Candidate Portal</h1>
          <div className="flex items-center gap-4">
            <span>{user?.name} ({user?.email})</span>
            <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-2 text-sm hover:text-gray-300">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="card max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Available Assessment</h2>
          
          {assessment ? (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded flex items-start gap-3">
                <ShieldCheck className="text-primary-600 mt-1" />
                <div>
                  <h3 className="font-bold text-primary-900">{assessment.title}</h3>
                  <p className="text-sm text-gray-700 mt-1">{assessment.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border p-4 rounded">
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-bold text-lg">{assessment.timeLimit} Minutes</p>
                </div>
                <div className="border p-4 rounded">
                  <p className="text-sm text-gray-500">Sections</p>
                  <p className="font-bold text-lg">{assessment.sections.length} Sections</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-bold mb-2">Instructions:</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                  <li>Ensure stable internet connection.</li>
                  <li>Do not refresh the browser during the test.</li>
                  <li>Answers are autosaved continuously.</li>
                  <li>Timer cannot be paused once started.</li>
                </ul>
              </div>

              <button onClick={handleStart} className="w-full btn btn-primary flex justify-center items-center gap-2 text-lg py-3">
                <PlayCircle /> Start Assessment Now
              </button>
            </div>
          ) : (
            <p className="text-gray-500">No active assessments available for you at this time.</p>
          )}
        </div>
      </main>
    </div>
  );
};
