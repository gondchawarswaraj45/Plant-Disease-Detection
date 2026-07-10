// ==========================================
// PLANT AI DOCTOR CHATBOT CLIENT LOGIC
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    // ------------------------------------------
    // DOM ELEMENTS (Floating Widget & Chat Page)
    // ------------------------------------------
    const chatToggleBtn = document.getElementById("chat-toggle-btn");
    const chatWidget = document.getElementById("chat-widget");
    const closeChatBtn = document.getElementById("close-chat-btn");
    
    const widgetForm = document.getElementById("widget-chat-form");
    const widgetInput = document.getElementById("widget-chat-input");
    const widgetHistory = document.getElementById("widget-chat-messages");
    const widgetImageInput = document.getElementById("widget-image-input");
    const widgetImagePreview = document.getElementById("widget-image-preview");

    const pageForm = document.getElementById("page-chat-form");
    const pageInput = document.getElementById("page-chat-input");
    const pageHistory = document.getElementById("page-chat-messages");
    const pageImageInput = document.getElementById("page-image-input");
    const pageImagePreview = document.getElementById("page-image-preview");
    
    const suggestionChips = document.querySelectorAll(".suggestion-chip");

    // Conversation State
    let conversationHistory = [];

    // Initialize Widget Toggle
    if (chatToggleBtn && chatWidget && closeChatBtn) {
        chatToggleBtn.addEventListener("click", () => {
            chatWidget.classList.add("active");
            chatToggleBtn.classList.add("hidden");
            // Focus input
            if (widgetInput) widgetInput.focus();
            // Scroll to bottom
            scrollToBottom(widgetHistory);
        });

        closeChatBtn.addEventListener("click", () => {
            chatWidget.classList.remove("active");
            chatToggleBtn.classList.remove("hidden");
        });
    }

    // Initialize Suggested Prompt Chips
    suggestionChips.forEach(chip => {
        chip.addEventListener("click", () => {
            const promptText = chip.getAttribute("data-prompt");
            if (pageInput) {
                pageInput.value = promptText;
                pageInput.focus();
            } else if (widgetInput) {
                widgetInput.value = promptText;
                widgetInput.focus();
            }
        });
    });

    // Image Input Previews
    setupImagePreview(widgetImageInput, widgetImagePreview);
    setupImagePreview(pageImageInput, pageImagePreview);

    // Form Submissions
    if (widgetForm) {
        widgetForm.addEventListener("submit", (e) => {
            e.preventDefault();
            sendMessage(widgetInput, widgetImageInput, widgetHistory, widgetImagePreview);
        });
    }

    if (pageForm) {
        pageForm.addEventListener("submit", (e) => {
            e.preventDefault();
            sendMessage(pageInput, pageImageInput, pageHistory, pageImagePreview);
        });
    }

    // ------------------------------------------
    // CORE FUNCTIONS
    // ------------------------------------------

    function setupImagePreview(inputElement, previewElement) {
        if (!inputElement || !previewElement) return;

        inputElement.addEventListener("change", () => {
            const file = inputElement.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    previewElement.innerHTML = `
                        <div class="preview-item">
                            <img src="${e.target.result}" alt="Attachment Preview">
                            <button type="button" class="remove-preview-btn">&times;</button>
                        </div>
                    `;
                    // Setup remove handler
                    previewElement.querySelector(".remove-preview-btn").addEventListener("click", () => {
                        inputElement.value = "";
                        previewElement.innerHTML = "";
                    });
                };
                reader.readAsDataURL(file);
            } else {
                previewElement.innerHTML = "";
            }
        });
    }

    async function sendMessage(inputElement, imageInputElement, messagesContainer, previewElement) {
        const text = inputElement.value.trim();
        const hasImage = imageInputElement && imageInputElement.files.length > 0;

        if (!text && !hasImage) return;

        // Visualise image if attached
        let attachedImageSrc = null;
        let imageFile = null;
        if (hasImage) {
            imageFile = imageInputElement.files[0];
            attachedImageSrc = URL.createObjectURL(imageFile);
        }

        // Add user message to UI
        appendMessage("user", text, messagesContainer, attachedImageSrc);

        // Save input state and clear inputs
        inputElement.value = "";
        if (imageInputElement) imageInputElement.value = "";
        if (previewElement) previewElement.innerHTML = "";

        // Add user turn to memory (ignoring the image object to keep JSON history clean)
        conversationHistory.push({
            role: "user",
            text: text
        });

        // Add loading placeholder for bot
        const loadingId = appendLoadingBubble(messagesContainer);
        scrollToBottom(messagesContainer);

        // Prepare request body
        const formData = new FormData();
        formData.append("message", text);
        formData.append("history", JSON.stringify(conversationHistory));
        if (imageFile) {
            formData.append("image", imageFile);
        }

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                throw new Error("Server communication error");
            }

            const data = await response.json();
            const botResponse = data.response;

            // Remove loading bubble
            removeLoadingBubble(loadingId);

            // Add bot message to UI
            appendMessage("model", botResponse, messagesContainer);
            
            // Add bot turn to memory
            conversationHistory.push({
                role: "model",
                text: botResponse
            });

        } catch (error) {
            console.error("Chat error:", error);
            removeLoadingBubble(loadingId);
            appendMessage("model", "⚠️ System error: Unable to reach the Plant AI Doctor right now. Please verify your connection.", messagesContainer);
        }

        scrollToBottom(messagesContainer);
    }

    function appendMessage(role, text, container, imageSrc = null) {
        if (!container) return;

        const messageEl = document.createElement("div");
        messageEl.classList.add("chat-message", role);

        let contentHtml = "";

        // Render attached image if provided
        if (imageSrc) {
            contentHtml += `<img src="${imageSrc}" class="chat-attached-img" alt="Attached Leaf Image">`;
        }

        // Format markdown to HTML
        if (text) {
            contentHtml += `<div class="message-text">${formatMarkdown(text)}</div>`;
        }

        messageEl.innerHTML = contentHtml;
        container.appendChild(messageEl);
    }

    function appendLoadingBubble(container) {
        if (!container) return null;

        const loadingId = "loader_" + Date.now();
        const loaderEl = document.createElement("div");
        loaderEl.id = loadingId;
        loaderEl.classList.add("chat-message", "model", "loading-bubble");
        loaderEl.innerHTML = `
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        `;
        container.appendChild(loaderEl);
        return loadingId;
    }

    function removeLoadingBubble(id) {
        if (!id) return;
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    function scrollToBottom(container) {
        if (!container) return;
        container.scrollTop = container.scrollHeight;
    }

    // ------------------------------------------
    // LIGHTWEIGHT MARKDOWN FORMATTER
    // ------------------------------------------
    function formatMarkdown(text) {
        // Escaping HTML to prevent XSS
        let safeText = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        // Bold (**text**)
        safeText = safeText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

        // Bullet lists
        // Matches line starting with "- " or "* "
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
});
