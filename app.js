/**
 * Arya - Official AI Assistant for Chanakya University
 * JavaScript Engine
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const chatViewport = document.getElementById('chatViewport');
    const messagesList = document.getElementById('messagesList');
    const chatForm = document.getElementById('chatForm');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const quickChips = document.getElementById('quickChips');
    const sidebar = document.getElementById('sidebar');
    const openSidebar = document.getElementById('openSidebar');
    const closeSidebar = document.getElementById('closeSidebar');
    const toggleTheme = document.getElementById('toggleTheme');
    const toggleSound = document.getElementById('toggleSound');
    const clearChat = document.getElementById('clearChat');

    // Modals & Buttons
    const modalApply = document.getElementById('modalApply');
    const modalCallback = document.getElementById('modalCallback');
    const modalVisit = document.getElementById('modalVisit');

    const btnOpenApply = document.getElementById('btnOpenApply');
    const btnOpenCallback = document.getElementById('btnOpenCallback');
    const btnOpenVisit = document.getElementById('btnOpenVisit');

    // State Variables
    let isSoundEnabled = true;

    // Speech Synthesis setup
    const synth = window.speechSynthesis;

    // Speak Arya Text
    function speakText(text) {
        if (!isSoundEnabled || !synth) return;
        synth.cancel(); // Stop ongoing speech
        
        // Clean markdown symbols for cleaner speech
        const cleanText = text.replace(/[*#_`]/g, '').replace(/\[(.*?)\]\(.*?\)/g, '$1');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        synth.speak(utterance);
    }

    // Sound toggle button
    toggleSound.addEventListener('click', () => {
        isSoundEnabled = !isSoundEnabled;
        toggleSound.innerHTML = isSoundEnabled ? '<i class="fa-solid fa-volume-high"></i>' : '<i class="fa-solid fa-volume-xmark"></i>';
        toggleSound.title = isSoundEnabled ? 'Mute Sound' : 'Enable Sound';
        if (!isSoundEnabled && synth) synth.cancel();
    });

    // Theme toggle
    toggleTheme.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        toggleTheme.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    });

    // Clear Chat
    clearChat.addEventListener('click', () => {
        if (confirm('Clear current chat conversation?')) {
            messagesList.innerHTML = '';
            showInitialGreeting();
        }
    });

    // Sidebar Mobile Toggle
    openSidebar.addEventListener('click', () => sidebar.classList.add('open'));
    closeSidebar.addEventListener('click', () => sidebar.classList.remove('open'));

    // Navigation Item Buttons
    document.querySelectorAll('.nav-item-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const topic = btn.getAttribute('data-topic');
            sidebar.classList.remove('open');
            triggerTopicQuery(topic);
        });
    });

    // Quick Chips Buttons
    quickChips.addEventListener('click', (e) => {
        const chip = e.target.closest('.chip-btn');
        if (chip) {
            const query = chip.getAttribute('data-query');
            handleUserSubmit(query);
        }
    });

    // Modal Control Functions
    function openModal(modal) {
        modal.classList.add('active');
    }

    function closeModal(modal) {
        modal.classList.remove('active');
    }

    btnOpenApply.addEventListener('click', () => openModal(modalApply));
    btnOpenCallback.addEventListener('click', () => openModal(modalCallback));
    btnOpenVisit.addEventListener('click', () => openModal(modalVisit));

    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-close');
            closeModal(document.getElementById(targetId));
        });
    });

    // Close modal on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal);
        });
    });

    // Form Submissions
    document.getElementById('formApply').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('applicantName').value;
        const prog = document.getElementById('programSelect').value;
        closeModal(modalApply);
        appendAryaMessage(`Thank you, **${name}**! Your direct application for **${prog}** has been received. Our admissions team will get in touch with you shortly via email and phone.`);
        e.target.reset();
    });

    document.getElementById('formCallback').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('cbName').value;
        const time = document.getElementById('cbTime').value;
        closeModal(modalCallback);
        appendAryaMessage(`Got it, **${name}**! A Chanakya University admission counselor will call you during **${time}**.`);
        e.target.reset();
    });

    document.getElementById('formVisit').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('visitName').value;
        const date = document.getElementById('visitDate').value;
        closeModal(modalVisit);
        appendAryaMessage(`Great! Your campus visit for **${name}** has been booked for **${date}**. We look forward to welcoming you to our Global Campus near Devanahalli, Bengaluru! 🏛️`);
        e.target.reset();
    });

    // Handle Form Submit (Chat Input)
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = userInput.value.trim();
        if (text) {
            handleUserSubmit(text);
            userInput.value = '';
        }
    });

    function handleUserSubmit(text) {
        appendUserMessage(text);
        showTypingIndicator();

        setTimeout(() => {
            removeTypingIndicator();
            const responseText = generateAryaResponse(text);
            appendAryaMessage(responseText);
        }, 600);
    }

    // Scroll to bottom
    function scrollToBottom() {
        chatViewport.scrollTop = chatViewport.scrollHeight;
    }

    // Append User Message
    function appendUserMessage(text) {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const row = document.createElement('div');
        row.className = 'msg-row user-msg';
        row.innerHTML = `
            <div class="user-avatar-icon"><i class="fa-solid fa-user"></i></div>
            <div class="msg-content-wrapper">
                <span class="msg-sender-name">You</span>
                <div class="msg-bubble">
                    <p>${escapeHtml(text)}</p>
                </div>
                <span class="msg-time">${timeStr}</span>
            </div>
        `;
        messagesList.appendChild(row);
        scrollToBottom();
    }

    // Format Markdown Helper
    function parseMarkdown(text) {
        let html = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n• (.*?)(?=\n|$)/g, '<li>$1</li>')
            .replace(/\n- (.*?)(?=\n|$)/g, '<li>$1</li>');

        if (html.includes('<li>')) {
            html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        }

        return `<p>${html}</p>`;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Append Arya Message
    function appendAryaMessage(markdownText) {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const row = document.createElement('div');
        row.className = 'msg-row arya-msg';

        const formattedHtml = parseMarkdown(markdownText);

        row.innerHTML = `
            <img src="assets/arya_avatar.jpg" alt="Arya" class="msg-avatar">
            <div class="msg-content-wrapper">
                <span class="msg-sender-name">Arya • Chanakya AI</span>
                <div class="msg-bubble">
                    ${formattedHtml}
                    <div class="msg-actions-row">
                        <button class="inline-action-btn action-apply"><i class="fa-solid fa-paper-plane"></i> Apply Now</button>
                        <button class="inline-action-btn action-callback"><i class="fa-solid fa-phone"></i> Callback</button>
                        <button class="inline-action-btn action-visit"><i class="fa-solid fa-location-dot"></i> Visit Campus</button>
                    </div>
                </div>
                <span class="msg-time">${timeStr}</span>
            </div>
        `;

        messagesList.appendChild(row);
        
        // Attach listener to inline buttons
        const currentBubble = row.querySelector('.msg-bubble');
        currentBubble.querySelector('.action-apply').addEventListener('click', () => openModal(modalApply));
        currentBubble.querySelector('.action-callback').addEventListener('click', () => openModal(modalCallback));
        currentBubble.querySelector('.action-visit').addEventListener('click', () => openModal(modalVisit));

        scrollToBottom();
        speakText(markdownText);
    }

    // Typing Indicator
    function showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'msg-row arya-msg typing-row';
        indicator.id = 'typingRow';
        indicator.innerHTML = `
            <img src="assets/arya_avatar.jpg" alt="Arya" class="msg-avatar">
            <div class="msg-content-wrapper">
                <span class="msg-sender-name">Arya is typing...</span>
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        messagesList.appendChild(indicator);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const row = document.getElementById('typingRow');
        if (row) row.remove();
    }

    // Initial Greeting
    function showInitialGreeting() {
        const greeting = `Welcome to Chanakya University! 🎓

I can help you with:
• Admissions
• Courses Offered
• Fees
• Scholarships
• Placements
• Campus Life
• Hostels
• Faculty
• Contact Information

How can I assist you today?`;

        appendAryaMessage(greeting);
    }

    // Sidebar Topic Helper
    function triggerTopicQuery(topic) {
        const topicQueries = {
            'about': 'Tell me about Chanakya University',
            'admissions': 'How to apply for admission?',
            'courses': 'What courses are offered?',
            'fees': 'What is the fees structure?',
            'scholarships': 'What scholarships are available?',
            'placements': 'How are placements at Chanakya?',
            'hostels': 'Tell me about hostels and campus life',
            'facilities': 'What campus facilities are available?',
            'contact': 'What are the contact details?'
        };
        const query = topicQueries[topic] || 'Tell me about Chanakya University';
        handleUserSubmit(query);
    }

    /**
     * Core Arya Intelligence & Rule Engine
     */
    function generateAryaResponse(query) {
        const q = query.toLowerCase().trim();

        // 1. Greeting Check
        if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening|namaste)/i.test(q)) {
            return `Welcome to Chanakya University! 🎓

I can help you with:
• Admissions
• Courses Offered
• Fees
• Scholarships
• Placements
• Campus Life
• Hostels
• Faculty
• Contact Information

How can I assist you today?`;
        }

        // 2. Admissions Process (Step-by-step guidance)
        if (q.includes('admission') || q.includes('apply') || q.includes('process') || q.includes('how to join') || q.includes('eligibility criteria')) {
            return `Here is the step-by-step **Admission Process** at Chanakya University:

• **Step 1: Registration** - Fill out the online application form on our website or click the **Apply Now** button.
• **Step 2: Entrance Test / Scores Submission** - Submit valid scores from CUET, JEE, CLAT, CAT, MAT, or take the **Chanakya University Entrance Test (CUET-CU)**.
• **Step 3: Personal Interview (PI)** - Participate in a personal interaction with our academic faculty to discuss your passion and profile.
• **Step 4: Offer Letter & Seat Confirmation** - Selected candidates will receive a provisional offer letter. Confirm your seat by paying the admission deposit.

Would you like to start your application today or request a call from our admissions team?`;
        }

        // 3. Courses Offered
        if (q.includes('course') || q.includes('program') || q.includes('degree') || q.includes('branch') || q.includes('subject') || q.includes('btech') || q.includes('bba') || q.includes('mba') || q.includes('llb')) {
            return `Chanakya University offers a diverse range of undergraduate, postgraduate, and doctoral programs across multidisciplinary schools:

• **School of Engineering & Technology:**
  - B.Tech in Computer Science & Engineering
  - B.Tech in AI & Data Science

• **School of Management & Commerce:**
  - BBA (General / Business Analytics / Entrepreneurship)
  - B.Com (Honours)
  - MBA (Master of Business Administration)

• **School of Arts, Humanities & Social Sciences:**
  - BA in Psychology, Economics, Public Policy & International Relations
  - MA in Public Policy & International Relations

• **School of Law:**
  - BA LL.B (Hons) & BBA LL.B (Hons) - 5-Year Integrated

• **School of Mathematics & Natural Sciences:**
  - B.Sc in Data Science, Computer Science & Biotechnology

You can click **Apply Now** to reserve your seat or ask for specific details about any program!`;
        }

        // 4. Fees Structure (Polite direction if specific breakdown unavailable + general guidelines)
        if (q.includes('fee') || q.includes('cost') || q.includes('tuition') || q.includes('price') || q.includes('payment')) {
            return `The fee structure at Chanakya University varies depending on the chosen program, specialization, and applicable scholarships. 

While exact program fee breakdowns are customized per candidate based on merit scholarships and electives:
• **Undergraduate Programs:** Approx. ₹90,000 to ₹1,80,000 per annum (subject to program).
• **Postgraduate Programs:** Approx. ₹1,20,000 to ₹2,50,000 per annum.

I don't have the detailed subject-wise fee breakdown for every program at the moment. Please contact the Chanakya University admissions office for the latest official fee details, or click **Request Callback**!`;
        }

        // 5. Scholarships
        if (q.includes('scholarship') || q.includes('financial aid') || q.includes('concession') || q.includes('stipend') || q.includes('discount')) {
            return `Chanakya University is committed to making quality higher education accessible. We offer generous scholarship opportunities up to **100% tuition waiver**:

• **Chanakya Merit Scholarship:** Awarded to top performers in Class 12th / Graduation or national entrance exams (CUET, JEE, CLAT).
• **Need-cum-Merit Scholarship:** Financial assistance for deserving students from lower income backgrounds.
• **Special Talent & Sports Scholarship:** Reserved for state and national-level sports champions, artists, and innovators.
• **Defence & Martyrs Ward Scholarship:** Special privilege for children of armed forces personnel.

Eligibility is evaluated during the personal interview phase. Would you like to check your eligibility with an admissions officer?`;
        }

        // 6. Placements & Career
        if (q.includes('placement') || q.includes('job') || q.includes('package') || q.includes('recruiter') || q.includes('salary') || q.includes('career') || q.includes('internship')) {
            return `Chanakya University has a dedicated **Career Development Centre (CDC)** that prepares students for global career opportunities:

• **Career Guidance & Skill Building:** Resume crafting, mock interviews, soft skills, and industry certification bootcamps.
• **Top Recruiters:** Leading corporations in IT, Fintech, Consulting, Legal Firms, Public Policy Think Tanks, and Biotech R&D.
• **Internship Mandate:** Mandatory industry internships starting from 2nd/3rd year for hands-on experience.
• **Entrepreneurship Cell:** Incubation center for student startups with seed funding support.

Would you like to schedule a campus visit or request a call from our placement cell?`;
        }

        // 7. Hostels & Life @ Chanakya
        if (q.includes('hostel') || q.includes('accommodation') || q.includes('stay') || q.includes('food') || q.includes('mess') || q.includes('campus life') || q.includes('living')) {
            return `Life @ Chanakya University offers a vibrant, secure, and vibrant residential experience:

• **Modern Hostels:** Separate air-conditioned and non-AC rooms for boys and girls with 24/7 security & CCTV surveillance.
• **High-Speed Connectivity:** Campus-wide Wi-Fi access for seamless academic learning.
• **Nutritious Dining:** Hygienic multi-cuisine mess serving wholesome vegetarian meal options.
• **Recreation & Fitness:** Gymnasium, indoor sports complex, yoga center, football turf, and basketball courts.

We welcome prospective students and parents to visit our campus and explore the hostel facilities!`;
        }

        // 8. Campus Facilities & Location
        if (q.includes('facility') || q.includes('campus') || q.includes('library') || q.includes('lab') || q.includes('infrastructure') || q.includes('location') || q.includes('where is')) {
            return `Chanakya University is located on a sprawling 100+ acre state-of-the-art **Global Campus** near Bengaluru International Airport:

• **Address:** Global Campus, NH 648, Brigade Orchards Spine Road, Devanahalli, Bengaluru, Karnataka 562110.
• **Infrastructure:** Smart digital classrooms, advanced AI & Science laboratories, research centers, central library with 50,000+ books & e-journals.
• **Accessibility:** 15 minutes drive from Kempegowda International Airport (BLR).

You can book a guided campus tour by clicking the **Visit Campus** button!`;
        }

        // 9. Faculty
        if (q.includes('faculty') || q.includes('teacher') || q.includes('professor') || q.includes('mentor')) {
            return `Our faculty comprises distinguished academicians, researchers, and industry leaders from premier institutions across India and abroad:

• Over 80% of faculty members hold Ph.D. degrees from renowned global and Indian universities.
• Active research mentors guiding undergraduate and postgraduate students in publications & patents.
• Personalized 1-on-1 mentorship for every student.

Would you like to learn more about our academic programs?`;
        }

        // 10. Contact Info & Support
        if (q.includes('contact') || q.includes('phone') || q.includes('email') || q.includes('address') || q.includes('call') || q.includes('number') || q.includes('office')) {
            return `Here is the official **Contact Information** for Chanakya University:

• **Admission Helpline:** +91 80 6902 0100 / Toll Free: 1800 123 4567
• **Email:** admissions@chanakyauniversity.edu.in / info@chanakyauniversity.edu.in
• **Official Website:** www.chanakyauniversity.edu.in
• **Campus Address:** Global Campus, NH 648, Brigade Orchards Spine Road, Devanahalli, Bengaluru, Karnataka 562110.

Feel free to request a callback or click **Apply Now** to get started!`;
        }

        // 11. About Us / University Overview
        if (q.includes('about') || q.includes('who is') || q.includes('what is chanakya university') || q.includes('vision') || q.includes('why chanakya')) {
            return `**Chanakya University** is a state private university established under the Chanakya University Act 2021 in Bengaluru, Karnataka.

• **Vision:** A world-class multidisciplinary university committed to creating transformative leaders by blending **Indian Knowledge Systems (IKS)** with contemporary global science and technology.
• **NEP 2020 Aligned:** Flexible multi-disciplinary curriculum with multiple entry/exit options.
• **Location:** Devanahalli, Bengaluru - the Tech Capital of India.

How can I assist you further with admissions, courses, or scholarships?`;
        }

        // 12. Fallback Rule (Strict Requirement #10)
        return `I don't have that information at the moment. Please contact the Chanakya University admissions office for the latest details.

• **Admissions Helpline:** +91 80 6902 0100
• **Email:** admissions@chanakyauniversity.edu.in

You can also click **Request Callback** below to have our admissions team contact you directly!`;
    }

    // Launch Initial Greeting
    showInitialGreeting();
});
