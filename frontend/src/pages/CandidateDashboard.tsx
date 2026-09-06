import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, PlayCircle, ShieldCheck } from 'lucide-react';

export const CandidateDashboard = () => {
  const navigate = useNavigate();

  const assessment = {
    id: "demo-assessment-1",
    title: "Corporate Assessment Center - General & Technical Test",
    description: "Evaluasi kompetensi umum, teknis operasional, dan pemecahan masalah perusahaan.",
    timeLimit: 30,
    sections: [
      { title: "General & Technical Test" }
    ]
  };

  const handleStart = () => {
    navigate('/candidate/assessment/active-session');
  };

  const handleLogout = () => {
    localStorage.removeItem('firebase_token');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-900 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Candidate Portal</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm opacity-90">Kandidat Aktif</span>
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm bg-blue-800 hover:bg-blue-700 px-3 py-1.5 rounded transition">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white max-w-3xl mx-auto p-8 rounded-xl shadow-md border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Available Assessment</h2>
          
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 p-5 rounded-lg flex items-start gap-4">
              <ShieldCheck className="text-blue-600 mt-1 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-bold text-blue-900 text-lg">{assessment.title}</h3>
                <p className="text-sm text-gray-700 mt-1">{assessment.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border p-4 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-bold text-lg text-gray-800">{assessment.timeLimit} Minutes</p>
              </div>
              <div className="border p-4 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-500">Sections</p>
                <p className="font-bold text-lg text-gray-800">{assessment.sections.length} Section</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-bold mb-2 text-gray-800">Instructions:</h4>
              <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-600">
                <li>Ensure stable internet connection before starting.</li>
                <li>Do not refresh or close the browser during the test.</li>
                <li>Answers are autosaved continuously.</li>
                <li>Timer cannot be paused once started.</li>
              </ul>
            </div>

            <button 
              onClick={handleStart} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium flex justify-center items-center gap-2 text-lg py-3.5 rounded-lg transition shadow-lg"
            >
              <PlayCircle size={22} /> Start Assessment Now
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
