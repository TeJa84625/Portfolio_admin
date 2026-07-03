// statistics.js - Reusable Firebase functions for Views and Downloads
const statsFirebaseConfig = {
    apiKey: "AIzaSyBWoqHihUtSWubkoOTzykbxjtuiIFfgDWg",
    authDomain: "portfolio-baf28.firebaseapp.com",
    projectId: "portfolio-baf28"
};

if (!firebase.apps.length) {
    firebase.initializeApp(statsFirebaseConfig);
}
const statsDb = firebase.firestore();

// Fetch Views and Downloads
async function getProjectStats(projectId) {
    try {
        const doc = await statsDb.collection("statistics").doc(projectId).get();
        if (doc.exists) {
            return doc.data();
        } else {
            return { views: 0, downloads: 0 };
        }
    } catch (error) {
        console.error("Error fetching project stats:", error);
        return { views: 0, downloads: 0 };
    }
}

// Increment Downloads
async function incrementProjectDownloads(projectId) {
    try {
        await statsDb.collection("statistics").doc(projectId).set({
            downloads: firebase.firestore.FieldValue.increment(1)
        }, { merge: true });
    } catch (error) {
        console.error("Error incrementing downloads:", error);
    }
}

// Increment Views (Optional use for later tracking)
async function incrementProjectViews(projectId) {
    try {
        await statsDb.collection("statistics").doc(projectId).set({
            views: firebase.firestore.FieldValue.increment(1)
        }, { merge: true });
    } catch (error) {
        console.error("Error incrementing views:", error);
    }
}