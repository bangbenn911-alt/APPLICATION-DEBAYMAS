import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { SpreadsheetSimulator } from './SpreadsheetSimulator';
import { Clock, Save, AlertTriangle } from 'lucide-react';
import { db } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export const AssessmentRunner = () => {
  const { sessionId } = useParams();
  const { token } = useAuthStore();
  const navigate = useNavigate();
  
  const [assessment, setAssessment] = useState<any>(null);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    // Memuat data bawaan assessment tanpa memerlukan server backend Express/Node
    const defaultAssessment = {
      title: "Corporate Assessment Center",
      timeLimit: 30, // durasi dalam menit
      sections: [
        {
          title: "General & Technical Test",
          questions: [
            {
              id: "q1",
              type: "MULTIPLE_CHOICE",
              category: "General Knowledge",
              questionText: "Apa komponen utama dalam penyusunan laporan keuangan tahunan perusahaan?",
              options: [
                "Laporan Laba Rugi, Neraca, dan Arus Kas",
                "Faktur Pajak dan Kuitansi Belanja",
                "Daftar Hadir Karyawan",
                "Notulensi Rapat Direksi"
              ]
            },
            {
              id: "q2",
              type: "SPREADSHEET",
              category: "Excel & Spreadsheet",
              questionText: "Simulasikan perhitungan proyeksi anggaran pada tabel spreadsheet di bawah ini:"
            },
            {
              id: "q3",
              type: "ACCOUNTING_JOURNAL",
              category: "Accounting",
              questionText: "Buatlah jurnal akuntansi untuk transaksi pembelian peralatan secara tunai sebesar Rp 5.000.000:"
            }
          ]
        }
      ]
    };

    setAssessment(defaultAssessment);
    setTimeLeft(defaultAssessment.timeLimit * 60);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0 && assessment) {
      handleSubmit();
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, assessment]);

  const handleAnswerChange = (questionId: string, val: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: val }));
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
    }, 300);
  };

  const handleSubmit = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menyelesaikan assessment ini?")) return;
    
    setSaving(true);
    try {
      // Simpan hasil jawaban kandidat langsung ke koleksi 'assessments' di Firebase Firestore
      const docRef = await addDoc(collection(db, "assessments"), {
        sessionId: sessionId || "demo-session",
        answers: answers,
        submittedAt: new Date().toISOString(),
        status: "COMPLETED"
      });

      alert("Assessment berhasil dikirim! ID Dokumen Firebase: " + docRef.id);
      navigate('/candidate/dashboard');
    } catch (e) {
      console.error("Gagal menyimpan ke Firebase:", e);
      alert("Pengiriman gagal! Periksa koneksi atau konfigurasi Firebase Anda.");
    } finally {
      setSaving(false);
    }
  };

  if (!assessment) return <div className="p-10 text-center">Loading Assessment Engine...</div>;

  const currentSection = assessment.sections[currentSectionIdx];
  const currentQuestion = currentSection.questions[currentQuestionIdx];

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Topbar */}
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="font-bold text-primary-900">{assessment.title}</h1>
          <p className="text-sm text-gray-500">Section: {currentSection.title}</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {saving ? <span className="text-yellow-600 animate-pulse">Saving...</span> : <span className="flex items-center gap-1"><Save size={14}/> Saved</span>}
          </div>
          <div className={`flex items-center gap-2 font-mono text-xl ${timeLeft < 300 ? 'text-red-600 font-bold animate-pulse' : 'text-gray-800'}`}>
            <Clock /> {formatTime(timeLeft)}
          </div>
          <button onClick={handleSubmit} className="btn btn-primary text-sm">Finish Test</button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col gap-6">
        
        {/* Anti-cheat banner */}
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded text-sm flex items-center gap-2">
          <AlertTriangle size={16} /> Tab switching is monitored. Do not leave fullscreen.
        </div>

        {/* Question Card */}
        <div className="card flex-1">
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <span className="font-bold text-lg">Question {currentQuestionIdx + 1} of {currentSection.questions.length}</span>
            <span className="bg-primary-50 text-primary-900 px-2 py-1 rounded text-xs font-bold">{currentQuestion.category}</span>
          </div>
          
          <div className="prose max-w-none mb-8 text-lg">
            {currentQuestion.questionText}
          </div>

          <div className="space-y-4">
            {currentQuestion.type === 'MULTIPLE_CHOICE' && currentQuestion.options.map((opt: string, i: number) => (
              <label key={i} className={`block p-4 border rounded cursor-pointer transition-colors ${answers[currentQuestion.id] === opt ? 'bg-primary-50 border-primary-600' : 'hover:bg-gray-50'}`}>
                <input 
                  type="radio" 
                  name={currentQuestion.id} 
                  value={opt}
                  checked={answers[currentQuestion.id] === opt}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  className="mr-3 text-primary-600" 
                />
                {opt}
              </label>
            ))}

            {currentQuestion.type === 'SPREADSHEET' && (
              <SpreadsheetSimulator 
                initialValue={answers[currentQuestion.id] || ''} 
                onChange={(val) => handleAnswerChange(currentQuestion.id, val)}
              />
            )}

            {currentQuestion.type === 'ACCOUNTING_JOURNAL' && (
              <div className="p-4 border rounded bg-gray-50">
                <p className="text-sm text-gray-500 mb-2">Accounting Interface (Simplified for UI Demo)</p>
                <textarea 
                  className="input-field font-mono text-sm" 
                  rows={5}
                  placeholder='[{"account": "Cash", "debit": 1000, "credit": 0}]'
                  value={typeof answers[currentQuestion.id] === 'string' ? answers[currentQuestion.id] : JSON.stringify(answers[currentQuestion.id] || [])}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button 
            className="btn btn-outline" 
            disabled={currentQuestionIdx === 0 && currentSectionIdx === 0}
            onClick={() => {
              if (currentQuestionIdx > 0) setCurrentQuestionIdx(i => i - 1);
              else if (currentSectionIdx > 0) {
                setCurrentSectionIdx(i => i - 1);
                setCurrentQuestionIdx(assessment.sections[currentSectionIdx - 1].questions.length - 1);
              }
            }}
          >
            Previous
          </button>
          
          <button 
            className="btn btn-primary"
            onClick={() => {
              if (currentQuestionIdx < currentSection.questions.length - 1) {
                setCurrentQuestionIdx(i => i + 1);
              } else if (currentSectionIdx < assessment.sections.length - 1) {
                setCurrentSectionIdx(i => i + 1);
                setCurrentQuestionIdx(0);
              }
            }}
          >
            {currentQuestionIdx === currentSection.questions.length - 1 && currentSectionIdx === assessment.sections.length - 1 ? 'Review Answers' : 'Next Question'}
          </button>
        </div>
      </main>
    </div>
  );
};
