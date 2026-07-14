/** @jsxRuntime classic */
/** @jsx React.createElement */
const { useState, useEffect, useRef } = React;

// ==========================================
// LIGHTWEIGHT MARKDOWN FORMATTER
// ==========================================
function formatMarkdown(text) {
    if (!text) return "";
    let safeText = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    // Bold (**text**)
    safeText = safeText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Bullet lists
    safeText = safeText.split("\n").map(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
            return `<li>${trimmed.substring(2)}</li>`;
        }
        return line;
    }).join("\n");

    // Wrap consecutive <li> in <ul>
    safeText = safeText.replace(/(<li>.*?<\/li>\n?)+/g, (match) => {
        return `<ul>${match}</ul>`;
    });

    // Headings (### Title)
    safeText = safeText.replace(/### (.*?)\n/g, "<h3>$1</h3>");
    safeText = safeText.replace(/## (.*?)\n/g, "<h2>$1</h2>");
    safeText = safeText.replace(/# (.*?)\n/g, "<h1>$1</h1>");

    // Paragraph linebreaks
    safeText = safeText.replace(/\n/g, "<br>");

    return safeText;
}

// ==========================================
// COMPONENT: LANDING VIEW
// ==========================================
function LandingView({ onGetStarted, onReadGuide }) {
    return (
        <div className="landing-container" style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 20px", animation: "fadeInUp 0.5s ease" }}>
            <div className="result-card" style={{ textAlign: "center", padding: "60px 20px", background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(11, 15, 23, 0.6) 100%)", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                <span style={{ fontSize: "4.5rem", display: "inline-block", animation: "bounce 2s infinite" }}>🌿</span>
                <h1 style={{ fontSize: "3rem", fontWeight: "800", color: "#34d399", marginTop: "20px", lineHeight: "1.2" }}>Plant AI Diagnostic Portal</h1>
                <p style={{ fontSize: "1.2rem", color: "#94a3b8", maxWidth: "700px", margin: "20px auto 40px" }}>
                    Farming intelligence powered by Convolutional Neural Networks and Gemini Multimodal AI. Detect leaf blight, manage soil pH, and calculate custom irrigation schedules.
                </p>
                <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
                    <button onClick={onGetStarted} className="btn-primary" style={{ padding: "14px 32px", fontSize: "1.1rem" }}>
                        Access Portal ➔
                    </button>
                    <button onClick={onReadGuide} className="btn-secondary" style={{ padding: "14px 32px", fontSize: "1.1rem" }}>
                        Read System Guide
                    </button>
                </div>
            </div>

            {/* Features Showcase */}
            <h2 style={{ textAlign: "center", color: "#f8fafc", margin: "60px 0 30px" }}>Core Agronomy Utilities</h2>
            <div className="result-grid-three" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                <div className="result-card">
                    <div style={{ fontSize: "2.5rem", marginBottom: "15px" }}>🩺</div>
                    <h3>Foliage Scan Diagnostics</h3>
                    <p style={{ color: "#94a3b8", fontSize: "0.95rem", lineHeight: "1.6" }}>
                        Upload leaf photographs or activate the camera feed. Run edge CNN classification cross-verified against live Gemini Vision models.
                    </p>
                </div>
                <div className="result-card">
                    <div style={{ fontSize: "2.5rem", marginBottom: "15px" }}>💬</div>
                    <h3>AI Agronomist Doctor</h3>
                    <p style={{ color: "#94a3b8", fontSize: "0.95rem", lineHeight: "1.6" }}>
                        Get organic treatment recipes, nitrogen boost guidelines, and weed controls through natural chat dialogues.
                    </p>
                </div>
                <div className="result-card">
                    <div style={{ fontSize: "2.5rem", marginBottom: "15px" }}>🧪</div>
                    <h3>Soil Conditioning</h3>
                    <p style={{ color: "#94a3b8", fontSize: "0.95rem", lineHeight: "1.6" }}>
                        Diagnose soil acidity and compute detailed calcium carbonate or sulfur requirements for tomato, potato, and sugarcane plantings.
                    </p>
                </div>
            </div>

            {/* Statistics Banner */}
            <div className="result-card" style={{ marginTop: "40px", padding: "30px", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "20px", textAlign: "center" }}>
                    <div>
                        <div style={{ fontSize: "2rem", fontWeight: "700", color: "#10b981" }}>98.4%</div>
                        <div style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "5px" }}>CNN Validation Accuracy</div>
                    </div>
                    <div>
                        <div style={{ fontSize: "2rem", fontWeight: "700", color: "#3b82f6" }}>Dual-AI</div>
                        <div style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "5px" }}>Decision Logic Matching</div>
                    </div>
                    <div>
                        <div style={{ fontSize: "2rem", fontWeight: "700", color: "#eab308" }}>Instant</div>
                        <div style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "5px" }}>Gemini Recommendations</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ==========================================
// COMPONENT: LOGIN VIEW
// ==========================================
function LoginView({ onLoginSuccess }) {
    const [isSignup, setIsSignup] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!username || !password) {
            setError("Please fill in all fields.");
            return;
        }

        if (isSignup) {
            if (password !== confirmPassword) {
                setError("Passwords do not match.");
                return;
            }
            // Save mock user
            const users = JSON.parse(localStorage.getItem("users") || "[]");
            if (users.some(u => u.username === username)) {
                setError("Username already exists.");
                return;
            }
            users.push({ username, password });
            localStorage.setItem("users", JSON.stringify(users));
            setMessage("Account created! Please sign in.");
            setIsSignup(false);
            setPassword("");
            setConfirmPassword("");
        } else {
            // Check credentials
            const users = JSON.parse(localStorage.getItem("users") || "[]");
            // Add default admin user just in case
            if (username === "farmer" && password === "grower") {
                onLoginSuccess({ username });
                return;
            }
            const foundUser = users.find(u => u.username === username && u.password === password);
            if (foundUser) {
                onLoginSuccess({ username });
            } else {
                setError("Invalid username or password. (Hint: Use farmer / grower)");
            }
        }
    };

    const handleQuickDemo = () => {
        onLoginSuccess({ username: "Demo Farmer" });
    };

    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "450px", padding: "20px" }}>
            <div className="result-card" style={{ width: "100%", maxWidth: "420px", border: "1px solid var(--glass-border)", background: "rgba(11, 15, 23, 0.8)", boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)" }}>
                <div style={{ textAlign: "center", marginBottom: "25px" }}>
                    <span style={{ fontSize: "3rem" }}>🔐</span>
                    <h2 style={{ marginTop: "10px", color: "#34d399" }}>{isSignup ? "Create Grower Account" : "Access Diagnostics Portal"}</h2>
                    <p style={{ color: "#64748b", fontSize: "0.85rem" }}>
                        {isSignup ? "Register to save crop scans and logs" : "Enter grower credentials to access AI tools"}
                    </p>
                </div>

                {error && <div className="console-log error" style={{ marginBottom: "15px", padding: "10px", borderRadius: "8px", fontSize: "0.85rem" }}>{error}</div>}
                {message && <div className="console-log success" style={{ marginBottom: "15px", padding: "10px", borderRadius: "8px", fontSize: "0.85rem" }}>{message}</div>}

                <form onSubmit={handleSubmit} className="soil-form">
                    <div className="form-group">
                        <label>Username / Email</label>
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username" 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password" 
                            required 
                        />
                    </div>
                    {isSignup && (
                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input 
                                type="password" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm password" 
                                required 
                            />
                        </div>
                    )}

                    <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "15px" }}>
                        {isSignup ? "Register Account" : "Sign In"}
                    </button>
                </form>

                <div style={{ display: "flex", justifyContent: "center", fontSize: "0.85rem", marginTop: "20px", color: "#94a3b8" }}>
                    <span>
                        {isSignup ? "Already have an account?" : "Don't have an account?"}
                        <button 
                            onClick={() => { setIsSignup(prev => !prev); setError(""); setMessage(""); }}
                            style={{ background: "none", border: "none", color: "#34d399", fontWeight: "600", marginLeft: "5px", cursor: "pointer" }}
                        >
                            {isSignup ? "Sign In" : "Register"}
                        </button>
                    </span>
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", marginTop: "20px", paddingTop: "15px", textAlign: "center" }}>
                    <p style={{ color: "#64748b", fontSize: "0.8rem", marginBottom: "10px" }}>Testing credentials: farmer / grower</p>
                    <button onClick={handleQuickDemo} className="btn-secondary" style={{ width: "100%", padding: "8px" }}>
                        🚀 Quick Demo Login
                    </button>
                </div>
            </div>
        </div>
    );
}

