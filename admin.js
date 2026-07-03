import { generateHTMLString } from './export.js';

// --- Firebase Configuration & Initialization ---
const firebaseConfig = {
    apiKey: "AIzaSyBWoqHihUtSWubkoOTzykbxjtuiIFfgDWg",
    authDomain: "portfolio-baf28.firebaseapp.com",
    projectId: "portfolio-baf28"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// --- 1. Project ID Auto-Generation & Validation ---
const projectNameInput = document.getElementById('projectName');
const projectIdInput = document.getElementById('projectId');
const projectIdHelp = document.getElementById('projectIdHelp');
const buttonLabelSelect = document.getElementById('buttonLabel');
const buttonUrlContainer = document.getElementById('buttonUrlContainer');

projectNameInput.addEventListener('input', (e) => {
    const formatted = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    projectIdInput.value = formatted;
    projectIdInput.classList.remove('input-error');
});

projectIdInput.addEventListener('blur', async (e) => {
    const id = e.target.value.trim();
    if (!id) return;
    
    try {
        const doc = await db.collection("statistics").doc(id).get();
        if (doc.exists) {
            projectIdInput.classList.add('input-error');
            if (projectIdHelp) {
                projectIdHelp.textContent = `❌ The ID "${id}" already exists! Please update it to a unique ID.`;
                projectIdHelp.className = "text-xs text-red-600 font-bold mt-1";
            }
        } else {
            projectIdInput.classList.remove('input-error');
            if (projectIdHelp) {
                projectIdHelp.textContent = `✅ ID is available and unique!`;
                projectIdHelp.className = "text-xs text-green-600 font-bold mt-1";
            }
        }
    } catch (error) {
        console.error("DB Check failed:", error);
    }
});

// --- 2. Dynamic Input Handlers ---
function setupDynamicList(buttonId, containerId, placeholderText, value = '') {
    const container = document.getElementById(containerId);
    
    const row = document.createElement('div');
    row.className = 'flex gap-2 items-center';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'p-2 flex-1 border border-gray-300 rounded-md';
    input.placeholder = placeholderText;
    input.value = value;
    
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'bg-red-500 hover:bg-red-600 text-white font-bold px-3 py-2 rounded-md transition';
    removeBtn.innerText = 'X';
    removeBtn.onclick = () => row.remove();

    row.appendChild(input);
    row.appendChild(removeBtn);
    container.appendChild(row);
}

const dynamicConfigs = {
    imageUrlsContainer: { btnId: 'addImageBtn', placeholder: 'e.g. /images/proj1.jpg' },
    tagsContainer: { btnId: 'addTagBtn', placeholder: 'e.g. AI' },
    technologiesContainer: { btnId: 'addTechBtn', placeholder: 'e.g. Python' },
    membersContainer: { btnId: 'addMemberBtn', placeholder: 'e.g. John Doe' },
    sponsorsContainer: { btnId: 'addSponsorBtn', placeholder: 'e.g. Tech Corp' }
};

Object.entries(dynamicConfigs).forEach(([containerId, cfg]) => {
    document.getElementById(cfg.btnId).addEventListener('click', () => {
        setupDynamicList(cfg.btnId, containerId, cfg.placeholder);
    });
});

setupDynamicList('addImageBtn', 'imageUrlsContainer', 'e.g. /images/proj1.jpg');
setupDynamicList('addTagBtn', 'tagsContainer', 'e.g. AI');
setupDynamicList('addTechBtn', 'technologiesContainer', 'e.g. Python');

// --- 3. Toggle Action URL Field ---
buttonLabelSelect.addEventListener('change', (e) => {
    if (e.target.value === 'None') {
        buttonUrlContainer.style.display = 'none';
        document.getElementById('buttonUrl').value = ''; 
    } else {
        buttonUrlContainer.style.display = 'block';
    }
});

// --- 4. Data Gathering Helpers ---
function getDynamicValues(containerId) {
    const inputs = document.querySelectorAll(`#${containerId} input[type="text"]`);
    return Array.from(inputs).map(input => input.value.trim()).filter(val => val !== '');
}

function getFormData() {
    return {
        projectName: projectNameInput.value.trim(),
        projectId: projectIdInput.value.trim(),
        shortDescription: document.getElementById('shortDescription').value.trim(),
        longDescription: document.getElementById('longDescription').value.trim(),
        uploadDate: document.getElementById('uploadDate').value,
        lastUpdated: document.getElementById('lastUpdated').value,
        videoUrl: document.getElementById('videoUrl').value.trim(),
        imageUrls: getDynamicValues('imageUrlsContainer'),
        tags: getDynamicValues('tagsContainer'),
        technologies: getDynamicValues('technologiesContainer'),
        members: getDynamicValues('membersContainer'),
        sponsors: getDynamicValues('sponsorsContainer'),
        projectStatus: document.getElementById('projectStatus').value,
        difficulty: document.getElementById('difficulty').value,
        code: document.getElementById('code').value,
        buttonLabel: buttonLabelSelect.value,
        buttonUrl: document.getElementById('buttonUrl').value.trim()
    };
}

function populateDynamicFields(containerId, dataArray) {
    const container = document.getElementById(containerId);
    container.innerHTML = ''; 
    if (Array.isArray(dataArray) && dataArray.length > 0) {
        dataArray.forEach(val => {
            setupDynamicList(dynamicConfigs[containerId].btnId, containerId, dynamicConfigs[containerId].placeholder, val);
        });
    }
}

// --- 5. Downloader Pipeline ---
function performDownload(data) {
    // 1. Download HTML File
    const htmlContent = generateHTMLString(data);
    const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
    const htmlLink = document.createElement('a');
    htmlLink.href = URL.createObjectURL(htmlBlob);
    htmlLink.download = data.projectId + '.html';
    htmlLink.click();
    URL.revokeObjectURL(htmlLink.href);
}

// --- 6. Form Submission (Firebase Logic) ---
document.getElementById('generateStaticBtn').addEventListener('click', async () => {
    const data = getFormData();
    
    if (!data.projectName) return alert('Project Name is required.');
    if (!data.projectId) return alert('Project ID is required.');

    const saveToFirebase = confirm("Do you want to initialize metrics registry (views/downloads) for this project in Firebase?\n\nClick 'OK' to save to Firebase and download.\nClick 'Cancel' to ONLY download without tracking.");

    if (saveToFirebase) {
        try {
            const docRef = db.collection("statistics").doc(data.projectId);
            const doc = await docRef.get();
            
            if (doc.exists) {
                projectIdInput.classList.add('input-error');
                projectIdInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                projectIdInput.focus();
                return alert(`Cannot Download: Project ID "${data.projectId}" already exists!\n\nPlease update the Project ID to a unique identifier.`);
            }

            projectIdInput.classList.remove('input-error');
            await docRef.set({ views: 0, downloads: 0 });
            alert('Project tracking registry successfully initialized in Firebase!');
            
            performDownload(data);

        } catch (error) {
            console.error("Firebase Execution Error:", error);
            alert("Failed to access Firebase. Verify network state parameters. Download aborted.");
        }
    } else {
        performDownload(data);
    }
});

// --- 7. Import JSON Engine ---
document.getElementById('importJsonBtn').addEventListener('click', () => {
    document.getElementById('jsonModal').classList.remove('hidden');
});

document.getElementById('processImportBtn').addEventListener('click', () => {
    try {
        const data = JSON.parse(document.getElementById('jsonInput').value);
        
        document.getElementById('projectName').value = data.projectName || '';
        document.getElementById('projectId').value = data.projectId || '';
        document.getElementById('shortDescription').value = data.shortDescription || '';
        document.getElementById('longDescription').value = data.longDescription || '';
        document.getElementById('uploadDate').value = data.uploadDate || '';
        document.getElementById('lastUpdated').value = data.lastUpdated || '';
        document.getElementById('videoUrl').value = data.videoUrl || '';
        document.getElementById('code').value = data.code || '';
        
        if (data.projectStatus) document.getElementById('projectStatus').value = data.projectStatus;
        if (data.difficulty) document.getElementById('difficulty').value = data.difficulty;
        
        if (data.buttonLabel) {
            buttonLabelSelect.value = data.buttonLabel;
            if (data.buttonLabel === 'None') {
                buttonUrlContainer.style.display = 'none';
                document.getElementById('buttonUrl').value = '';
            } else {
                buttonUrlContainer.style.display = 'block';
                document.getElementById('buttonUrl').value = data.buttonUrl || '';
            }
        }
        
        populateDynamicFields('imageUrlsContainer', data.imageUrls);
        populateDynamicFields('tagsContainer', data.tags);
        populateDynamicFields('technologiesContainer', data.technologies);
        populateDynamicFields('membersContainer', data.members);
        populateDynamicFields('sponsorsContainer', data.sponsors);
        
        projectIdInput.classList.remove('input-error');
        document.getElementById('jsonModal').classList.add('hidden');
        
    } catch(e) { 
        alert("Invalid JSON data format! Please verify object arrays."); 
    }
});