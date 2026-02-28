// --- VARIABLES GLOBALES ---
let monacoEditor = null;
let DATA = [];
let currentStep = 0;
let currentExIndex = 0;
let unlockedStep = 0;
let score = 0;
let outputBuffer = "";

// Fallback si showNotify n'existe pas ailleurs
if (typeof window.showNotify !== "function") {
  window.showNotify = (msg, type = "info") => {
    const fn =
      type === "error" ? console.error :
      type === "success" ? console.log :
      console.info;
    fn(msg);
  };
}

// --- BOOTSTRAP ---
window.addEventListener("load", async () => {
  try {
    const [chapitres] = await Promise.all([
      loadData(),
      loadMonaco()
    ]);

    DATA = chapitres;
    initApp();
  } catch (err) {
    console.error("Erreur d'initialisation :", err);
    showNotify("Impossible d'initialiser l'application (voir console).", "error");
  }
});

async function loadData() {
  const response = await fetch("/donnees.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Chargement /donnees.json impossible (HTTP ${response.status})`);
  }
  const result = await response.json();
  if (!result?.chapitres || !Array.isArray(result.chapitres)) {
    throw new Error("JSON invalide : `chapitres` manquant ou non tableau.");
  }
  return result.chapitres;
}

function loadMonaco() {
  return new Promise((resolve, reject) => {
    const createEditor = () => {
      try {
        const container = document.getElementById("monaco-container");
        if (!container) throw new Error("Élément #monaco-container introuvable.");

        monacoEditor = monaco.editor.create(container, {
          value: "# Lumina Code prêt\nprint('Hello World')",
          language: "python",
          theme: "vs-dark",
          automaticLayout: true
        });

        resolve();
      } catch (e) {
        reject(e);
      }
    };

    const loadWithRequire = (req) => {
      try {
        req.config({
          paths: { vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.43.0/min/vs" }
        });
        req(["vs/editor/editor.main"], createEditor);
      } catch (e) {
        reject(e);
      }
    };

    // Si require est déjà présent
    if (typeof window.require === "function" && typeof window.require.config === "function") {
      loadWithRequire(window.require);
      return;
    }

    // Sinon injecte RequireJS puis charge Monaco
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.6/require.min.js";
    script.onload = () => {
      if (typeof window.require === "function") loadWithRequire(window.require);
      else reject(new Error("RequireJS chargé mais `window.require` introuvable."));
    };
    script.onerror = () => reject(new Error("Impossible de charger RequireJS."));
    document.head.appendChild(script);
  });
}

// --- LOGIQUE DE L'APP ---
function initApp() {
  if (!Array.isArray(DATA) || DATA.length === 0) {
    showNotify("Aucun chapitre trouvé dans les données.", "error");
    return;
  }
  currentStep = Math.min(Math.max(currentStep, 0), DATA.length - 1);
  unlockedStep = Math.min(Math.max(unlockedStep, 0), DATA.length - 1);

  updateSidebar();
  loadChapter();
}

function updateSidebar() {
  const list = document.getElementById("chapter-list");
  if (!list) return;

  list.innerHTML = "";

  DATA.forEach((chap, index) => {
    const li = document.createElement("li");
    li.className = (index === currentStep) ? "active" : "";
    if (index <= unlockedStep) li.classList.add("unlocked");

    const locked = index > unlockedStep;
    li.innerHTML = `<span>${chap.titre ?? `Chapitre ${index + 1}`}</span> ${locked ? "🔒" : "✅"}`;

    li.onclick = () => {
      if (index <= unlockedStep) {
        currentStep = index;
        loadChapter();
      } else {
        showNotify("Chapitre verrouillé", "info");
      }
    };

    list.appendChild(li);
  });
}

function loadChapter() {
  const chap = DATA[currentStep];
  if (!chap) {
    showNotify("Chapitre introuvable (index invalide).", "error");
    return;
  }

  // UI Progress (évite /0)
  const denom = Math.max(1, DATA.length - 1);
  const progress = Math.round((unlockedStep / denom) * 100);

  const barFill = document.getElementById("bar-fill");
  const progressPercent = document.getElementById("progress-percent");
  if (barFill) barFill.style.width = progress + "%";
  if (progressPercent) progressPercent.innerText = progress + "%";

  updateSidebar();

  // Reset affichage
  document.getElementById("terminal-side")?.classList.add("hidden");
  document.getElementById("goal-container")?.classList.add("hidden");

  const titleEl = document.getElementById("chap-title");
  const leconEl = document.getElementById("chap-lecon");

  if (titleEl) titleEl.innerText = chap.titre ?? "";
  if (leconEl) leconEl.innerHTML = chap.lecon ?? "";

  renderQuiz(chap.questions_cours);
}

function renderQuiz(questions) {
  const area = document.getElementById("quiz-area");
  if (!area) return;

  const qs = Array.isArray(questions) ? questions : [];

  let html = `<div class='quiz-box'><h3>📝 Quiz de validation</h3>`;

  if (qs.length === 0) {
    html += `<p>Aucun quiz pour ce chapitre.</p>
             <button class='run-btn' style='width:100%; margin-top:10px;' onclick='window.checkQuiz()'>
               CONTINUER
             </button>`;
    html += `</div>`;
    area.innerHTML = html;
    return;
  }

  qs.forEach((q, i) => {
    html += `
      <p style='margin-top:15px;'>
        ${q.q ?? ""}
        <br>
        <input type='text' id='q-${i}' class='quiz-input' placeholder='Votre réponse...'>
      </p>`;
  });

  html += `
    <button class='run-btn' style='width:100%; margin-top:10px;' onclick='window.checkQuiz()'>
      VÉRIFIER LE QUIZ
    </button>
  </div>`;

  area.innerHTML = html;
}

function checkQuiz() {
  const chap = DATA[currentStep];
  if (!chap) {
    showNotify("Données de chapitre manquantes.", "error");
    return;
  }

  const questions = Array.isArray(chap.questions_cours) ? chap.questions_cours : [];

  if (questions.length === 0) {
    showNotify("Aucun quiz. Déblocage automatique.", "success");
    unlockTerminal();
    return;
  }

  let isCorrect = true;
  const wrongIndexes = [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i] || {};
    const input = document.getElementById(`q-${i}`);
    const userAns = (input?.value ?? "").toLowerCase().trim();
    const expected = String(q.r ?? "").toLowerCase().trim();

    if (!userAns || (expected && !userAns.includes(expected))) {
      isCorrect = false;
      wrongIndexes.push(i);
    }
  }

  // feedback visuel
  for (let i = 0; i < questions.length; i++) {
    const input = document.getElementById(`q-${i}`);
    if (!input) continue;
    if (wrongIndexes.includes(i)) input.classList.add("quiz-wrong");
    else input.classList.remove("quiz-wrong");
  }

  if (isCorrect) {
    showNotify("Parfait ! L'éditeur Lumina est débloqué.", "success");
    unlockTerminal();
  } else {
    showNotify("Réponses incorrectes, relisez la leçon.", "error");
  }
}