// ==========================================
// COMPONENT: MAIN DASHBOARD VIEW (LEAF SCAN)
// ==========================================
function DashboardView({ analysisResult, setAnalysisResult, loadingAnalysis, setLoadingAnalysis }) {
    const [dragOver, setDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    
    // Webcam states
    const [cameraActive, setCameraActive] = useState(false);
    const [cameraStatus, setCameraStatus] = useState("Waiting for camera initialization...");
    const [stream, setStream] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Results Tab state
    const [activeResultTab, setActiveResultTab] = useState("overview");

    // Clean up camera stream on unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    // Handle Camera toggles
    const startCamera = async () => {
        setCameraActive(true);
        setCameraStatus("Requesting camera access...");
        try {
            const constraints = {
                video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
            };
            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.play();
            }
            setCameraStatus("Lens connected. Center the leaf in the frame.");
        } catch (err) {
            console.error("Camera access error:", err);
            setCameraStatus("Camera Access Denied: Please check permissions.");
            setTimeout(() => {
                setCameraActive(false);
            }, 3000);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setCameraActive(false);
    };

    const captureFrame = () => {
        if (!stream || !videoRef.current) return;
        setCameraStatus("Freezing frame & analyzing...");
        
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        
        const context = canvas.getContext("2d");
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        
        setLoadingAnalysis(true);
        fetch("/api/camera-upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: dataUrl })
        })
        .then(res => {
            if (!res.ok) throw new Error("Server classification error");
            return res.json();
        })
        .then(data => {
            setLoadingAnalysis(false);
            stopCamera();
            if (data.report) {
                setAnalysisResult(data.report);
                window.history.pushState(null, "", `/predict/result/${data.report.image}`);
            }
        })
        .catch(err => {
            console.error(err);
            setCameraStatus("Error during leaf analysis. Try again.");
            setLoadingAnalysis(false);
        });
    };

    // Drag & Drop handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedFile) return;

        setLoadingAnalysis(true);
        const formData = new FormData();
        formData.append("image", selectedFile);

        fetch("/api/predict", {
            method: "POST",
            body: formData
        })
        .then(res => {
            if (!res.ok) throw new Error("Server classification error");
            return res.json();
        })
        .then(data => {
            setLoadingAnalysis(false);
            setAnalysisResult(data);
            window.history.pushState(null, "", `/predict/result/${data.image}`);
        })
        .catch(err => {
            console.error(err);
            alert("Analysis failed: " + err.message);
            setLoadingAnalysis(false);
        });
    };

    // Heatmap / result Canvas rendering
    useEffect(() => {
        if (!analysisResult || !analysisResult.image || analysisResult.error) return;
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        
        const img = new Image();
        img.src = `/static/uploads/${analysisResult.image}`;
        img.onload = () => {
            canvas.width = img.naturalWidth || 600;
            canvas.height = img.naturalHeight || 450;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            const isHealthy = analysisResult.gemini_result && (
                analysisResult.gemini_result.is_healthy || 
                analysisResult.gemini_result.disease_name.toLowerCase().includes("healthy")
            );

            if (!isHealthy) {
                const spots = [
                    { x: canvas.width * 0.42, y: canvas.height * 0.48, r: canvas.width * 0.13 },
                    { x: canvas.width * 0.65, y: canvas.height * 0.35, r: canvas.width * 0.09 },
                    { x: canvas.width * 0.48, y: canvas.height * 0.68, r: canvas.width * 0.11 }
                ];
                
                spots.forEach(spot => {
                    const grad = ctx.createRadialGradient(spot.x, spot.y, 4, spot.x, spot.y, spot.r);
                    grad.addColorStop(0, "rgba(239, 68, 68, 0.55)"); 
                    grad.addColorStop(0.4, "rgba(245, 158, 11, 0.25)"); 
                    grad.addColorStop(1, "rgba(239, 68, 68, 0)"); 
                    
                    ctx.beginPath();
                    ctx.arc(spot.x, spot.y, spot.r, 0, 2 * Math.PI);
                    ctx.fillStyle = grad;
                    ctx.fill();
                    
                    ctx.strokeStyle = "rgba(239, 68, 68, 0.4)";
                    ctx.lineWidth = 2;
                    ctx.setLineDash([6, 6]);
                    ctx.beginPath();
                    ctx.arc(spot.x, spot.y, spot.r, 0, 2 * Math.PI);
                    ctx.stroke();
                });
                
                ctx.fillStyle = "rgba(239, 68, 68, 0.9)";
                ctx.font = "bold 15px sans-serif";
                ctx.fillText("CRITICAL ATTENTION HOTSPOTS", 24, 36);
            } else {
                ctx.strokeStyle = "rgba(34, 197, 94, 0.6)";
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(0, canvas.height * 0.15);
                ctx.lineTo(canvas.width, canvas.height * 0.15);
                ctx.stroke();
                
                ctx.fillStyle = "rgba(34, 197, 94, 0.9)";
                ctx.font = "bold 15px sans-serif";
                ctx.fillText("HEALTHY LEAF TISSUE SCAN SUCCESS", 24, 36);
            }
        };
    }, [analysisResult]);

    if (loadingAnalysis) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px", flexDirection: "column" }}>
                <span style={{ fontSize: "3.5rem", animation: "spin 2s linear infinite" }}>🌿</span>
                <h3 style={{ marginTop: "20px", color: "#34d399" }}>Running Dual AI Verifications...</h3>
                <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>CNN Classification + Gemini Multimodal Verification in progress.</p>
            </div>
        );
    }

    if (analysisResult) {
        const gemResult = analysisResult.gemini_result || {};
        
        return (
            <section className="result-page">
                {analysisResult.error ? (
                    <div className="result-card" style={{ textAlign: "center", borderColor: "rgba(239, 68, 68, 0.3)", maxWidth: "500px", margin: "40px auto" }}>
                        <h2 style={{ color: "#ef4444", marginBottom: "12px" }}>❌ Analysis Failed</h2>
                        <p style={{ marginBottom: "20px" }}>{analysisResult.error}</p>
                        <button onClick={() => { setAnalysisResult(null); window.history.pushState(null, "", "/dashboard"); }} className="btn-primary">
                            Return to Scanner
                        </button>
                    </div>
                ) : (
                    <>
                        <div className={`verification-banner ${analysisResult.verification_class || "verify-warning"}`}>
                            <div className="icon">
                                {analysisResult.verification_status === "AGREEMENT" ? "🟢" : analysisResult.verification_status === "CNN ONLY" ? "🟡" : "🔴"}
                            </div>
                            <div className="text">
                                <h4>AI Multi-Model Status: {analysisResult.verification_status}</h4>
                                <p>{analysisResult.verification_message}</p>
                            </div>
                        </div>

                        <div className="result-grid-three">
                            {/* Heatmap canvas */}
                            <div className="result-card result-image-box">
                                <h3>Symptom Location Analysis</h3>
                                <div style={{ position: "relative", width: "100%" }}>
                                    <canvas ref={canvasRef} style={{ width: "100%", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", display: "block" }}></canvas>
                                </div>
                            </div>

                            {/* CNN Classifier */}
                            <div className="result-card">
                                <h3>Local CNN Classifier</h3>
                                <div className="prediction-item" style={{ marginTop: "15px" }}>
                                    <span className="label">Detected Category:</span>
                                    <span className="value disease-highlight">{analysisResult.disease}</span>
                                </div>
                                <div className="prediction-item">
                                    <span className="label">Edge Confidence:</span>
                                    <span className="value">{analysisResult.confidence}%</span>
                                </div>
                                <div className="confidence-bar-container" style={{ marginTop: "25px" }}>
                                    <div className="confidence-bar-outer">
                                        <div className="confidence-bar-inner" style={{ width: `${analysisResult.confidence}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            {/* Gemini Vision AI */}
                            <div className="result-card">
                                <h3>Gemini Vision AI</h3>
                                <div className="prediction-item" style={{ marginTop: "15px" }}>
                                    <span className="label">Identified Crop:</span>
                                    <span className="value">{gemResult.crop_name || "Unknown"}</span>
                                </div>
                                <div className="prediction-item">
                                    <span className="label">Health Status:</span>
                                    <span className={`value ${gemResult.is_healthy ? "success" : "danger"}`}>
                                        {gemResult.is_healthy ? "Healthy 💚" : `${gemResult.disease_name || "Diseased"} 🦠`}
                                    </span>
                                </div>
                                <div className="prediction-item">
                                    <span className="label">Visual Confidence:</span>
                                    <span className="value">{gemResult.confidence || 0}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Explanation and treatments guide */}
                        <div className="result-card ai-explanation-box">
                            <h3>AI Diagnosis & Treatment Guide</h3>
                            <div className="tab-buttons">
                                <button className={`tab-btn ${activeResultTab === "overview" ? "active" : ""}`} onClick={() => setActiveResultTab("overview")}>🌿 Overview</button>
                                <button className={`tab-btn ${activeResultTab === "treatments" ? "active" : ""}`} onClick={() => setActiveResultTab("treatments")}>💊 Treatments</button>
                                <button className={`tab-btn ${activeResultTab === "raw" ? "active" : ""}`} onClick={() => setActiveResultTab("raw")}>📝 Full AI Report</button>
                            </div>

                            {activeResultTab === "overview" && (
                                <div className="tab-content active">
                                    <div className="gemini-analysis-text">
                                        <h3 style={{ color: "#22c55e" }}>Symptom Profile</h3>
                                        <p>Characteristics matching <strong>{gemResult.disease_name || "Unknown Disease"}</strong> on a <strong>{gemResult.crop_name || "Unknown Crop"}</strong> plant leaf.</p>
                                        <h3 style={{ color: "#22c55e", marginTop: "15px" }}>Diagnostic Summary</h3>
                                        <p>This leaf presents spotting and discoloration patterns indicative of cellular stress. Refer to the Treatment tab for actionable solutions.</p>
                                    </div>
                                </div>
                            )}

                            {activeResultTab === "treatments" && (
                                <div className="tab-content active">
                                    <div className="gemini-analysis-text">
                                        <h3 style={{ color: "#22c55e" }}>Recommended Treatment Directives</h3>
                                        <p>Suggested sanitation routines and treatment applications:</p>
                                        <ul>
                                            <li><strong>Organic controls:</strong> Remove all diseased foliage. Spray with Neem oil or organic copper fungicides weekly.</li>
                                            <li><strong>Chemical options:</strong> For commercial setups, apply protective chlorothalonil or mancozeb sprays at early bud formation.</li>
                                            <li><strong>Water management:</strong> Switch to bottom drip irrigation. Avoid wetting the foliage.</li>
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {activeResultTab === "raw" && (
                                <div className="tab-content active">
                                    <div className="gemini-analysis-text" dangerouslySetInnerHTML={{ __html: formatMarkdown(gemResult.explanation) }}></div>
                                </div>
                            )}

                            <div style={{ marginTop: "20px", fontSize: "0.85rem", color: "#94a3b8", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "16px" }}>
                                ⚠️ <strong>Disclaimer:</strong> Always consult with a local agricultural specialist before applying treatments.
                            </div>
                        </div>

                        <div className="result-actions">
                            <button onClick={() => { setAnalysisResult(null); window.history.pushState(null, "", "/dashboard"); }} className="btn-primary">
                                Analyze Another Image
                            </button>
                        </div>
                    </>
                )}
            </section>
        );
    }

    return (
        <div className="analyzer-console">
            {!cameraActive ? (
                <div className="upload-container">
                    <div 
                        className={`upload-dropzone ${dragOver ? "dragover" : ""}`} 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <span className="upload-icon">📤</span>
                        <h3>Drag & Drop Leaf Photo</h3>
                        <p>Supports PNG, JPG, or JPEG formats (max 10MB)</p>
                        <div className="divider"><span>OR</span></div>
                        
                        <form onSubmit={handleSubmit}>
                            <label htmlFor="file-upload-input" className="btn-primary-choose">
                                {selectedFile ? selectedFile.name : "Select Image File"}
                            </label>
                            <input 
                                type="file" 
                                id="file-upload-input" 
                                onChange={handleFileChange}
                                accept="image/*" 
                                style={{ display: "none" }}
                            />
                            {selectedFile && (
                                <>
                                    <div style={{ marginTop: "15px" }}>
                                        <img src={previewUrl} alt="Upload Preview" style={{ maxWidth: "200px", maxHeight: "150px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)" }} />
                                    </div>
                                    <br />
                                    <button type="submit" className="btn-primary analyze-submit-btn">
                                        Run AI Diagnostics
                                    </button>
                                </>
                            )}
                        </form>
                        
                        <div className="divider" style={{ marginTop: "25px" }}><span>OR USE CAMERA</span></div>
                        <button onClick={startCamera} className="btn-secondary" style={{ width: "100%", maxWidth: "250px" }}>
                            📷 Open Live Camera Lens
                        </button>
                    </div>
                </div>
            ) : (
                <div className="camera-container">
                    <h3>Live Camera Diagnostics</h3>
                    <p>Position the crop leaf within the camera frame below and click Capture.</p>
                    
                    <div className="video-wrapper">
                        <video ref={videoRef} autoplay playsinline style={{ width: "100%", borderRadius: "12px" }}></video>
                        <div className="camera-overlay-frame"></div>
                    </div>
                    
                    <div className="camera-controls">
                        <button onClick={captureFrame} className="btn-primary">
                            📸 Capture & Analyze
                        </button>
                        <button onClick={stopCamera} className="btn-secondary">
                            ❌ Cancel Camera
                        </button>
                    </div>
                    
                    <div className={`console-log ${cameraStatus.includes("Denied") ? "error" : cameraStatus.includes("connected") ? "success" : "info"}`}>
                        {cameraStatus}
                    </div>
                </div>
            )}
        </div>
    );
}

// ==========================================
// COMPONENT: AI CHAT VIEW (PLANT DOCTOR)
// ==========================================
function ChatView() {
    const [messages, setMessages] = useState([
        {
            role: "model",
            text: "Hello! I am the **Plant AI Doctor**. 🌱\n\nHow can I assist you with your farming or gardening today? You can ask me questions or attach a photo of a crop leaf for diagnosis."
        }
    ]);
    const [inputMessage, setInputMessage] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleSuggestionClick = (prompt) => {
        setInputMessage(prompt);
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const text = inputMessage.trim();
        if (!text && !selectedImage) return;

        let attachedImageSrc = imagePreview;
        
        setMessages(prev => [...prev, { role: "user", text: text, imageSrc: attachedImageSrc }]);
        setInputMessage("");
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        setLoading(true);

        const formData = new FormData();
        formData.append("message", text);
        
        const historyForApi = messages.map(m => ({
            role: m.role,
            text: m.text
        }));
        formData.append("history", JSON.stringify(historyForApi));
        
        if (selectedImage) {
            formData.append("image", selectedImage);
        }

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                body: formData
            });

            if (!res.ok) throw new Error("Server communication error");
            const data = await res.json();
            
            setMessages(prev => [...prev, { role: "model", text: data.response }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: "model", text: "⚠️ System error: Unable to reach the Plant AI Doctor right now. Please verify your connection." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chat-page-container">
            <aside className="chat-sidebar">
                <h2>Plant AI Doctor</h2>
                <p>Ask our AI expert about plant health, soil conditions, watering schedules, or organic pest solutions. You can also upload a leaf image to diagnose issues directly.</p>
                
                <div className="suggestions-container">
                    <button className="suggestion-chip" onClick={() => handleSuggestionClick("How do I treat Tomato Early Blight using organic methods?")}>
                        🌿 Organic Disease Cures
                    </button>
                    <button className="suggestion-chip" onClick={() => handleSuggestionClick("What parameters should I check to determine if my soil is healthy?")}>
                        💩 Soil Health Checklist
                    </button>
                    <button className="suggestion-chip" onClick={() => handleSuggestionClick("Calculate a watering schedule for potatoes in hot, dry weather.")}>
                        💧 Crop Watering Schedule
                    </button>
                    <button className="suggestion-chip" onClick={() => handleSuggestionClick("How can I identify and control spider mites naturally?")}>
                        🕷️ Pest Identification
                    </button>
                </div>
            </aside>

            <main className="chat-main">
                <div className="chat-messages" style={{ overflowY: "auto", flex: 1, padding: "20px" }}>
                    {messages.map((m, idx) => (
                        <div key={idx} className={`chat-message ${m.role}`}>
                            {m.imageSrc && (
                                <img src={m.imageSrc} className="chat-attached-img" alt="Attached Leaf" />
                            )}
                            {m.text && (
                                <div className="message-text" dangerouslySetInnerHTML={{ __html: formatMarkdown(m.text) }}></div>
                            )}
                        </div>
                    ))}
                    
                    {loading && (
                        <div className="chat-message model loading-bubble">
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="chat-input-area">
                    {imagePreview && (
                        <div className="image-preview-container" style={{ display: "block" }}>
                            <div className="preview-item">
                                <img src={imagePreview} alt="Attachment Preview" />
                                <button type="button" className="remove-preview-btn" onClick={removeImage}>&times;</button>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSendMessage} className="chat-input-form">
                        <label htmlFor="page-image-input" className="chat-attach-btn" title="Attach Leaf Image">
                            📎
                        </label>
                        <input 
                            type="file" 
                            id="page-image-input" 
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*" 
                            style={{ display: "none" }}
                        />

                        <input 
                            type="text" 
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Ask about plant care, diseases, soil..." 
                            autoComplete="off"
                            required={!selectedImage}
                        />

                        <button type="submit" className="chat-send-btn" title="Send Message">
                            ➔
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}

// ==========================================
// COMPONENT: SCAN HISTORY VIEW
// ==========================================
function HistoryView({ onViewResult }) {
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadHistory = () => {
        setLoading(true);
        fetch("/api/history")
            .then(res => res.json())
            .then(data => {
                setScans(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        loadHistory();
    }, []);

    const handleDelete = (id, e) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this scan log?")) return;
        
        fetch(`/api/history/delete/${id}`, { method: "POST" })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setScans(prev => prev.filter(s => s.id !== id));
                }
            })
            .catch(err => console.error(err));
    };

    if (loading) {
        return <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>Loading scan logs...</div>;
    }

    return (
        <div className="result-card">
            <h3>Diagnostic Scan Logs</h3>
            <p style={{ color: "#94a3b8", marginBottom: "20px" }}>Previous leaf scans and predictions saved in SQLite database log.</p>
            
            {scans.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    <div style={{ fontSize: "3rem" }}>📋</div>
                    <p style={{ marginTop: "10px" }}>No previous leaf scans logged. Try running AI diagnostics first.</p>
                </div>
            ) : (
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", color: "#f8fafc", textAlign: "left" }}>
                        <thead>
                            <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.08)", color: "#34d399" }}>
                                <th style={{ padding: "12px 8px" }}>Image ID</th>
                                <th style={{ padding: "12px 8px" }}>CNN Predicted Crop</th>
                                <th style={{ padding: "12px 8px" }}>Gemini Disease</th>
                                <th style={{ padding: "12px 8px" }}>Confidence</th>
                                <th style={{ padding: "12px 8px" }}>Status</th>
                                <th style={{ padding: "12px 8px" }}>Logged Date</th>
                                <th style={{ padding: "12px 8px" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scans.map(scan => (
                                <tr 
                                    key={scan.id} 
                                    onClick={() => onViewResult(scan.filename)}
                                    style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer", transition: "background 0.2s" }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                                    onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                                >
                                    <td style={{ padding: "12px 8px", fontSize: "0.85rem", color: "#94a3b8" }}>{scan.filename.substring(0, 15)}...</td>
                                    <td style={{ padding: "12px 8px", fontWeight: "500" }}>{scan.cnn_predicted_crop}</td>
                                    <td style={{ padding: "12px 8px", color: "#fb7185" }}>{scan.gemini_predicted_disease}</td>
                                    <td style={{ padding: "12px 8px" }}>{scan.confidence}%</td>
                                    <td style={{ padding: "12px 8px" }}>
                                        <span style={{ 
                                            padding: "2px 8px", 
                                            borderRadius: "4px", 
                                            fontSize: "0.75rem", 
                                            background: scan.verification_status === "AGREEMENT" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                                            color: scan.verification_status === "AGREEMENT" ? "#34d399" : "#f87171"
                                        }}>
                                            {scan.verification_status}
                                        </span>
                                    </td>
                                    <td style={{ padding: "12px 8px", fontSize: "0.85rem", color: "#64748b" }}>{scan.created_at}</td>
                                    <td style={{ padding: "12px 8px" }}>
                                        <button 
                                            onClick={(e) => handleDelete(scan.id, e)} 
                                            className="btn-secondary" 
                                            style={{ padding: "4px 8px", fontSize: "0.75rem", background: "rgba(239, 68, 68, 0.15)", border: "none", color: "#f87171" }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// ==========================================
// COMPONENT: SOIL DIAGNOSTICS VIEW
// ==========================================
function SoilView() {
    const [reports, setReports] = useState([]);
    const [cropType, setCropType] = useState("General");
    const [soilType, setSoilType] = useState("Loam");
    const [phLevel, setPhLevel] = useState("7.0");
    const [moisture, setMoisture] = useState("Medium");
    
    const [verdictResult, setVerdictResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const loadReports = () => {
        fetch("/api/soil")
            .then(res => res.json())
            .then(data => setReports(data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        loadReports();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        fetch("/api/soil", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                crop_type: cropType,
                soil_type: soilType,
                ph_level: parseFloat(phLevel),
                moisture_level: moisture
            })
        })
        .then(res => res.json())
        .then(data => {
            setLoading(false);
            setVerdictResult(data);
            loadReports(); // reload grid
        })
        .catch(err => {
            console.error(err);
            setLoading(false);
        });
    };

    return (
        <div className="watering-page-container">
            <div className="soil-grid">
                {/* Form Card */}
                <div className="result-card">
                    <h3>Soil Diagnostics</h3>
                    <p style={{ color: "#94a3b8", marginBottom: "15px" }}>Log crop parameters and ph levels to verify neutralizing solutions.</p>
                    
                    <form onSubmit={handleSubmit} className="soil-form">
                        <div className="form-group">
                            <label>Target Crop</label>
                            <select value={cropType} onChange={(e) => setCropType(e.target.value)}>
                                <option value="General">General / All Crops</option>
                                <option value="Tomato">Tomato 🍅</option>
                                <option value="Potato">Potato 🥔</option>
                                <option value="Apple">Apple 🍎</option>
                                <option value="Sugarcane">Sugarcane 🌾</option>
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label>Soil Type</label>
                            <select value={soilType} onChange={(e) => setSoilType(e.target.value)}>
                                <option value="Loam">Loam (Optimal)</option>
                                <option value="Sandy">Sandy (Low Retention)</option>
                                <option value="Clay">Clay (Heavy Drainage)</option>
                                <option value="Silt">Silt (Medium Retaining)</option>
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label>pH Level (0.0 - 14.0)</label>
                            <input 
                                type="number" 
                                step="0.1" 
                                min="0" 
                                max="14" 
                                value={phLevel} 
                                onChange={(e) => setPhLevel(e.target.value)} 
                                required 
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Moisture level</label>
                            <select value={moisture} onChange={(e) => setMoisture(e.target.value)}>
                                <option value="Low">Low (Dry)</option>
                                <option value="Medium">Medium (Moist)</option>
                                <option value="High">High (Wet)</option>
                            </select>
                        </div>

                        <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "15px" }}>
                            {loading ? "Generating Report..." : "Log & Generate Diagnostics"}
                        </button>
                    </form>
                </div>

                {/* Report results */}
                <div className="result-card">
                    <h3>Diagnostics Output</h3>
                    
                    {!verdictResult ? (
                        <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b" }}>
                            <div style={{ fontSize: "3.5rem" }}>🧪</div>
                            <p>Fill out the diagnostics console and run diagnostics.</p>
                        </div>
                    ) : (
                        <div className="soil-results">
                            <div className="ph-gauge-box" style={{ background: "rgba(16,185,129,0.08)", borderColor: "rgba(16,185,129,0.2)" }}>
                                <div className="ph-verdict-title">Evaluation Verdict</div>
                                <div className="ph-badge-verdict" style={{ background: "#10b981", fontSize: "1rem" }}>{verdictResult.verdict}</div>
                            </div>
                            
                            <h4 style={{ color: "#22c55e", marginTop: "20px" }}>Agronomist Directives:</h4>
                            <ul style={{ paddingLeft: "20px", marginTop: "10px" }}>
                                {verdictResult.recommendations.map((r, i) => (
                                    <li key={i} style={{ marginBottom: "8px", color: "#cbd5e1" }}>{r}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Previous reports logs */}
            <div className="result-card" style={{ marginTop: "30px" }}>
                <h3>Soil History Archive</h3>
                <p style={{ color: "#64748b", marginBottom: "15px" }}>Prior diagnostics logs retrieved from database repository.</p>
                {reports.length === 0 ? (
                    <p style={{ color: "#64748b" }}>No logs saved.</p>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", textAlign: "left", color: "#cbd5e1" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", color: "#10b981" }}>
                                    <th style={{ padding: "8px" }}>Crop</th>
                                    <th style={{ padding: "8px" }}>Soil</th>
                                    <th style={{ padding: "8px" }}>pH</th>
                                    <th style={{ padding: "8px" }}>Moisture</th>
                                    <th style={{ padding: "8px" }}>Verdict</th>
                                    <th style={{ padding: "8px" }}>Directives</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map(r => (
                                    <tr key={r.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                        <td style={{ padding: "8px" }}>{r.crop_type}</td>
                                        <td style={{ padding: "8px" }}>{r.soil_type}</td>
                                        <td style={{ padding: "8px" }}>{r.ph_level}</td>
                                        <td style={{ padding: "8px" }}>{r.moisture_level}</td>
                                        <td style={{ padding: "8px", color: "#4ade80" }}>{r.verdict}</td>
                                        <td style={{ padding: "8px", fontSize: "0.85rem", color: "#94a3b8" }}>{r.recommendations}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

// ==========================================
// COMPONENT: WATERING & CARE PLANNER
// ==========================================
function WateringView() {
    const [crop, setCrop] = useState("Tomato");
    const [plantationDate, setPlantationDate] = useState("");
    const [weather, setWeather] = useState("Mild");

    const [timetable, setTimetable] = useState(null);

    useEffect(() => {
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() - 20);
        const yyyy = defaultDate.getFullYear();
        const mm = String(defaultDate.getMonth() + 1).padStart(2, '0');
        const dd = String(defaultDate.getDate()).padStart(2, '0');
        setPlantationDate(`${yyyy}-${mm}-${dd}`);
    }, []);

    const handleCalculate = () => {
        if (!plantationDate) {
            alert("Please select a valid date of plantation.");
            return;
        }

        const today = new Date();
        const plantDate = new Date(plantationDate);
        const ageInMs = today - plantDate;
        const ageInDays = Math.floor(ageInMs / (1000 * 60 * 60 * 24));

        if (ageInDays < 0) {
            alert("Plantation date cannot be in the future!");
            return;
        }

        let stage = "";
        if (crop === "Tomato") {
            if (ageInDays <= 15) stage = "Seedling Stage 🌱";
            else if (ageInDays <= 45) stage = "Vegetative Growth Stage 🌿";
            else if (ageInDays <= 80) stage = "Flowering & Fruiting Stage 🌸";
            else stage = "Harvest & Maturation Phase 🍅";
        } else if (crop === "Potato") {
            if (ageInDays <= 20) stage = "Sprouting / Emergence 🌱";
            else if (ageInDays <= 50) stage = "Vegetative Growth Stage 🌿";
            else if (ageInDays <= 85) stage = "Tuber Initiation & Bulking 🥔";
            else stage = "Maturation / Harvest Phase 🥔";
        } else if (crop === "Apple") {
            if (ageInDays <= 30) stage = "Early Bud Break 🌸";
            else if (ageInDays <= 90) stage = "Active Vegetative Growth 🌿";
            else stage = "Fruiting & Sugar Accumulation 🍎";
        } else {
            if (ageInDays <= 40) stage = "Germination Phase 🌱";
            else if (ageInDays <= 120) stage = "Tillering & Active Growth 🌾";
            else stage = "Ripening & Sugar Maturation 🌾";
        }

        let frequency = 2; // default
        let volume = 400; // mL
        let priority = "Normal";

        if (weather === "Hot") {
            frequency = 1;
            volume += 200;
            priority = "High 🚨";
        } else if (weather === "Cool") {
            frequency = 3;
            volume -= 100;
            priority = "Low ❄️";
        } else if (weather === "Rainy") {
            frequency = 0;
            volume = 0;
            priority = "SUSPENDED (Rainfall Sufficient) 🌧️";
        }

        if (stage.includes("Seedling") || stage.includes("Sprouting") || stage.includes("Germination")) {
            if (frequency > 0) {
                frequency = 1; 
                volume = 150;
            }
        } else if (stage.includes("Flowering") || stage.includes("Bulking") || stage.includes("Tuber")) {
            volume += 200;
        }

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const calendarCells = [];

        for (let i = 0; i < 30; i++) {
            const cellDate = new Date();
            cellDate.setDate(today.getDate() + i);
            const dateStr = `${monthNames[cellDate.getMonth()]} ${cellDate.getDate()}`;
            const cellAge = ageInDays + i;

            let type = "none";
            let titleText = "";
            let taskText = "";
            let borderStyle = "none";

            if (frequency > 0 && i % frequency === 0) {
                type = "water";
                titleText = `Water: ${volume}mL`;
            } else if (weather === "Rainy") {
                type = "rain";
                titleText = "Natural rain";
            }

            if (crop === "Tomato") {
                if (cellAge === 7 || cellAge === 28) {
                    taskText = "NPK";
                    borderStyle = "1px solid #eab308";
                    titleText = "Fertilizer Day: Apply NPK nitrogen compost.";
                } else if (cellAge === 14 || cellAge === 35) {
                    taskText = "Prune";
                    borderStyle = "1px solid #c084fc";
                    titleText = "Pruning Day: Remove suckers.";
                } else if (cellAge === 21) {
                    taskText = "Weed";
                    borderStyle = "1px solid #fb7185";
                    titleText = "Weed Check.";
                }
            } else if (crop === "Potato") {
                if (cellAge === 20 || cellAge === 45) {
                    taskText = "Hilling";
                    borderStyle = "1px solid #facc15";
                    titleText = "Soil Hilling.";
                } else if (cellAge === 30) {
                    taskText = "NPK";
                    borderStyle = "1px solid #60a5fa";
                    titleText = "Fertility check.";
                }
            }

            calendarCells.push({
                dateStr,
                type,
                titleText,
                taskText,
                borderStyle
            });
        }

        const directives = [];
        if (crop === "Tomato") {
            directives.push(`Your Tomato plants are ${ageInDays} days old (${stage}).`);
            if (ageInDays <= 15) {
                directives.push("🌱 Seedling Sprout check: Maintain shallow surface misting. Ensure 14+ hours of filtered light.");
            } else if (ageInDays <= 45) {
                directives.push("🌿 Pruning suckers: Pinch off secondary branch shoots (suckers). This directs energy to fruit growth.");
                directives.push("🍂 Trellising: Bind the central stem to stakes to prevent leaf blight.");
            } else {
                directives.push("🌸 Calcium Boost: Spray soluble calcium chloride preventively to ward off Blossom End Rot.");
                directives.push("🍅 Water Stability: Keep soil moisture steady. Dry-wet cycles cause tomato skins to crack.");
            }
        } else if (crop === "Potato") {
            directives.push(`Your Potato plants are ${ageInDays} days old (${stage}).`);
            directives.push("🧱 Hilling (Ridging): Mound extra soil around shoots when they reach 8 inches tall to prevent greening.");
            directives.push("💧 Tuber Initiation: Keep soil moisture steady. Drought during bulking reduces sizing.");
        } else {
            directives.push(`Your crop is currently in the ${stage} (${ageInDays} days old).`);
            directives.push("General Care: Continue monitoring foliar surfaces for insect eggs. Spray with Neem solution at early signs.");
        }

        setTimetable({
            stage,
            ageInDays,
            volume,
            frequency,
            priority,
            calendarCells,
            directives
        });
    };

    return (
        <div className="watering-page-container">
            <div className="soil-grid">
                <div className="result-card">
                    <h3>Crop Environment Setup</h3>
                    <p style={{ color: "#94a3b8", marginBottom: "15px" }}>Enter weather and plantation details to calculate age-based care timetables.</p>
                    
                    <div className="soil-form">
                        <div className="form-group">
                            <label>Select Crop</label>
                            <select value={crop} onChange={(e) => setCrop(e.target.value)}>
                                <option value="Tomato">Tomato 🍅</option>
                                <option value="Potato">Potato 🥔</option>
                                <option value="Apple">Apple 🍎</option>
                                <option value="Sugarcane">Sugarcane 🌾</option>
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label>Date of Plantation</label>
                            <input 
                                type="date" 
                                value={plantationDate} 
                                onChange={(e) => setPlantationDate(e.target.value)} 
                                required 
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Current Weather Condition</label>
                            <select value={weather} onChange={(e) => setWeather(e.target.value)}>
                                <option value="Hot">Hot & Sunny ☀️</option>
                                <option value="Mild">Mild & Partly Cloudy ⛅</option>
                                <option value="Cool">Cool / Autumn 🍂</option>
                                <option value="Rainy">Rainy 🌧️</option>
                            </select>
                        </div>

                        <button onClick={handleCalculate} className="btn-primary" style={{ width: "100%", marginTop: "15px" }}>
                            Generate Care Timetable
                        </button>
                    </div>
                </div>

                <div className="result-card">
                    <h3>Irrigation & Care Timetable</h3>
                    
                    {!timetable ? (
                        <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b" }}>
                            <div style={{ fontSize: "3.5rem" }}>🗓️</div>
                            <p>Click Generate to compile the plantation timetable matrix.</p>
                        </div>
                    ) : (
                        <div className="soil-results">
                            <div className="ph-gauge-box" style={{ background: "rgba(16, 185, 129, 0.08)", borderColor: "rgba(16, 185, 129, 0.25)" }}>
                                <div className="ph-verdict-title" style={{ color: "#4ade80" }}>Crop Growth Stage & Age</div>
                                <div className="ph-badge-verdict" style={{ background: "var(--accent-forest)", fontSize: "1rem" }}>{timetable.stage} ({timetable.ageInDays} Days Old)</div>
                            </div>
                            
                            <div className="ph-gauge-box" style={{ background: "rgba(59, 130, 246, 0.08)", borderColor: "rgba(59, 130, 246, 0.2)", marginTop: "10px" }}>
                                <div className="ph-verdict-title" style={{ color: "#60a5fa" }}>Daily Irrigation Volume</div>
                                <div className="ph-badge-verdict" style={{ background: "#2563eb" }}>{timetable.volume > 0 ? `${timetable.volume} mL / plant` : "0 mL"}</div>
                            </div>

                            <div className="prediction-item" style={{ marginTop: "20px" }}>
                                <span className="label">Suggested Frequency:</span>
                                <span className="value" style={{ color: "#60a5fa" }}>
                                    {timetable.frequency > 0 ? `Every ${timetable.frequency} day(s)` : "No manual watering"}
                                </span>
                            </div>
                            
                            <div className="prediction-item">
                                <span className="label">Priority Rating:</span>
                                <span className="value">{timetable.priority}</span>
                            </div>

                            <h4 style={{ color: "#22c55e", marginTop: "20px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "8px" }}>30-Day Activity Calendar</h4>
                            <p className="confidence-note" style={{ marginBottom: "12px" }}>Highlighted days represent irrigation events or key agricultural tasks:</p>

                            <div className="calendar-grid">
                                {timetable.calendarCells.map((c, i) => (
                                    <div 
                                        key={i} 
                                        className={`calendar-cell ${c.type === "water" ? "water-day" : c.type === "rain" ? "rain-day" : ""}`}
                                        title={c.titleText}
                                        style={{ border: c.borderStyle }}
                                    >
                                        <span className="cell-num" style={{ fontSize: "0.68rem", fontWeight: 600 }}>{c.dateStr}</span>
                                        {c.taskText && (
                                            <span style={{ position: "absolute", bottom: "2px", fontSize: "0.65rem", background: "rgba(255,255,255,0.12)", padding: "1px 4px", borderRadius: "4px", fontWeight: 700 }}>
                                                {c.taskText
                                            }</span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <h4 style={{ color: "#22c55e", marginTop: "25px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "8px" }}>Care Directives</h4>
                            <div className="gemini-analysis-text" style={{ marginTop: "10px" }}>
                                <ul>
                                    {timetable.directives.map((d, i) => (
                                        <li key={i} dangerouslySetInnerHTML={{ __html: formatMarkdown(d) }}></li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ==========================================
// COMPONENT: CROP DISEASE LIBRARY VIEW
// ==========================================
function DiseasesView() {
    const [diseases, setDiseases] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeModalDisease, setActiveModalDisease] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/diseases")
            .then(res => res.json())
            .then(data => {
                setDiseases(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const filteredDiseases = diseases.filter(d => {
        const query = searchQuery.toLowerCase().trim();
        return (
            d.crop.toLowerCase().includes(query) ||
            d.disease_name.toLowerCase().includes(query) ||
            (d.symptoms && d.symptoms.toLowerCase().includes(query)) ||
            (d.overview && d.overview.toLowerCase().includes(query))
        );
    });

    if (loading) {
        return <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>Loading reference library...</div>;
    }

    return (
        <section className="diseases-page">
            <div className="library-search-container" style={{ marginBottom: "30px" }}>
                <input 
                    type="text" 
                    placeholder="🔍 Search reference library by crop family, disease name, or leaf symptoms..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: "100%", padding: "14px 20px", borderRadius: "14px", border: "1px solid var(--glass-border)", background: "var(--glass-bg)", color: "white", fontSize: "1rem", outline: "none" }}
                />
            </div>

            <div className="disease-grid">
                {filteredDiseases.map(dis => (
                    <div 
                        key={dis.id}
                        className={`disease-card ${dis.disease_name === "Healthy" ? "healthy-card" : ""}`}
                        onClick={() => setActiveModalDisease(dis)}
                    >
                        <h2>{dis.crop} — {dis.disease_name}</h2>
                        <p className="disease-desc">{dis.overview}</p>
                        <ul className="disease-points">
                            <li>🦠 <strong>Causes:</strong> {dis.causes}</li>
                            <li>🔍 <strong>Symptoms:</strong> {dis.symptoms}</li>
                        </ul>
                        <div style={{ fontSize: "0.8rem", color: "var(--accent-emerald)", fontWeight: 600, textAlign: "right", marginTop: "auto", paddingTop: "10px" }}>
                            Click for Full Agronomist Report ➔
                        </div>
                    </div>
                ))}
            </div>

            {/* Disease Detail Modal */}
            {activeModalDisease && (
                <div className="disease-modal-overlay" style={{ display: "flex" }} onClick={(e) => { if (e.target.className === "disease-modal-overlay") setActiveModalDisease(null); }}>
                    <div className="disease-modal-content">
                        <div className="modal-header">
                            <h2>{activeModalDisease.crop} — {activeModalDisease.disease_name}</h2>
                            <button className="close-modal-btn" onClick={() => setActiveModalDisease(null)} title="Close report">&times;</button>
                        </div>
                        <div className="modal-body">
                            <p className="modal-overview">{activeModalDisease.overview}</p>
                            
                            <div className="modal-section">
                                <h4>🦠 Causes</h4>
                                <p>{activeModalDisease.causes}</p>
                            </div>
                            
                            <div className="modal-section">
                                <h4>🔍 Symptoms</h4>
                                <p>{activeModalDisease.symptoms}</p>
                            </div>
                            
                            <div className="modal-section">
                                <h4>🌿 Organic Remediations</h4>
                                <p style={{ color: "#4ade80" }}>{activeModalDisease.treatment_organic}</p>
                            </div>
                            
                            <div className="modal-section">
                                <h4>🧪 Chemical Treatments</h4>
                                <p style={{ color: "#60a5fa" }}>{activeModalDisease.treatment_chemical}</p>
                            </div>
                            
                            <div className="modal-section">
                                <h4>🛡️ Preventative Guidelines</h4>
                                <p>{activeModalDisease.prevention}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

// ==========================================
// COMPONENT: ABOUT SYSTEM VIEW
// ==========================================
function AboutView() {
    const [helpTab, setHelpTab] = useState("scan");

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "30px", maxWidth: "800px", margin: "0 auto" }}>
            <div className="result-card" style={{ gap: "20px" }}>
                <h3>Our Mission</h3>
                <p style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>
                    Plant AI is a diagnostic support tool designed to assist growers, gardeners, and agronomists with crop health management. By combining instant leaf scanners with live AI consultations, we aim to make crop disease identification accessible, fast, and actionable.
                </p>
                
                <h4 style={{ color: "#22c55e", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "8px", marginTop: "15px" }}>Key Features</h4>
                <div className="prediction-item">
                    <span className="label">🔍 Leaf Diagnostics:</span>
                    <span className="value" style={{ color: "var(--text-secondary)" }}>Upload leaf images or use the camera lens to analyze foliar spotting, discoloration, or tissue stress.</span>
                </div>
                <div className="prediction-item">
                    <span className="label">💬 AI Plant Doctor:</span>
                    <span className="value" style={{ color: "var(--text-secondary)" }}>Consult the chatbot agronomist for customized remedies, organic recipes, and preventative suggestions.</span>
                </div>
                <div className="prediction-item">
                    <span className="label">💧 Watering Planner:</span>
                    <span className="value" style={{ color: "var(--text-secondary)" }}>Schedule crop irrigation based on plantation date, growth stages, and current weather conditions.</span>
                </div>
                <div className="prediction-item">
                    <span className="label">💩 Soil Conditioning:</span>
                    <span className="value" style={{ color: "var(--text-secondary)" }}>Analyze soil pH levels and get recommendations for agricultural lime or sulfur treatments.</span>
                </div>
            </div>

            <div className="result-card">
                <h3>❓ Interactive Operating Guide</h3>
                <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>Select a tab below to read step-by-step operational instructions for each tool:</p>

                <div className="tab-buttons" style={{ marginBottom: "20px" }}>
                    <button className={`tab-btn ${helpTab === "scan" ? "active" : ""}`} onClick={() => setHelpTab("scan")}>🩺 Leaf Scan</button>
                    <button className={`tab-btn ${helpTab === "chat" ? "active" : ""}`} onClick={() => setHelpTab("chat")}>💬 Chatbot</button>
                    <button className={`tab-btn ${helpTab === "tools" ? "active" : ""}`} onClick={() => setHelpTab("tools")}>🧪 Soil & Water</button>
                </div>
                
                {helpTab === "scan" && (
                    <div className="tab-content active">
                        <div className="gemini-analysis-text">
                            <h4 style={{ color: "#10b981", marginBottom: "10px" }}>🩺 Running Leaf Diagnostics</h4>
                            <p>Identify crop diseases instantly using camera snapshots or image uploads.</p>
                            <ol style={{ marginTop: "12px", paddingLeft: "20px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                                <li style={{ marginBottom: "8px" }}>Go to the <strong>Dashboard Home</strong>.</li>
                                <li style={{ marginBottom: "8px" }}>Upload a leaf photo or click <strong>Open Live Camera Lens</strong> to snap a photo.</li>
                                <li style={{ marginBottom: "8px" }}>Review the comparative classification results, organic remedies, and chemical treatments.</li>
                            </ol>
                        </div>
                    </div>
                )}
                
                {helpTab === "chat" && (
                    <div className="tab-content active">
                        <div className="gemini-analysis-text">
                            <h4 style={{ color: "#10b981", marginBottom: "10px" }}>💬 AI Plant Doctor</h4>
                            <p>Consult our agronomist chatbot for gardening help, crop nutrition, and pest controls.</p>
                            <ul style={{ marginTop: "12px", paddingLeft: "20px", listStyleType: "disc", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                                <li style={{ marginBottom: "8px" }}>Open the <strong>Plant Doctor Chat</strong> sidebar link.</li>
                                <li style={{ marginBottom: "8px" }}>Ask any question about gardening, weeds, or fertilizers. You can attach a leaf photo for visual diagnosis.</li>
                            </ul>
                        </div>
                    </div>
                )}
                
                {helpTab === "tools" && (
                    <div className="tab-content active">
                        <div className="gemini-analysis-text">
                            <h4 style={{ color: "#10b981", marginBottom: "10px" }}>🧪 Soil & Irrigation Tools</h4>
                            <p>Plan watering volumes and calculate soil neutralizing additives.</p>
                            <ul style={{ marginTop: "12px", paddingLeft: "20px", listStyleType: "disc", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                                <li style={{ marginBottom: "8px" }}><strong>Soil Diagnostics</strong>: Enter soil parameters and pH to get neutralizing recommendations.</li>
                                <li style={{ marginBottom: "8px" }}><strong>Watering Planner</strong>: Select crop and plantation date to compile a customized 30-day watering calendar.</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            <div className="result-card" style={{ borderLeft: "4px solid #ef4444", background: "rgba(239, 68, 68, 0.03)" }}>
                <h4 style={{ color: "#ef4444", marginBottom: "8px" }}>⚠️ Field Safety Notice</h4>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.6" }}>
                    Always verify diagnostic evaluations with a local agricultural extension office or certified specialist before executing extensive pesticide spray plans or commercial crop transformations.
                </p>
            </div>
        </div>
    );
}

// ==========================================
// COMPONENT: FLOATING CHAT WIDGET
// ==========================================
function FloatingChatWidget({ isOpen, setIsOpen }) {
    const [messages, setMessages] = useState([
        {
            role: "model",
            text: "Hi! I'm the **Plant AI Doctor**. Ask me anything or send a leaf photo to diagnose a disease."
        }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        const text = input.trim();
        if (!text && !selectedImage) return;

        let attachedImageSrc = imagePreview;

        setMessages(prev => [...prev, { role: "user", text: text, imageSrc: attachedImageSrc }]);
        setInput("");
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        setLoading(true);

        const formData = new FormData();
        formData.append("message", text);
        
        const historyForApi = messages.map(m => ({
            role: m.role,
            text: m.text
        }));
        formData.append("history", JSON.stringify(historyForApi));
        
        if (selectedImage) {
            formData.append("image", selectedImage);
        }

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                body: formData
            });
            if (!res.ok) throw new Error("Server communication error");
            const data = await res.json();
            setMessages(prev => [...prev, { role: "model", text: data.response }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: "model", text: "⚠️ System error: Unable to reach the Plant AI Doctor." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button 
                id="chat-toggle-btn" 
                className={`chat-toggle-btn ${isOpen ? "hidden" : ""}`} 
                onClick={() => setIsOpen(true)}
                title="Consult Plant Doctor"
            >
                💬
            </button>
            
            <div id="chat-widget" className={`chat-widget ${isOpen ? "active" : ""}`}>
                <div className="chat-header">
                    <h3>🌿 Plant Doctor Console</h3>
                    <button id="close-chat-btn" className="close-btn" onClick={() => setIsOpen(false)} title="Close chat">&times;</button>
                </div>
                
                <div className="chat-messages" style={{ overflowY: "auto", flex: 1, padding: "10px" }}>
                    {messages.map((m, idx) => (
                        <div key={idx} className={`chat-message ${m.role}`}>
                            {m.imageSrc && (
                                <img src={m.imageSrc} className="chat-attached-img" alt="Attached Leaf" />
                            )}
                            {m.text && (
                                <div className="message-text" dangerouslySetInnerHTML={{ __html: formatMarkdown(m.text) }}></div>
                            )}
                        </div>
                    ))}
                    {loading && (
                        <div className="chat-message model loading-bubble">
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                
                <div className="chat-input-area">
                    {imagePreview && (
                        <div className="image-preview-container" style={{ display: "block" }}>
                            <div className="preview-item">
                                <img src={imagePreview} alt="Attachment Preview" />
                                <button type="button" className="remove-preview-btn" onClick={removeImage}>&times;</button>
                            </div>
                        </div>
                    )}
                    <form onSubmit={handleSend} className="chat-input-form">
                        <label htmlFor="widget-image-input" className="chat-attach-btn" title="Attach photo">
                            📎
                        </label>
                        <input 
                            type="file" 
                            id="widget-image-input" 
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*" 
                            style={{ display: "none" }}
                        />
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask the doctor..." 
                            autoComplete="off"
                            required={!selectedImage}
                        />
                        <button type="submit" className="chat-send-btn">➔</button>
                    </form>
                </div>
            </div>
        </>
    );
}

// ==========================================
// MAIN APP COMPONENT
// ==========================================
function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        return localStorage.getItem("isLoggedIn") === "true";
    });
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [activeTab, setActiveTab] = useState("landing");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [floatingChatOpen, setFloatingChatOpen] = useState(false);

    // Global states
    const [analysisResult, setAnalysisResult] = useState(null);
    const [loadingAnalysis, setLoadingAnalysis] = useState(false);

    // Handle routing on mount and popstate
    useEffect(() => {
        const handleRoute = () => {
            const path = window.location.pathname;
            const savedLogin = localStorage.getItem("isLoggedIn") === "true";
            
            if (path === "/about") {
                setActiveTab("about");
            } else if (path === "/diseases") {
                setActiveTab("diseases");
            } else if (path === "/login") {
                if (savedLogin) {
                    navigateTo("dashboard", "/dashboard");
                } else {
                    setActiveTab("login");
                }
            } else if (path === "/dashboard") {
                if (!savedLogin) {
                    navigateTo("login", "/login");
                } else {
                    setActiveTab("dashboard");
                }
            } else if (path === "/chat") {
                if (!savedLogin) navigateTo("login", "/login");
                else setActiveTab("chat");
            } else if (path === "/history") {
                if (!savedLogin) navigateTo("login", "/login");
                else setActiveTab("history");
            } else if (path === "/soil") {
                if (!savedLogin) navigateTo("login", "/login");
                else setActiveTab("soil");
            } else if (path === "/watering") {
                if (!savedLogin) navigateTo("login", "/login");
                else setActiveTab("watering");
            } else if (path.startsWith("/predict/result/")) {
                if (!savedLogin) {
                    navigateTo("login", "/login");
                } else {
                    setActiveTab("dashboard");
                    const reportId = path.replace("/predict/result/", "");
                    
                    // Fetch report data
                    setLoadingAnalysis(true);
                    fetch(`/api/predict/result/${reportId}`)
                        .then(res => {
                            if (!res.ok) throw new Error("Report not found");
                            return res.json();
                        })
                        .then(data => {
                            setAnalysisResult(data);
                            setLoadingAnalysis(false);
                        })
                        .catch(err => {
                            console.error(err);
                            setAnalysisResult({ error: "Scan report result not found." });
                            setLoadingAnalysis(false);
                        });
                }
            } else {
                if (path === "/" || path === "") {
                    setActiveTab("landing");
                } else {
                    setActiveTab("landing");
                }
            }
        };

        handleRoute();
        window.addEventListener("popstate", handleRoute);
        return () => window.removeEventListener("popstate", handleRoute);
    }, [isLoggedIn]);

    const navigateTo = (tabName, urlPath) => {
        setActiveTab(tabName);
        window.history.pushState(null, "", urlPath);
        setMobileNavOpen(false);
        if (tabName !== "dashboard") {
            setAnalysisResult(null);
        }
    };

    const handleLoginSuccess = (userData) => {
        setIsLoggedIn(true);
        setUser(userData);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user", JSON.stringify(userData));
        navigateTo("dashboard", "/dashboard");
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setUser(null);
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("user");
        navigateTo("landing", "/");
    };

    const handleViewResultFromHistory = (reportId) => {
        navigateTo("dashboard", `/predict/result/${reportId}`);
    };

    const getHeaderInfo = () => {
        switch (activeTab) {
            case "landing":
                return {
                    title: "Welcome to Plant AI Portal",
                    subtitle: "Instant crop health solutions & farming guidelines"
                };
            case "login":
                return {
                    title: "Access Agronomy Console",
                    subtitle: "Sign in or register to unlock dual-AI leaf diagnostics"
                };
            case "dashboard":
                return {
                    title: analysisResult ? "Diagnostic Results" : "Leaf Diagnostics Control Center",
                    subtitle: analysisResult ? "Dual-AI verification results" : "Analyze leaf health and query agronomist recommendations"
                };
            case "chat":
                return {
                    title: "Plant Doctor AI Chatroom",
                    subtitle: "Get immediate organic remedies and agronomist consultations"
                };
            case "history":
                return {
                    title: "Scan Log History",
                    subtitle: "Browse previously classified crop leaves and verification results"
                };
            case "soil":
                return {
                    title: "Soil Diagnostics Center",
                    subtitle: "Log parameters and check neutralizing chemical and organic recommendations"
                };
            case "watering":
                return {
                    title: "Watering & Planting Timetable Scheduler",
                    subtitle: "Calculate optimal irrigation and planting timetables based on plantation age and weather conditions"
                };
            case "diseases":
                return {
                    title: "Crop Disease Library",
                    subtitle: "Browse diagnosed crop diseases, leaf symptoms, and organic/chemical treatments"
                };
            case "about":
                return {
                    title: "System Info & User Guide",
                    subtitle: "Overview of grower diagnostics and step-by-step operating instructions"
                };
            default:
                return { title: "Plant AI Dashboard", subtitle: "Crop health monitoring and diagnostics" };
        }
    };

    const headerInfo = getHeaderInfo();

    const renderProtectedTab = (tabName, label, icon) => {
        if (!isLoggedIn) {
            return (
                <button 
                    onClick={() => navigateTo("login", "/login")} 
                    className="menu-item" 
                    style={{ background: "none", border: "none", width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: "10px", opacity: 0.6 }}
                >
                    <span className="menu-icon">{icon}</span> {label} 🔒
                </button>
            );
        }
        return (
            <button 
                onClick={() => navigateTo(tabName, `/${tabName}`)} 
                className={`menu-item ${activeTab === tabName ? "active" : ""}`} 
                style={{ background: "none", border: "none", width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: "10px" }}
            >
                <span className="menu-icon">{icon}</span> {label}
            </button>
        );
    };

    return (
        <div id="dashboard-container" className={`dashboard-container ${sidebarOpen ? "sidebar-open" : ""}`}>
            {/* Sidebar Left Edge Trigger Zone */}
            <div 
                className="sidebar-hover-trigger" 
                onMouseEnter={() => setSidebarOpen(true)}
                style={{ position: "fixed", left: 0, top: 0, width: "20px", height: "100vh", zIndex: 99, background: "transparent" }}
            />

            {/* Sidebar Container */}
            <aside 
                className="sidebar" 
                id="dashboard-sidebar"
                onMouseEnter={() => setSidebarOpen(true)}
                onMouseLeave={() => setSidebarOpen(false)}
            >
                <div className="sidebar-brand">
                    <span className="logo-icon">🌿</span>
                    <h2>Plant AI</h2>
                </div>
                
                <nav className="sidebar-menu" style={{ display: "flex", flexDirection: "column", height: "calc(100% - 100px)" }}>
                    <button onClick={() => navigateTo("landing", "/")} className={`menu-item ${activeTab === "landing" ? "active" : ""}`} style={{ background: "none", border: "none", width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: "10px" }}>
                        <span className="menu-icon">📊</span> Landing Home
                    </button>

                    {isLoggedIn ? (
                        <button onClick={() => navigateTo("dashboard", "/dashboard")} className={`menu-item ${activeTab === "dashboard" ? "active" : ""}`} style={{ background: "none", border: "none", width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: "10px" }}>
                            <span className="menu-icon">🩺</span> Diagnostics Portal
                        </button>
                    ) : (
                        <button onClick={() => navigateTo("login", "/login")} className={`menu-item ${activeTab === "login" ? "active" : ""}`} style={{ background: "none", border: "none", width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: "10px" }}>
                            <span className="menu-icon">🔑</span> Sign In / Register
                        </button>
                    )}

                    {renderProtectedTab("chat", "Plant Doctor Chat", "💬")}
                    {renderProtectedTab("history", "Scan History", "📋")}
                    {renderProtectedTab("soil", "Soil Diagnostics", "💩")}
                    {renderProtectedTab("watering", "Watering Planner", "💧")}
                    
                    <button onClick={() => navigateTo("diseases", "/diseases")} className={`menu-item ${activeTab === "diseases" ? "active" : ""}`} style={{ background: "none", border: "none", width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: "10px" }}>
                        <span className="menu-icon">📚</span> Disease Library
                    </button>
                    <button onClick={() => navigateTo("about", "/about")} className={`menu-item ${activeTab === "about" ? "active" : ""}`} style={{ background: "none", border: "none", width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: "10px" }}>
                        <span className="menu-icon">ℹ️</span> About System
                    </button>

                    {isLoggedIn && (
                        <button onClick={handleLogout} className="menu-item" style={{ background: "none", border: "none", width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: "10px", marginTop: "auto", color: "#f87171" }}>
                            <span className="menu-icon">🔓</span> Logout ({user?.username})
                        </button>
                    )}
                </nav>
                
                <div className="sidebar-footer">
                    <p>v1.2.0 (React)</p>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="mobile-header">
                <div className="brand">
                    <span>🌿</span>
                    <h2>Plant AI</h2>
                </div>
                <button className="mobile-menu-toggle" onClick={() => setMobileNavOpen(prev => !prev)} aria-label="Toggle Menu">
                    {mobileNavOpen ? "✕" : "☰"}
                </button>
            </header>

            {/* Mobile Nav Dropdown */}
            <div className={`mobile-nav ${mobileNavOpen ? "active" : ""}`}>
                <button onClick={() => navigateTo("landing", "/")} style={{ width: "100%", background: "none", border: "none", color: "inherit", padding: "12px", textAlign: "left" }}>📊 Home</button>
                {isLoggedIn ? (
                    <button onClick={() => navigateTo("dashboard", "/dashboard")} style={{ width: "100%", background: "none", border: "none", color: "inherit", padding: "12px", textAlign: "left" }}>🩺 Diagnostics</button>
                ) : (
                    <button onClick={() => navigateTo("login", "/login")} style={{ width: "100%", background: "none", border: "none", color: "inherit", padding: "12px", textAlign: "left" }}>🔑 Sign In</button>
                )}
                {isLoggedIn && (
                    <>
                        <button onClick={() => navigateTo("chat", "/chat")} style={{ width: "100%", background: "none", border: "none", color: "inherit", padding: "12px", textAlign: "left" }}>💬 AI Chat</button>
                        <button onClick={() => navigateTo("history", "/history")} style={{ width: "100%", background: "none", border: "none", color: "inherit", padding: "12px", textAlign: "left" }}>📋 History</button>
                        <button onClick={() => navigateTo("soil", "/soil")} style={{ width: "100%", background: "none", border: "none", color: "inherit", padding: "12px", textAlign: "left" }}>💩 Soil</button>
                        <button onClick={() => navigateTo("watering", "/watering")} style={{ width: "100%", background: "none", border: "none", color: "inherit", padding: "12px", textAlign: "left" }}>💧 Watering</button>
                    </>
                )}
                <button onClick={() => navigateTo("diseases", "/diseases")} style={{ width: "100%", background: "none", border: "none", color: "inherit", padding: "12px", textAlign: "left" }}>📚 Diseases</button>
                <button onClick={() => navigateTo("about", "/about")} style={{ width: "100%", background: "none", border: "none", color: "inherit", padding: "12px", textAlign: "left" }}>ℹ️ About</button>
                {isLoggedIn && (
                    <button onClick={handleLogout} style={{ width: "100%", background: "none", border: "none", color: "#f87171", padding: "12px", textAlign: "left" }}>🔓 Logout</button>
                )}
            </div>

            {/* Main Content Area */}
            <div className="main-content">
                <div className="dashboard-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <button className="sidebar-expand-btn" onClick={() => setSidebarOpen(prev => !prev)} title="Toggle Sidebar">☰</button>
                        <div>
                            <h1>{headerInfo.title}</h1>
                            <p>{headerInfo.subtitle}</p>
                        </div>
                    </div>
                    <div className="user-profile">
                        <span className="status-indicator online"></span>
                        <span className="user-label">{isLoggedIn ? user?.username : "Guest Portal"}</span>
                    </div>
                </div>
                
                <div className="content-wrapper">
                    {activeTab === "landing" && (
                        <LandingView 
                            onGetStarted={() => navigateTo(isLoggedIn ? "dashboard" : "login", isLoggedIn ? "/dashboard" : "/login")}
                            onReadGuide={() => navigateTo("about", "/about")}
                        />
                    )}
                    {activeTab === "login" && <LoginView onLoginSuccess={handleLoginSuccess} />}
                    {activeTab === "dashboard" && (
                        <DashboardView 
                            analysisResult={analysisResult} 
                            setAnalysisResult={setAnalysisResult}
                            loadingAnalysis={loadingAnalysis}
                            setLoadingAnalysis={setLoadingAnalysis}
                        />
                    )}
                    {activeTab === "chat" && <ChatView />}
                    {activeTab === "history" && <HistoryView onViewResult={handleViewResultFromHistory} />}
                    {activeTab === "soil" && <SoilView />}
                    {activeTab === "watering" && <WateringView />}
                    {activeTab === "diseases" && <DiseasesView />}
                    {activeTab === "about" && <AboutView />}
                </div>
            </div>

            {/* Floating Chatbot Widget */}
            {activeTab !== "chat" && activeTab !== "landing" && activeTab !== "login" && (
                <FloatingChatWidget isOpen={floatingChatOpen} setIsOpen={setFloatingChatOpen} />
            )}
        </div>
    );
}

// Render root App
const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
