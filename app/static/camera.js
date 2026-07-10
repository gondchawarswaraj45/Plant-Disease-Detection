// ==========================================
// CAMERA LENS (LIVE WEBCAM DIAGNOSTICS)
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    const startCameraBtn = document.getElementById("start-camera-btn");
    const stopCameraBtn = document.getElementById("stop-camera-btn");
    const captureFrameBtn = document.getElementById("capture-frame-btn");
    
    const cameraContainer = document.getElementById("camera-container");
    const uploadContainer = document.getElementById("upload-container");
    const videoStream = document.getElementById("video-stream");
    
    const statusConsole = document.getElementById("camera-status-console");
    
    let streamActive = null;

    if (startCameraBtn && cameraContainer && uploadContainer) {
        startCameraBtn.addEventListener("click", async () => {
            uploadContainer.style.display = "none";
            cameraContainer.style.display = "flex";
            
            updateConsole("Requesting camera access...", "info");
            
            try {
                const constraints = {
                    video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
                };
                
                streamActive = await navigator.mediaDevices.getUserMedia(constraints);
                videoStream.srcObject = streamActive;
                videoStream.play();
                
                updateConsole("Lens connected. Center the leaf in the frame.", "success");
            } catch (err) {
                console.error("Camera access error:", err);
                updateConsole("Camera Access Denied: Please check permissions.", "error");
                // Fallback back to upload
                setTimeout(() => {
                    closeCamera();
                }, 3000);
            }
        });
    }

    if (stopCameraBtn) {
        stopCameraBtn.addEventListener("click", () => {
            closeCamera();
        });
    }

    if (captureFrameBtn) {
        captureFrameBtn.addEventListener("click", () => {
            if (!streamActive) return;
            
            updateConsole("Freezing frame & analyzing...", "info");
            captureFrameBtn.disabled = true;
            
            // Create offscreen canvas to extract snapshot
            const canvas = document.createElement("canvas");
            canvas.width = videoStream.videoWidth || 640;
            canvas.height = videoStream.videoHeight || 480;
            
            const context = canvas.getContext("2d");
            context.drawImage(videoStream, 0, 0, canvas.width, canvas.height);
            
            // Convert to Base64 JPEG
            const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
            
            // Send to server
            fetch("/api/camera-upload", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ image: dataUrl })
            })
            .then(res => {
                if (!res.ok) throw new Error("Server classification error");
                return res.json();
            })
            .then(data => {
                if (data.redirect) {
                    window.location.href = data.redirect;
                } else {
                    throw new Error("Missing redirect path");
                }
            })
            .catch(err => {
                console.error("Camera upload failed:", err);
                updateConsole("Error during leaf analysis. Try again.", "error");
                captureFrameBtn.disabled = false;
            });
        });
    }

    function closeCamera() {
        if (streamActive) {
            const tracks = streamActive.getTracks();
            tracks.forEach(track => track.stop());
            streamActive = null;
        }
        
        if (videoStream) {
            videoStream.srcObject = null;
        }
        
        if (cameraContainer) cameraContainer.style.display = "none";
        if (uploadContainer) uploadContainer.style.display = "block";
        if (captureFrameBtn) captureFrameBtn.disabled = false;
    }

    function updateConsole(message, type) {
        if (!statusConsole) return;
        statusConsole.innerHTML = message;
        statusConsole.className = "console-log " + type;
    }
});