// Exposer checkQuiz globalement
window.checkQuiz = checkQuiz;

function unlockTerminal() {
  const chap = DATA[currentStep];
  if (!chap) return;

  if (chap.terminal_requis) {
    document.getElementById("terminal-side")?.classList.remove("hidden");
    document.getElementById("goal-container")?.classList.remove("hidden");

    currentExIndex = 0;
    score = 0;

    // si pas d'exercices
    if (!Array.isArray(chap.exercices) || chap.exercices.length === 0) {
      showNotify("Aucun exercice : chapitre validé.", "success");
      completeChapter();
      return;
    }

    updateExerciseUI();
  } else {
    completeChapter();
  }
}

function updateExerciseUI() {
  const chap = DATA[currentStep];
  const exo = chap?.exercices?.[currentExIndex];
  if (!exo) {
    showNotify("Exercice introuvable.", "error");
    return;
  }

  const objEl = document.getElementById("chap-obj");
  const numEl = document.getElementById("current-ex-num");
  const scoreEl = document.getElementById("score-val");
  const consoleEl = document.getElementById("console");

  if (objEl) objEl.innerText = exo.q ?? "";
  if (numEl) numEl.innerText = String(currentExIndex + 1);
  if (scoreEl) scoreEl.innerText = String(score);

  if (monacoEditor) monacoEditor.setValue("# Écris ton code ici...\n");
  if (consoleEl) consoleEl.innerText = ">>> Console prête.";
}

function validateExercise() {
  if (!monacoEditor) {
    showNotify("Monaco n'est pas prêt.", "error");
    return;
  }

  const chap = DATA[currentStep];
  const exo = chap?.exercices?.[currentExIndex];
  if (!exo) {
    showNotify("Exercice introuvable.", "error");
    return;
  }

  const consoleEl = document.getElementById("console");

  const code = monacoEditor.getValue();
  outputBuffer = "";

  try {
    const print = (...args) => {
      outputBuffer += args.map(a => String(a)).join(" ") + "\n";
    };

    // mini "pseudo-python -> js"
    const sim = code
      .replace(/\bTrue\b/g, "true")
      .replace(/\bFalse\b/g, "false")
      .replace(/\bNone\b/g, "null");

    // Exécute avec print fourni
    // (attention: exécuter du code utilisateur reste risqué)
    const runner = new Function("print", sim);
    runner(print);

    const result = outputBuffer.trim();
    const expected = String(exo.expected ?? "").trim();

    if (result === expected) {
      score++;
      showNotify("Bravo ! Exercice réussi.", "success");
      if (consoleEl) consoleEl.innerText = "Sortie obtenue:\n" + (result || "(vide)");
    } else {
      showNotify(`Erreur. Attendu: ${expected}`, "error");
      if (consoleEl) consoleEl.innerText = "Sortie obtenue:\n" + (result || "(vide)");
    }

    const total = chap.exercices.length;

    if (currentExIndex < total - 1) {
      currentExIndex++;
      setTimeout(updateExerciseUI, 600);
    } else {
      // seuil fixe comme ton code original, mais tu peux le rendre dynamique si besoin
      if (score >= 3) completeChapter();
      else {
        showNotify("Score insuffisant (mini 3). Réessayez.", "error");
        currentExIndex = 0;
        score = 0;
        updateExerciseUI();
      }
    }
  } catch (e) {
    if (consoleEl) consoleEl.innerText = "Erreur de syntaxe :\n" + (e?.message ?? String(e));
  }
}

// Exposer validateExercise globalement
window.validateExercise = validateExercise;

function completeChapter() {
  showNotify("🏆 Chapitre terminé !", "success");

  if (currentStep === unlockedStep) {
    unlockedStep = Math.min(unlockedStep + 1, Math.max(0, DATA.length - 1));
  }

  if (currentStep < DATA.length - 1) {
    currentStep++;
    setTimeout(loadChapter, 1200);
  } else {
    showNotify("Félicitations ! Vous avez fini le cursus.", "success");
  }
}