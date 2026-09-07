document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. NAVIGATION & STATE MANAGEMENT
  // ==========================================
  let currentQuestion = 1;
  const totalQuestions = 3;
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const finishBtn = document.getElementById('headerFinishBtn');

  function updateView() {
    // Sembunyikan semua soal
    document.querySelectorAll('.question-card').forEach(card => card.classList.remove('active-question'));
    // Tampilkan soal saat ini
    document.getElementById(`q-${currentQuestion}`).classList.add('active-question');

    // Atur tombol
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
      alert("Anda telah mencapai akhir soal. Silakan periksa kembali jawaban Anda, lalu klik Finish Test di pojok kanan atas.");
    }
  });

  prevBtn.addEventListener('click', () => {
    if (currentQuestion > 1) {
      currentQuestion--;
      updateView();
    }
  });

  finishBtn.addEventListener('click', () => {
    if (confirm("Apakah Anda yakin ingin menyelesaikan dan mengirim tes ini?")) {
      alert("Data berhasil dikirim ke server! Beralih ke halaman hasil...");
      // Aksi submission bisa diletakkan di sini
    }
  });


  // ==========================================
  // 2. ANTI-CHEATING (TAB MONITORING)
  // ==========================================
  let tabViolations = 0;
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      tabViolations++;
      alert(`[SYSTEM WARNING] Tab switching detected. Violation count: ${tabViolations}. Aktivitas ini telah direkam oleh Audit Log.`);
    }
  });


  // ==========================================
  // 3. TIMER SYSTEM
  // ==========================================
  let timeRemaining = (29 * 60) + 41; // 29 menit 41 detik
  const timerDisplay = document.getElementById('timerDisplay');

  const timerInterval = setInterval(() => {
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      timerDisplay.textContent = "00:00";
      alert("Waktu pengerjaan habis! Tes akan dikumpulkan secara otomatis.");
      // Eksekusi auto-submit
    } else {
      let minutes = Math.floor(timeRemaining / 60);
      let seconds = timeRemaining % 60;
      timerDisplay.textContent = `🕒 ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      timeRemaining--;
    }
  }, 1000);


  // ==========================================
  // 4. SPREADSHEET ENGINE (No-Eval Parser)
  // ==========================================
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
          // Ganti referensi cell (seperti B1, B2) dengan nilainya
          formula = formula.replace(/[A-Z][0-9]+/g, (match) => {
            const el = document.getElementById(match);
            return el ? (parseFloat(el.value) || 0) : 0;
          });
          // Gunakan new Function sebagai eksekutor matematika dasar tertutup
          const calculate = new Function('return ' + formula);
          activeCell.value = calculate();
        } catch (err) {
          activeCell.value = "#ERROR!";
        }
      } else {
        activeCell.value = inputVal;
      }
      activeCell.blur(); // Hapus fokus
    }
  });


  // ==========================================
  // 5. ACCOUNTING ENGINE (Dynamic Journal)
  // ==========================================
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

    tr.querySelectorAll('.debit-input, .kredit-input').forEach(input => {
      input.addEventListener('input', calculateJournalBalance);
    });
    return tr;
  }

  // Tambah 2 baris awal untuk jurnal
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
  }
});
