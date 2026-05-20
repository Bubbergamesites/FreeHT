// Default base template
const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: system-ui, sans-serif;
            background: #f4f4f5;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
        }
        .container {
            background: white;
            padding: 2.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
            text-align: center;
        }
        h1 { color: #10b981; }
    </style>
</head>
<body>
    <div class="container">
        <h1>✨ WebCafe HTML Dashboard</h1>
        <p>Import existing files from your machine, or export your progress locally anytime!</p>
    </div>
</body>
</html>`;

// Helper conversion routines
function utoa(str) { return btoa(unescape(encodeURIComponent(str))); }
function atou(str) { return decodeURIComponent(escape(atob(str))); }

// Bind targets
const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const shareBtn = document.getElementById('shareBtn');
const resetBtn = document.getElementById('resetBtn');
const charCount = document.getElementById('charCount');
const previewStatus = document.getElementById('previewStatus');
const toast = document.getElementById('toast');

// New Upload / Export UI components
const fileInput = document.getElementById('fileInput');
const importBtn = document.getElementById('importBtn');
const exportBtn = document.getElementById('exportBtn');
const fileNameLabel = document.getElementById('fileNameLabel');

let currentFileName = "index.html";

function init() {
    const hash = window.location.hash.substring(1);
    if (hash) {
        try {
            editor.value = atou(hash);
        } catch (e) {
            editor.value = DEFAULT_TEMPLATE;
        }
    } else {
        editor.value = DEFAULT_TEMPLATE;
    }
    updatePreview(editor.value);
    updateMetrics();
}

function updatePreview(code) {
    previewStatus.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Rendering`;
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const oldUrl = preview.src;
    preview.src = url;
    if (oldUrl.startsWith('blob:')) {
        URL.revokeObjectURL(oldUrl);
    }
    setTimeout(() => {
        previewStatus.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Synced`;
    }, 200);
}

function updateMetrics() {
    charCount.textContent = `${editor.value.length.toLocaleString()} chars`;
}

function showToast(message) {
    toast.querySelector('#toastMessage').textContent = message;
    toast.classList.remove('translate-y-20', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 2500);
}

// --- FILE CONTROL SYSTEM LOGIC ---

// Trigger native hidden file dialogue on custom UI wrapper click
importBtn.addEventListener('click', () => fileInput.click());

// Read uploaded computer file via asynchronous Web FileReader API
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    currentFileName = file.name;
    fileNameLabel.textContent = currentFileName.toUpperCase();

    const reader = new FileReader();
    reader.onload = (e) => {
        const fileContent = e.target.result;
        editor.value = fileContent;
        updatePreview(fileContent);
        updateMetrics();
        showToast(`Successfully imported: ${file.name}`);
    };
    reader.readAsText(file);
    
    // Clear value string so user can upload the identical file back-to-back if desired
    fileInput.value = "";
});

// Construct a virtual data stream download anchor to save file to local computer disk
exportBtn.addEventListener('click', () => {
    const codeData = editor.value;
    const blob = new Blob([codeData], { type: 'text/html;charset=utf-8;' });
    
    // Fallback/standard temporary injection mechanism to programmatically invoke native OS download dialogues
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", currentFileName);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast("File downloaded to system storage!");
});

// Sync input mutations
editor.addEventListener('input', (e) => {
    updatePreview(e.target.value);
    updateMetrics();
});

shareBtn.addEventListener('click', () => {
    try {
        const compressedCode = utoa(editor.value);
        const shareUrl = `${window.location.origin}${window.location.pathname}#${compressedCode}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            showToast("Hosted project link copied to clipboard!");
        });
    } catch(err) {
        showToast("Error processing link packaging size thresholds.");
    }
});

resetBtn.addEventListener('click', () => {
    if (confirm("Reset layout workspace? Information will clear.")) {
        window.location.hash = '';
        currentFileName = "index.html";
        fileNameLabel.textContent = "INDEX.HTML";
        editor.value = DEFAULT_TEMPLATE;
        updatePreview(DEFAULT_TEMPLATE);
        updateMetrics();
    }
});

window.addEventListener('DOMContentLoaded', init);
