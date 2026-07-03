// --- HTML Template Generator ---
export function generateHTMLString(data) {
    const scriptStart = "<script>";
    const scriptEnd = "</" + "script>";

    let diffColor = "text-green-600"; 
    if (data.difficulty === "Intermediate") diffColor = "text-yellow-600";
    if (data.difficulty === "Advanced") diffColor = "text-red-600";

    let joinProjectBtn = "";
    if (data.projectStatus !== "Completed") {
        joinProjectBtn = `
                <a href="/join_project.html?projectName=${encodeURIComponent(data.projectName)}&projectId=${encodeURIComponent(data.projectId)}" class="action-button join-project-button">
                    Join This Project
                </a>`;
    }

    const getYouTubeVideoId = (url) => {
        try {
            const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
            const match = url.match(regex);
            return match ? match[1] : '';
        } catch (e) {
            return '';
        }
    };

    const escapeHtml = (unsafe) => {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    const summaryData = {
        projectId: data.projectId, // Dynamically maps the unique ID
        name: data.projectName,
        image: data.imageUrls && data.imageUrls.length > 0 ? data.imageUrls[0] : null,
        status: data.projectStatus,
        desc: data.shortDescription,
        tags: data.tags || [], // Falls back to an empty array if undefined
        technologies: data.technologies || [], // Falls back to an empty array if undefined
        date: data.date || new Date().toISOString().split('T')[0], // Falls back to today's date format
        buttonLabel: data.buttonLabel || "Visit Website" // Falls back to a default label
    };

    const summaryJson = JSON.stringify(summaryData, null, 2);
    const fullJson = JSON.stringify(data, null, 2);

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <title id="pageTitle">Teja Gavara | ${data.projectName}</title>
    
    <meta name="description" content="${data.shortDescription}">
    <meta name="keywords" content="${data.tags.join(', ')}, portfolio, developer, projects">
    <meta name="author" content="Teja Gavara">
    
    <meta property="og:title" content="Teja Gavara | ${data.projectName}">
    <meta property="og:description" content="${data.shortDescription}">
    <meta property="og:image" content="${data.imageUrls.length > 0 ? data.imageUrls[0] : 'https://tejagavara.vercel.app/images/profile.png'}">
    <meta property="og:type" content="article">
    ${data.uploadDate ? `<meta property="article:published_time" content="${data.uploadDate}">` : ''}
    <meta property="og:url" content="https://tejagavara.vercel.app/projects/${data.projectId}.html">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Teja Gavara | ${data.projectName}">
    <meta name="twitter:description" content="${data.shortDescription}">
    <meta name="twitter:image" content="${data.imageUrls.length > 0 ? data.imageUrls[0] : 'https://tejagavara.vercel.app/images/profile.png'}">

    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "${data.projectName}",
      "applicationCategory": "DeveloperApplication",
      "description": "${data.shortDescription.replace(/"/g, '\\"')}",
      "author": {
        "@type": "Person",
        "name": "Teja Gavara",
        "url": "https://tejagavara.vercel.app"
      },
      ${data.imageUrls.length > 0 ? `"image": "${data.imageUrls[0]}",` : ""}
      ${data.uploadDate ? `"datePublished": "${data.uploadDate}",` : ""}
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }
    ${scriptEnd}

    <link rel="icon" type="image/x-icon" sizes="48x48" href="/images/favicon.ico?v=2">
    <link rel="stylesheet" href="output.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="project_detail.css">

    <style>
        body { font-family: 'Inter', sans-serif; }
        #mobile-menu { position: fixed; top: 64px; left: 0; right: 0; z-index: 40; max-height: calc(100vh - 64px); overflow-y: auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-radius: 0 0 0.5rem 0.5rem; padding: 1rem; transition: all 0.3s ease-in-out; }
        @media (prefers-color-scheme: dark) { 
            #mobile-menu { background-color: #1F2937; color: #f9f9f9; } 
            #mobile-menu a { color: #f9f9f9; } 
            #mobile-menu a:hover { color: #4A90E2; } 
        }
        .loading-spinner-container-detail { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 200px; }
        .loading-spinner-detail { border: 4px solid rgba(0, 0, 0, 0.1); border-left-color: #3b82f6; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        
        .lightbox { display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0, 0, 0, 0.9); align-items: center; justify-content: center; }
        .lightbox-content { margin: auto; display: block; max-width: 90%; max-height: 85vh; border-radius: 0.5rem; object-fit: contain; }
        .lightbox-close { position: absolute; top: 20px; right: 35px; color: #f1f1f1; font-size: 40px; font-weight: bold; cursor: pointer; z-index: 1001; }
        .lightbox-close:hover { color: #bbb; }
        .carousel-image { cursor: zoom-in; }

        .share-btn { display: inline-flex; items-center; justify-center; background-color: #f3f4f6; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; color: #374151; border: 1px solid #d1d5db; }
        .share-btn:hover { background-color: #e5e7eb; }
        .dark .share-btn { background-color: #374151; color: white; border-color: #4b5563; }
        .dark .share-btn:hover { background-color: #4b5563; }
    </style>
</head>

<body class="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-black">

    <header class="bg-white shadow-md py-4 px-6 md:px-10 lg:px-16 flex justify-between items-center rounded-b-lg sticky top-0 z-50 dark:bg-gray-800 dark:text-white">
        <div class="flex items-center">
            <a href="/index.html" class="text-2xl font-bold text-gray-800 hover:text-blue-600 dark:text-white dark:hover:text-blue-400 transition duration-300 ease-in-out">
                <span class="text-blue-600">G</span>TEJA
            </a>
        </div>
        <button id="menu-btn" class="md:hidden text-gray-700 dark:text-white focus:outline-none" aria-label="Toggle menu">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <path d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
        </button>
        <nav id="menu" class="hidden md:flex">
            <ul class="flex flex-col md:flex-row md:space-x-8">
                <li><a href="/index.html" class="block text-gray-700 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 font-medium transition duration-300 ease-in-out px-3 py-2 rounded-md">Home</a></li>
                <li><a href="/projects.html" class="block text-gray-700 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 font-medium transition duration-300 ease-in-out px-3 py-2 rounded-md">Projects</a></li>
                <li><a href="/about.html" class="block text-gray-700 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 font-medium transition duration-300 ease-in-out px-3 py-2 rounded-md">About</a></li>
                <li><a href="/contact.html" class="block text-gray-700 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 font-medium transition duration-300 ease-in-out px-3 py-2 rounded-md">Contact</a></li>
            </ul>
        </nav>
    </header>
    
    <nav id="mobile-menu" class="hidden bg-white shadow-md rounded-b-lg md:hidden px-6 py-4 dark:bg-gray-900">
        <ul class="flex flex-col space-y-3">
            <li><a href="/index.html" class="block text-gray-700 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 font-medium px-3 py-2 rounded-md transition duration-300">Home</a></li>
            <li><a href="/projects.html" class="block text-gray-700 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 font-medium px-3 py-2 rounded-md transition duration-300">Projects</a></li>
            <li><a href="/about.html" class="block text-gray-700 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 font-medium px-3 py-2 rounded-md transition duration-300">About</a></li>
            <li><a href="/contact.html" class="block text-gray-700 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 font-medium px-3 py-2 rounded-md transition duration-300">Contact</a></li>
        </ul>
    </nav>

    <main class="p-0 sm:p-6 md:p-10 lg:p-16">
        <div id="loadingSpinner" class="hidden fixed top-0 left-0 w-full h-full bg-white bg-opacity-10 backdrop-blur-sm z-50 flex justify-center items-center">
            <h2 class="text-3xl text-gray-700 dark:text-white">Loading...</h2>
        </div>

        <div class="p-0 sm:bg-white sm:p-6 sm:rounded-lg sm:shadow-lg dark:bg-gray-900">
            <div class="flex justify-between items-center mb-6 w-full">
                <a href="/projects.html" class="inline-flex items-center bg-gray-200 hover:bg-gray-300 text-black font-bold py-2 px-4 rounded-md shadow-sm transition duration-300 ease-in-out dark:bg-gray-400">
                    <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6l6 6l1.41-1.41z"></path>
                    </svg>
                    Back to Projects
                </a>
                
                <button id="shareBtn" class="share-btn">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                    Share
                </button>
            </div>

            <section class="project-details-page dark:bg-gray-800 dark:text-gray-100" id="projectDetailsPage">
        <h2 class="text-blue-600 dark:text-blue-800 font-bold text-6xl mb-6 mt-0 text-center w-full">${data.projectName}</h2>
        <div class="meta-info">
            ${data.uploadDate ? `<div><strong>Uploaded:</strong> ${data.uploadDate}</div>` : ''}
            ${data.lastUpdated ? `<div><strong>Last Updated:</strong> ${data.lastUpdated}</div>` : ''}
            <div id="live-views"><strong>Views:</strong> <span class="stats-counter">...</span></div>
            ${data.buttonLabel !== 'None' ? `<div id="live-downloads"><strong>${data.buttonLabel}s:</strong> <span class="stats-counter">...</span></div>` : ''}
            <div><strong>Difficulty:</strong> <span class="${diffColor}">${data.difficulty}</span></div>
            <div><strong>Status:</strong> <span class="capitalize">${data.projectStatus}</span></div>
        </div>

        ${data.technologies && data.technologies.length > 0 ? `
        <div class="technologies">
            <h3>Technologies Used:</h3>
            ${data.technologies.map(tech => `<span>${tech}</span>`).join('')}
        </div>` : ''}

        ${data.imageUrls && data.imageUrls.length > 0 ? `
            <h3 class="border-b-2 border-[#e0e0e0] pb-[10px] mt-[35px] mb-[20px] w-full text-[1.8em]">Project Images</h3>
            <div class="image-carousel-container">
                <div class="image-carousel" id="imageCarousel">
                    ${data.imageUrls.map(url => `<img src="${url}" alt="Project Image" class="carousel-image">`).join('')}
                </div>
            </div>` : ''}

        <h3 class="border-b-2 border-[#e0e0e0] pb-[10px] mt-[35px] mb-[20px] w-full text-[1.8em]">Project Overview</h3>
        <p class="short-description">${data.shortDescription}</p>
        <h3 class="border-b-2 border-[#e0e0e0] pb-[10px] mt-[35px] mb-[20px] w-full text-[1.8em]">Project Details</h3>
        <p class="long-description">${data.longDescription.replace(/\n/g, '<br>')}</p>

        ${data.sponsors && data.sponsors.length > 0 ? `
            <div class="sponsors-section">
                <h3 class="border-b-2 border-[#e0e0e0] pb-[10px] mt-[35px] mb-[20px] w-full text-[1.8em]">Our Sponsors</h3>
                <div class="sponsors-list">
                    ${data.sponsors.map(sponsor => `<span class="sponsor-name">${sponsor}</span>`).join('')}
                </div>
            </div>` : ''}

        ${data.videoUrl ? `
            <h3 class="border-b-2 border-[#e0e0e0] pb-[10px] mt-[35px] mb-[20px] w-full text-[1.8em]">Project Video</h3>
            <div class="video-embed">
                <iframe src="https://www.youtube.com/embed/${getYouTubeVideoId(data.videoUrl)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen=""></iframe>
            </div>` : ''}

        ${data.members && data.members.length > 0 ? `
            <div class="members-section">
                <h3 class="border-b-2 border-[#e0e0e0] pb-[10px] mt-[35px] mb-[20px] w-full text-[1.8em]">Team Members</h3>
                <div class="members-scroll-container">
                    <div class="members-list">
                        ${data.members.map(member => `<span class="member-name">${member}</span>`).join('')}
                    </div>
                </div>
            </div>` : ''}

        ${data.code ? `
            <h3 class="border-b-2 border-[#e0e0e0] pb-[10px] mt-[35px] mb-[20px] w-full text-[1.8em]">Code Snippet</h3>
            <div class="code-container bg-[#2d2d2d] relative">
                <button id="copyCodeButton" class="copy-btn" aria-label="Copy code">📁 Copy Code</button>
                <pre class="code-block"><code>${escapeHtml(data.code)}</code></pre>
            </div>` : ''}

        <div class="action-buttons-container flex justify-center gap-4 mt-4 flex-wrap w-full">
            ${data.buttonUrl && data.buttonLabel !== 'None' ? `
                <a href="${data.buttonUrl}" target="_blank" rel="noopener noreferrer" class="action-button" id="projectActionButton">
                    ${data.buttonLabel}
                </a>` : ''}
            
            ${joinProjectBtn}
        </div>
        </section>
        </div>
    </main>

    <div id="lightbox" class="lightbox">
        <span class="lightbox-close">&times;</span>
        <img class="lightbox-content" id="lightboxImage">
    </div>

    <footer class="bg-gray-800 text-white text-center py-4 mt-auto rounded-t-lg">
        <p>© <span id="year"></span> G TEJA. All rights reserved.</p>
        ${scriptStart}
            document.getElementById('year').textContent = new Date().getFullYear();
        ${scriptEnd}
    </footer>

    <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js">${scriptEnd}
    <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js">${scriptEnd}
    <script src="statistics.js">${scriptEnd}

    ${scriptStart}
        document.addEventListener('contextmenu', e => e.preventDefault());
        document.addEventListener('keydown', e => {
            if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I', 'J'].includes(e.key.toUpperCase()))) e.preventDefault();
        });

        const btn = document.getElementById('menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        if(btn && mobileMenu) {
            btn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
            document.addEventListener('click', (e) => {
                if (!btn.contains(e.target) && !mobileMenu.contains(e.target)) mobileMenu.classList.add('hidden');
            });
        }

        const shareBtn = document.getElementById('shareBtn');
        if(shareBtn) {
            shareBtn.addEventListener('click', async () => {
                const shareData = {
                    title: 'Teja Gavara | ${data.projectName}',
                    text: '${data.shortDescription}',
                    url: window.location.href
                };
                try {
                    if (navigator.share) {
                        await navigator.share(shareData);
                    } else {
                        await navigator.clipboard.writeText(window.location.href);
                        alert('Link copied to clipboard!');
                    }
                } catch (err) {
                    console.error('Error sharing:', err);
                }
            });
        }

        const copyCodeBtn = document.getElementById('copyCodeButton');
        if(copyCodeBtn) {
            copyCodeBtn.addEventListener('click', () => {
                const codeText = document.querySelector('.code-block code').innerText;
                navigator.clipboard.writeText(codeText).then(() => {
                    const origText = copyCodeBtn.innerText;
                    copyCodeBtn.innerText = 'Copied!';
                    setTimeout(() => copyCodeBtn.innerText = origText, 2000);
                });
            });
        }

        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightboxImage');
        const closeBtn = document.querySelector('.lightbox-close');

        document.querySelectorAll('.carousel-image').forEach(img => {
            img.addEventListener('click', () => {
                lightbox.style.display = 'flex';
                lightboxImg.src = img.src;
            });
        });
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => lightbox.style.display = 'none');
        }
        
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) lightbox.style.display = 'none';
        });

        document.addEventListener('DOMContentLoaded', async () => {
            const pId = "${data.projectId}";
            
            if (typeof getProjectStats === "function") {
                const stats = await getProjectStats(pId);
                const viewsEl = document.querySelector('#live-views .stats-counter');
                const downEl = document.querySelector('#live-downloads .stats-counter');
                
                if (viewsEl) viewsEl.textContent = stats.views;
                if (downEl) downEl.textContent = stats.downloads;

                const actionBtn = document.getElementById('projectActionButton');
                if (actionBtn) {
                    actionBtn.addEventListener('click', () => {
                        incrementProjectDownloads(pId);
                    });
                }
            }
        });
    ${scriptEnd}

    <!--
    ${summaryJson}
    --------------------------------
    ${fullJson}
    -->

</body>
</html>`;
}