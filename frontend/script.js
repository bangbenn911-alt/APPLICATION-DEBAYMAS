import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, doc, setDoc, addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAqRP-h35xjCf0jqMZstxB6BdJOKamp8UU",
  authDomain: "debay-93e76.firebaseapp.com",
  projectId: "debay-93e76",
  storageBucket: "debay-93e76.firebasestorage.app",
  messagingSenderId: "468466593830",
  appId: "1:468466593830:web:2be15b45b832d47da576e7",
  measurementId: "G-4GL81N51M8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const currentCandidateId = "KANDIDAT-001";

async function autoSaveToFirebase(questionId, data) {
  try {
    const saveStatus = document.querySelector('.save-status');
    saveStatus.textContent = "⏳ Saving...";
    const docRef = doc(db, "assessment_answers", `${currentCandidateId}_${questionId}`);
    await setDoc(docRef, {
      candidateId: currentCandidateId,
      questionId: questionId,
      answerData: data,
      lastSaved: serverTimestamp()
    }, { merge: true });
    saveStatus.textContent = "💾 Saved to Cloud";
  } catch (error) {
    console.error("Autosave gagal:", error);
    document.querySelector('.save-status').textContent = "⚠️ Offline";
  }
}

async function logCheatToFirebase(actionType) {
  try {
    await addDoc(collection(db, "audit_logs"), {
      candidateId: currentCandidateId,
      violation: actionType,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Gagal mencatat log:", error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  let currentQuestion = 1;
  const totalQuestions = 3;
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const finishBtn = document.getElementById('headerFinishBtn');

  function updateView() {
    document.querySelectorAll('.question-card').forEach(card => card.classList.remove('active-question'));
    document.getElementById(`q-${currentQuestion}`).classList.add('active-question');

    prevBtn.disabled = currentQuestion === 1;
    if (currentQuestion === totalQuestions) {
      nextBtn.textContent = 'Review Answers';
      nextBtn.classList.replace('btn-primary', 'btn-outline');
    } else {
      nextBtn.textContent = 'Next Question';
      nextBtn.classList.replace('btn-outline', 'btn-primary');
    }
  }

  nextBtn.addEventListener('click', () => {
    if (currentQuestion < totalQuestions) {
      currentQuestion++;
      updateView();
    } else {
      alert("Akhir dari tes. Silakan periksa jawaban lalu klik Finish Test.");
    }
  });

  prevBtn.addEventListener('click', () => {
    if (currentQuestion > 1) {
      currentQuestion--;
      updateView();
    }
  });

  finishBtn.addEventListener('click', () => {
    if (confirm("Yakin ingin menyelesaikan tes ini?")) {
      alert("Data berhasil dikirim!");
    }
  });

  document.querySelectorAll('input[name="q1"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      autoSaveToFirebase("Q1_MULTIPLE_CHOICE", { selectedAnswer: e.target.value });
    });
  });

  let tabViolations = 0;
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      tabViolations++;
      logCheatToFirebase("TAB_SWITCH_DETECTED");
      alert(`[SYSTEM WARNING] Tab switching detected. Violation count: ${tabViolations}. Aktivitas ini telah direkam.`);
    }
  });

  let timeRemaining = (29 * 60) + 41;
  const timerDisplay = document.getElementById('timerDisplay');
  const timerInterval = setInterval(() => {
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      timerDisplay.textContent = "00:00";
      alert("Waktu habis! Tes akan dikumpulkan otomatis.");
    } else {
      let minutes = Math.floor(timeRemaining / 60);
      let seconds = timeRemaining % 60;
      timerDisplay.textContent = `🕒 ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      timeRemaining--;
    }
  }, 1000);

  const fxInput = document.getElementById('fxInput');
  let activeCell = null;

  document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('focus', function() {
      activeCell = this;
      fxInput.disabled = false;
      fxInput.value = this.dataset.formula || this.value;
      fxInput.placeholder = "Ketik rumus (e.g., =B1-B2)";
    });
  });

  fxInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && activeCell) {
      const inputVal = this.value.trim().toUpperCase();
      activeCell.dataset.formula = inputVal; 

      if (inputVal.startsWith('=')) {
        let formula = inputVal.substring(1);
        try {
          formula = formula.replace(/[A-Z][0-9]+/g, (match) => {
            const el = document.getElementById(match);
            return el ? (parseFloat(el.value) || 0) : 0;
          });
          const calculate = new Function('return ' + formula);
          activeCell.value = calculate();
        } catch (err) {
          activeCell.value = "#ERROR!";
        }
      } else {
        activeCell.value = inputVal;
      }
      activeCell.blur(); 
      
      autoSaveToFirebase("Q2_SPREADSHEET", {
        cellTarget: activeCell.id,
        formulaEntered: inputVal,
        resultValue: activeCell.value
      });
    }
  });

  const journalBody = document.getElementById('journalBody');
  const btnAddRow = document.getElementById('addRowBtn');

  function createJournalRow() {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <select class="journal-input account-select">
          <option value="">-- Pilih Akun --</option>
          <option value="kas">Kas</option>
          <option value="peralatan">Peralatan</option>
          <option value="utang">Utang Usaha</option>
          <option value="modal">Modal</option>
        </select>
      </td>
      <td><input type="number" class="journal-input debit-input" placeholder="0" min="0"></td>
      <td><input type="number" class="journal-input kredit-input" placeholder="0" min="0"></td>
      <td><button class="btn-danger remove-row">X</button></td>
    `;
    
    tr.querySelector('.remove-row').addEventListener('click', function() {
      tr.remove();
      calculateJournalBalance();
    });

    tr.querySelectorAll('.debit-input, .kredit-input, .account-select').forEach(input => {
      input.addEventListener('input', calculateJournalBalance);
      input.addEventListener('change', calculateJournalBalance);
    });
    return tr;
  }

  journalBody.appendChild(createJournalRow());
  journalBody.appendChild(createJournalRow());

  btnAddRow.addEventListener('click', () => {
    journalBody.appendChild(createJournalRow());
  });

  function calculateJournalBalance() {
    let totalDebit = 0;
    let totalKredit = 0;

    document.querySelectorAll('.debit-input').forEach(input => {
      totalDebit += parseFloat(input.value) || 0;
    });
    document.querySelectorAll('.kredit-input').forEach(input => {
      totalKredit += parseFloat(input.value) || 0;
    });

    document.getElementById('totalDebit').textContent = totalDebit.toLocaleString('id-ID');
    document.getElementById('totalKredit').textContent = totalKredit.toLocaleString('id-ID');

    const statusLabel = document.getElementById('balanceStatus');
    if (totalDebit > 0 && totalDebit === totalKredit) {
      statusLabel.textContent = "Balanced";
      statusLabel.className = "status-balanced";
    } else {
      statusLabel.textContent = "Not Balanced";
      statusLabel.className = "status-unbalanced";
    }

    let journalData = [];
    document.querySelectorAll('#journalBody tr').forEach(tr => {
        let akun = tr.querySelector('.account-select').value;
        let debit = tr.querySelector('.debit-input').value;
        let kredit = tr.querySelector('.kredit-input').value;
        if(akun || debit || kredit) {
          journalData.push({ akun, debit, kredit });
        }
    });

    autoSaveToFirebase("Q3_ACCOUNTING", {
        status: statusLabel.textContent,
        totalDebit: totalDebit,
        totalKredit: totalKredit,
        entries: journalData
    });
  }
});
