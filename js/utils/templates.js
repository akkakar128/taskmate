// Templates and themes management
const CVGenerator = (function () {
    // Theme definitions for each template
    const themes = {
        modern: [
            { id: 'blue', name: 'Blue', color: '#3498db' },
            { id: 'green', name: 'Green', color: '#4CAF50' },
            { id: 'purple', name: 'Purple', color: '#9B59B6' },
            { id: 'dark', name: 'Dark', color: '#2C3E50' },
            { id: 'warm', name: 'Warm', color: '#D2691E' },
            { id: 'cool', name: 'Cool', color: '#3498DB' }
        ],
        classic: [
            { id: 'blue', name: 'Blue', color: '#7f8c8d' },
            { id: 'green', name: 'Green', color: '#556B2F' },
            { id: 'brown', name: 'Brown', color: '#8D6E63' },
            { id: 'dark', name: 'Dark', color: '#424242' },
            { id: 'burgundy', name: 'Burgundy', color: '#722F37' },
            { id: 'navy', name: 'Navy', color: '#3282B8' }
        ],
        minimalist: [
            { id: 'black', name: 'Black', color: '#000000' },
            { id: 'gray', name: 'Gray', color: '#757575' },
            { id: 'blue', name: 'Blue', color: '#42A5F5' },
            { id: 'green', name: 'Green', color: '#4CAF50' },
            { id: 'purple', name: 'Purple', color: '#7B1FA2' },
            { id: 'darkblue', name: 'Dark Blue', color: '#1976D2' }
        ],
        executive: [
            { id: 'blue', name: 'Blue', color: '#283593' },
            { id: 'navy', name: 'Navy', color: '#1b263b' },
            { id: 'dark', name: 'Dark', color: '#424242' },
            { id: 'maroon', name: 'Maroon', color: '#8B0000' },
            { id: 'forest', name: 'Forest', color: '#2D6A4F' },
            { id: 'slate', name: 'Slate', color: '#4B5563' }
        ]
    };

    // Application state
    let state = {
        currentFormat: 'photo',
        currentTemplate: 'modern',
        currentTheme: 'blue',
        photoData: null,
        experienceCount: 0,
        educationCount: 0
    };

    // DOM elements cache
    let elements = {};

    // Initialize the application
    function init() {
        cacheElements();
        bindEvents();
        initializeThemes();
        initializeForm();
        updateCVTemplate();
    }

    // Cache DOM elements for better performance
    function cacheElements() {
        elements = {
            dataFileInput: document.getElementById('dataFile'),
            uploadArea: document.getElementById('uploadArea'),
            generateBtn: document.getElementById('generateBtn'),
            printBtn: document.getElementById('printBtn'),
            pdfBtn: document.getElementById('pdfBtn'),
            exportJsonBtn: document.getElementById('exportJsonBtn'),
            exportTxtBtn: document.getElementById('exportTxtBtn'),
            form: document.getElementById('cvForm'),
            addExperienceBtn: document.getElementById('addExperience'),
            addEducationBtn: document.getElementById('addEducation'),
            experienceList: document.getElementById('experienceList'),
            educationList: document.getElementById('educationList'),
            photoFormat: document.getElementById('photoFormat'),
            internationalFormat: document.getElementById('internationalFormat'),
            photoUploadArea: document.getElementById('photoUploadArea'),
            photoFileInput: document.getElementById('photoFile'),
            photoPreview: document.getElementById('photoPreview'),
            photoPlaceholder: document.getElementById('photoPlaceholder'),
            photoError: document.getElementById('photoError'),
            photoUploadSection: document.getElementById('photoUploadSection'),
            cvPreview: document.getElementById('cvPreview'),
            downloadJsonExample: document.getElementById('downloadJsonExample'),
            downloadTxtExample: document.getElementById('downloadTxtExample'),
            currentFormatText: document.getElementById('currentFormatText'),
            currentFormatText2: document.getElementById('currentFormatText2'),
            templateOptions: document.querySelectorAll('.template-option'),
            themeOptionsContainer: document.getElementById('themeOptions')
        };
    }

    // Bind event listeners
    function bindEvents() {
        // Template selection
        elements.templateOptions.forEach(option => {
            option.addEventListener('click', handleTemplateSelection);
        });

        // Format selection
        elements.photoFormat.addEventListener('click', handlePhotoFormatSelection);
        elements.internationalFormat.addEventListener('click', handleInternationalFormatSelection);

        // File uploads
        elements.uploadArea.addEventListener('click', () => elements.dataFileInput.click());
        elements.photoUploadArea.addEventListener('click', () => elements.photoFileInput.click());

        // File input handlers
        elements.photoFileInput.addEventListener('change', handlePhotoUpload);
        elements.dataFileInput.addEventListener('change', handleDataFileUpload);

        // Form actions
        elements.generateBtn.addEventListener('click', handleGenerateCV);
        elements.printBtn.addEventListener('click', handlePrintCV);
        elements.pdfBtn.addEventListener('click', handleSaveAsPDF);
        elements.exportJsonBtn.addEventListener('click', handleExportJSON);
        elements.exportTxtBtn.addEventListener('click', handleExportTXT);
        elements.downloadJsonExample.addEventListener('click', handleDownloadJsonExample);
        elements.downloadTxtExample.addEventListener('click', handleDownloadTxtExample);

        // Dynamic form elements
        elements.addExperienceBtn.addEventListener('click', handleAddExperience);
        elements.addEducationBtn.addEventListener('click', handleAddEducation);
    }

    // Event handlers
    function handleTemplateSelection(e) {
        elements.templateOptions.forEach(opt => opt.classList.remove('selected'));
        e.currentTarget.classList.add('selected');
        state.currentTemplate = e.currentTarget.getAttribute('data-template');
        // Reset to default theme when template changes
        state.currentTheme = 'blue';
        updateThemeOptions();
        updateCVTemplate();
    }

    function handlePhotoFormatSelection() {
        elements.photoFormat.classList.add('selected');
        elements.internationalFormat.classList.remove('selected');
        state.currentFormat = 'photo';
        elements.currentFormatText.textContent = 'Photo';
        elements.currentFormatText2.textContent = 'Photo';
        elements.photoUploadSection.style.display = 'block';
        updateCVTemplate();
    }

    function handleInternationalFormatSelection() {
        elements.internationalFormat.classList.add('selected');
        elements.photoFormat.classList.remove('selected');
        state.currentFormat = 'international';
        elements.currentFormatText.textContent = 'International';
        elements.currentFormatText2.textContent = 'International';
        elements.photoUploadSection.style.display = 'none';
        updateCVTemplate();
    }

    function handlePhotoUpload(e) {
        const file = e.target.files[0];
        if (file) {
            // Check file size (max 200KB)
            if (file.size > 200 * 1024) {
                elements.photoError.style.display = 'block';
                elements.photoFileInput.value = ''; // Clear the invalid file
                return;
            } else {
                elements.photoError.style.display = 'none';
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                state.photoData = e.target.result;
                updateCVPreview();
                alert('Photo uploaded successfully!');
            };
            reader.onerror = function () {
                alert('Error reading file. Please try again.');
                elements.photoFileInput.value = '';
            };
            reader.readAsDataURL(file);
        }
    }

    // Parse uploaded file data
    function parseFileData(content, filename) {
        try {
            let data;
            if (filename.endsWith('.json')) {
                data = JSON.parse(content);
            } else if (filename.endsWith('.txt')) {
                data = parseTxtFile(content);
            }
            return data;
        } catch (error) {
            throw error;
        }
    }

    function handleDataFileUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const data = parseFileData(e.target.result, file.name);

                    // First populate the form with the loaded data
                    FormHandler.populateForm(data);

                    // Then generate the CV preview with the loaded data
                    generateCV(data);

                    alert('Data file loaded successfully! CV preview updated.');
                } catch (error) {
                    alert('Error parsing file. Please check the format. Error: ' + error.message);
                }
            };
            reader.onerror = function () {
                alert('Error reading file. Please try again.');
            };
            reader.readAsText(file);
        }
    }

    function handleGenerateCV() {
        const formData = FormHandler.getFormData();
        generateCV(formData);
    }

    function handlePrintCV() {
        // Ensure the CV template is updated before printing
        updateCVTemplate();

        // Add a small delay to ensure DOM is updated
        setTimeout(() => {
            window.print();
        }, 100);
    }

    function handleSaveAsPDF() {
        // Ensure the CV template is updated before printing
        updateCVTemplate();

        // Add a small delay to ensure DOM is updated
        setTimeout(() => {
            window.print();
        }, 100);
    }

    function handleExportJSON() {
        const formData = FormHandler.getFormData();
        const jsonString = JSON.stringify(formData, null, 2);
        downloadFile(jsonString, 'cv-data.json', 'application/json');
    }

    function handleExportTXT() {
        const formData = FormHandler.getFormData();
        const txtContent = convertToTxtFormat(formData);
        downloadFile(txtContent, 'cv-data.txt', 'text/plain');
    }

    function handleDownloadJsonExample() {
        const exampleData = generateExampleData();
        const jsonString = JSON.stringify(exampleData, null, 2);
        const filename = `${state.currentTemplate}-${state.currentTheme}-${state.currentFormat}-cv-example.json`;
        downloadFile(jsonString, filename, 'application/json');
    }

    function handleDownloadTxtExample() {
        const exampleData = generateExampleData();
        const txtContent = convertToTxtFormat(exampleData);
        const filename = `${state.currentTemplate}-${state.currentTheme}-${state.currentFormat}-cv-example.txt`;
        downloadFile(txtContent, filename, 'text/plain');
    }

    function handleAddExperience() {
        state.experienceCount++;
        const experienceItem = document.createElement('div');
        experienceItem.className = 'dynamic-item';
        experienceItem.innerHTML = `
            <button type="button" class="remove-btn" onclick="this.parentElement.remove()">×</button>
            <div class="form-group">
                <label for="expTitle${state.experienceCount}">Job Title</label>
                <input type="text" id="expTitle${state.experienceCount}" placeholder="e.g., Marketing Manager">
            </div>
            <div class="form-group">
                <label for="expCompany${state.experienceCount}">Company</label>
                <input type="text" id="expCompany${state.experienceCount}" placeholder="Company Name">
            </div>
            <div class="form-group">
                <label for="expLocation${state.experienceCount}">Location</label>
                <input type="text" id="expLocation${state.experienceCount}" placeholder="City, State">
            </div>
            <div class="form-group">
                <label for="expStart${state.experienceCount}">Start Date</label>
                <input type="text" id="expStart${state.experienceCount}" placeholder="MMM YYYY (e.g., Jan 2020)">
            </div>
            <div class="form-group">
                <label for="expEnd${state.experienceCount}">End Date</label>
                <input type="text" id="expEnd${state.experienceCount}" placeholder="MMM YYYY or Present">
            </div>
            <div class="form-group">
                <label for="expDescription${state.experienceCount}">Description</label>
                <textarea id="expDescription${state.experienceCount}" placeholder="Describe your responsibilities and achievements"></textarea>
            </div>
        `;
        elements.experienceList.appendChild(experienceItem);
    }

    function handleAddEducation() {
        state.educationCount++;
        const educationItem = document.createElement('div');
        educationItem.className = 'dynamic-item';
        educationItem.innerHTML = `
            <button type="button" class="remove-btn" onclick="this.parentElement.remove()">×</button>
            <div class="form-group">
                <label for="eduDegree${state.educationCount}">Degree/Certificate</label>
                <input type="text" id="eduDegree${state.educationCount}" placeholder="e.g., Bachelor of Science in Business">
            </div>
            <div class="form-group">
                <label for="eduInstitution${state.educationCount}">Institution</label>
                <input type="text" id="eduInstitution${state.educationCount}" placeholder="University Name">
            </div>
            <div class="form-group">
                <label for="eduLocation${state.educationCount}">Location</label>
                <input type="text" id="eduLocation${state.educationCount}" placeholder="City, State">
            </div>
            <div class="form-group">
                <label for="eduStart${state.educationCount}">Start Date</label>
                <input type="text" id="eduStart${state.educationCount}" placeholder="MMM YYYY (e.g., Aug 2016)">
            </div>
            <div class="form-group">
                <label for="eduEnd${state.educationCount}">End Date</label>
                <input type="text" id="eduEnd${state.educationCount}" placeholder="MMM YYYY or Present">
            </div>
            <div class="form-group">
                <label for="eduDescription${state.educationCount}">Description</label>
                <textarea id="eduDescription${state.educationCount}" placeholder="Honors, relevant coursework, or achievements"></textarea>
            </div>
        `;
        elements.educationList.appendChild(educationItem);
    }

    // Helper functions
    function downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function generateExampleData() {
        if (state.currentFormat === 'photo') {
            return {
                "format": "photo",
                "template": state.currentTemplate,
                "theme": state.currentTheme,
                "photo": "",
                "personalInfo": {
                    "name": "Ali Raza Khan",
                    "title": "Senior Software Engineer"
                },
                "contact": {
                    "email": "ali.khan@example.com",
                    "phone": "+92 300 123 4567",
                    "location": "Lahore, Pakistan",
                    "linkedin": "https://linkedin.com/in/alirazakhan",
                    "github": "https://github.com/alirazakhan",
                    "portfolio": "https://alikhan.dev"
                },
                "summary": "Results-driven Software Engineer with 6+ years of experience in full-stack web development. Specialized in JavaScript technologies with a proven track record of delivering high-quality software solutions for international clients.",
                "skills": [
                    "JavaScript",
                    "React.js",
                    "Node.js",
                    "Python",
                    "MongoDB",
                    "PostgreSQL",
                    "AWS",
                    "Docker",
                    "Git",
                    "RESTful APIs"
                ],
                "certifications": [
                    "AWS Certified Developer - Associate",
                    "Scrum Master Certified (SMC)",
                    "Microsoft Azure Fundamentals"
                ],
                "experience": [
                    {
                        "title": "Senior Software Engineer",
                        "company": "TechSolutions Pakistan",
                        "location": "Lahore, Pakistan",
                        "startDate": "Mar 2020",
                        "endDate": "Present",
                        "description": "Lead a team of 5 developers in building scalable web applications. Improved application performance by 40% through code optimization and implemented CI/CD pipelines reducing deployment time by 60%."
                    },
                    {
                        "title": "Software Engineer",
                        "company": "Digital Innovations Ltd.",
                        "location": "Karachi, Pakistan",
                        "startDate": "Jun 2017",
                        "endDate": "Feb 2020",
                        "description": "Developed and maintained multiple client projects using React and Node.js. Collaborated with cross-functional teams to deliver projects on time and within budget."
                    }
                ],
                "education": [
                    {
                        "degree": "Bachelor of Science in Computer Science",
                        "institution": "Lahore University of Management Sciences (LUMS)",
                        "location": "Lahore, Pakistan",
                        "startDate": "2012",
                        "endDate": "2016",
                        "description": "Graduated with Magna Cum Laude. Relevant coursework: Data Structures, Algorithms, Database Systems, Web Technologies."
                    }
                ],
                "languages": [
                    {
                        "language": "Urdu",
                        "proficiency": "Native"
                    },
                    {
                        "language": "English",
                        "proficiency": "Fluent"
                    },
                    {
                        "language": "Punjabi",
                        "proficiency": "Native"
                    }
                ]
            };
        } else {
            return {
                "format": "international",
                "template": state.currentTemplate,
                "theme": state.currentTheme,
                "personalInfo": {
                    "name": "Sarah Johnson",
                    "title": "Marketing Director"
                },
                "contact": {
                    "email": "sarah.johnson@example.com",
                    "phone": "+1 (555) 123-4567",
                    "location": "New York, NY, USA",
                    "linkedin": "https://linkedin.com/in/sarahjohnson",
                    "github": "https://github.com/sarahjohnson",
                    "portfolio": "https://sarahjohnsonportfolio.com"
                },
                "summary": "Strategic Marketing Director with 10+ years of experience driving brand growth and revenue through innovative marketing strategies. Proven expertise in digital marketing, brand management, and team leadership.",
                "skills": [
                    "Digital Marketing",
                    "Brand Strategy",
                    "Market Research",
                    "Team Leadership",
                    "Budget Management",
                    "SEO/SEM",
                    "Social Media Marketing",
                    "Content Strategy",
                    "Data Analytics",
                    "Project Management"
                ],
                "certifications": [
                    "Google Analytics Certified",
                    "HubSpot Inbound Marketing Certified",
                    "PMP (Project Management Professional)",
                    "Facebook Blueprint Certified"
                ],
                "experience": [
                    {
                        "title": "Marketing Director",
                        "company": "Global Brands Inc.",
                        "location": "New York, NY",
                        "startDate": "Jan 2019",
                        "endDate": "Present",
                        "description": "Lead a team of 12 marketing professionals overseeing $5M annual budget. Developed and executed comprehensive marketing strategies that increased brand awareness by 40% and drove 30% revenue growth."
                    },
                    {
                        "title": "Senior Marketing Manager",
                        "company": "Innovate Solutions",
                        "location": "Chicago, IL",
                        "startDate": "Mar 2015",
                        "endDate": "Dec 2018",
                        "description": "Managed digital marketing campaigns across multiple channels resulting in 35% increase in web traffic and 20% growth in conversion rates."
                    }
                ],
                "education": [
                    {
                        "degree": "Master of Business Administration (MBA)",
                        "institution": "Harvard Business School",
                        "location": "Boston, MA",
                        "startDate": "2010",
                        "endDate": "2012",
                        "description": "Concentration in Marketing and Strategy. Graduated in top 10% of class. President of Marketing Club."
                    },
                    {
                        "degree": "Bachelor of Arts in Communications",
                        "institution": "Stanford University",
                        "location": "Stanford, CA",
                        "startDate": "2006",
                        "endDate": "2010",
                        "description": "Minor in Business Administration. Dean's List for 6 semesters. Captain of Debate Team."
                    }
                ],
                "languages": [
                    {
                        "language": "English",
                        "proficiency": "Native"
                    },
                    {
                        "language": "Spanish",
                        "proficiency": "Professional"
                    },
                    {
                        "language": "French",
                        "proficiency": "Intermediate"
                    }
                ]
            };
        }
    }

    function parseTxtFile(content) {
        const lines = content.split('\n');
        const data = {
            personalInfo: {},
            contact: {},
            skills: [],
            certifications: [],
            experience: [],
            education: [],
            languages: []
        };

        let currentSection = '';
        let currentExperience = null;
        let currentEducation = null;

        lines.forEach(line => {
            line = line.trim();
            if (!line) return;

            // Section headers
            if (line.startsWith('===')) {
                currentSection = line.replace(/===/g, '').trim().toLowerCase();
                return;
            }

            // Parse data based on current section
            switch (currentSection) {
                case 'personal info':
                    if (line.startsWith('Name:')) data.personalInfo.name = line.replace('Name:', '').trim();
                    if (line.startsWith('Title:')) data.personalInfo.title = line.replace('Title:', '').trim();
                    break;

                case 'contact':
                    if (line.startsWith('Email:')) data.contact.email = line.replace('Email:', '').trim();
                    if (line.startsWith('Phone:')) data.contact.phone = line.replace('Phone:', '').trim();
                    if (line.startsWith('Location:')) data.contact.location = line.replace('Location:', '').trim();
                    if (line.startsWith('LinkedIn:')) data.contact.linkedin = line.replace('LinkedIn:', '').trim();
                    if (line.startsWith('GitHub:')) data.contact.github = line.replace('GitHub:', '').trim();
                    if (line.startsWith('Portfolio:')) data.contact.portfolio = line.replace('Portfolio:', '').trim();
                    break;

                case 'summary':
                    data.summary = line;
                    break;

                case 'skills':
                    data.skills = line.split(',').map(skill => skill.trim());
                    break;

                case 'certifications':
                    data.certifications = line.split(',').map(cert => cert.trim());
                    break;

                case 'languages':
                    data.languages = line.split(',').map(lang => {
                        const langParts = lang.trim().split('(');
                        const language = langParts[0].trim();
                        const proficiency = langParts[1] ? langParts[1].replace(')', '').trim() : '';
                        return { language, proficiency };
                    });
                    break;

                case 'experience':
                    if (line.startsWith('Title:')) {
                        if (currentExperience) data.experience.push(currentExperience);
                        currentExperience = {
                            title: line.replace('Title:', '').trim(),
                            company: '',
                            location: '',
                            startDate: '',
                            endDate: '',
                            description: ''
                        };
                    } else if (currentExperience) {
                        if (line.startsWith('Company:')) currentExperience.company = line.replace('Company:', '').trim();
                        if (line.startsWith('Location:')) currentExperience.location = line.replace('Location:', '').trim();
                        if (line.startsWith('Start Date:')) currentExperience.startDate = line.replace('Start Date:', '').trim();
                        if (line.startsWith('End Date:')) currentExperience.endDate = line.replace('End Date:', '').trim();
                        if (line.startsWith('Description:')) currentExperience.description = line.replace('Description:', '').trim();
                    }
                    break;

                case 'education':
                    if (line.startsWith('Degree:')) {
                        if (currentEducation) data.education.push(currentEducation);
                        currentEducation = {
                            degree: line.replace('Degree:', '').trim(),
                            institution: '',
                            location: '',
                            startDate: '',
                            endDate: '',
                            description: ''
                        };
                    } else if (currentEducation) {
                        if (line.startsWith('Institution:')) currentEducation.institution = line.replace('Institution:', '').trim();
                        if (line.startsWith('Location:')) currentEducation.location = line.replace('Location:', '').trim();
                        if (line.startsWith('Start Date:')) currentEducation.startDate = line.replace('Start Date:', '').trim();
                        if (line.startsWith('End Date:')) currentEducation.endDate = line.replace('End Date:', '').trim();
                        if (line.startsWith('Description:')) currentEducation.description = line.replace('Description:', '').trim();
                    }
                    break;

                case 'format':
                    data.format = line.toLowerCase();
                    break;

                case 'template':
                    data.template = line.toLowerCase();
                    break;

                case 'theme':
                    data.theme = line.toLowerCase();
                    break;
            }
        });

        // Push the last experience and education items
        if (currentExperience) data.experience.push(currentExperience);
        if (currentEducation) data.education.push(currentEducation);

        return data;
    }

    function convertToTxtFormat(data) {
        let txtContent = '';

        // Personal Info
        txtContent += '=== Personal Info ===\n';
        txtContent += `Name: ${data.personalInfo?.name || ''}\n`;
        txtContent += `Title: ${data.personalInfo?.title || ''}\n\n`;

        // Contact
        txtContent += '=== Contact ===\n';
        txtContent += `Email: ${data.contact?.email || ''}\n`;
        txtContent += `Phone: ${data.contact?.phone || ''}\n`;
        txtContent += `Location: ${data.contact?.location || ''}\n`;
        txtContent += `LinkedIn: ${data.contact?.linkedin || ''}\n`;
        txtContent += `GitHub: ${data.contact?.github || ''}\n`;
        txtContent += `Portfolio: ${data.contact?.portfolio || ''}\n\n`;

        // Summary
        txtContent += '=== Summary ===\n';
        txtContent += `${data.summary || ''}\n\n`;

        // Skills
        txtContent += '=== Skills ===\n';
        txtContent += `${data.skills?.join(', ') || ''}\n\n`;

        // Languages
        txtContent += '=== Languages ===\n';
        if (data.languages && data.languages.length > 0) {
            const languagesStr = data.languages.map(lang =>
                `${lang.language}${lang.proficiency ? ` (${lang.proficiency})` : ''}`
            ).join(', ');
            txtContent += `${languagesStr}\n\n`;
        } else {
            txtContent += '\n\n';
        }

        // Certifications
        txtContent += '=== Certifications ===\n';
        txtContent += `${data.certifications?.join(', ') || ''}\n\n`;

        // Experience
        txtContent += '=== Experience ===\n';
        if (data.experience && data.experience.length > 0) {
            data.experience.forEach((exp, index) => {
                txtContent += `Title: ${exp.title || ''}\n`;
                txtContent += `Company: ${exp.company || ''}\n`;
                txtContent += `Location: ${exp.location || ''}\n`;
                txtContent += `Start Date: ${exp.startDate || ''}\n`;
                txtContent += `End Date: ${exp.endDate || ''}\n`;
                txtContent += `Description: ${exp.description || ''}\n`;
                if (index < data.experience.length - 1) txtContent += '---\n';
            });
            txtContent += '\n';
        } else {
            txtContent += '\n';
        }

        // Education
        txtContent += '=== Education ===\n';
        if (data.education && data.education.length > 0) {
            data.education.forEach((edu, index) => {
                txtContent += `Degree: ${edu.degree || ''}\n`;
                txtContent += `Institution: ${edu.institution || ''}\n`;
                txtContent += `Location: ${edu.location || ''}\n`;
                txtContent += `Start Date: ${edu.startDate || ''}\n`;
                txtContent += `End Date: ${edu.endDate || ''}\n`;
                txtContent += `Description: ${edu.description || ''}\n`;
                if (index < data.education.length - 1) txtContent += '---\n';
            });
            txtContent += '\n';
        } else {
            txtContent += '\n';
        }

        // Format, Template, Theme
        txtContent += '=== Format ===\n';
        txtContent += `${data.format || 'photo'}\n\n`;

        txtContent += '=== Template ===\n';
        txtContent += `${data.template || 'modern'}\n\n`;

        txtContent += '=== Theme ===\n';
        txtContent += `${data.theme || 'blue'}\n`;

        return txtContent;
    }

    // Initialize theme options
    function initializeThemes() {
        updateThemeOptions();
    }

    // Update theme options based on current template
    function updateThemeOptions() {
        elements.themeOptionsContainer.innerHTML = '';
        const templateThemes = themes[state.currentTemplate];

        templateThemes.forEach(theme => {
            const themeOption = document.createElement('div');
            themeOption.className = `theme-option ${state.currentTheme === theme.id ? 'selected' : ''}`;
            themeOption.setAttribute('data-theme', theme.id);
            themeOption.style.backgroundColor = theme.color;
            themeOption.textContent = theme.name;
            themeOption.addEventListener('click', function () {
                state.currentTheme = theme.id;
                updateThemeSelection();
                updateCVTemplate();
            });
            elements.themeOptionsContainer.appendChild(themeOption);
        });
    }

    // Update theme selection UI
    function updateThemeSelection() {
        const themeOptions = document.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            if (option.getAttribute('data-theme') === state.currentTheme) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
    }

    // Update CV template
    function updateCVTemplate() {
        let templateClass = `cv-template ${state.currentTemplate} theme-${state.currentTheme}`;
        if (state.currentFormat === 'international') {
            templateClass += ' international';
        }
        elements.cvPreview.className = templateClass;
        updateCVPreview();
    }

    // Update CV preview based on format - FIXED PHOTO DISPLAY ISSUE
    function updateCVPreview() {
        if (state.currentFormat === 'photo') {
            // Show photo in Photo CV format
            if (state.photoData) {
                elements.photoPreview.src = state.photoData;
                elements.photoPreview.classList.remove('hidden');
                elements.photoPlaceholder.classList.add('hidden');
            } else {
                elements.photoPreview.classList.add('hidden');
                elements.photoPlaceholder.classList.remove('hidden');
            }
        } else {
            // Hide photo in International format
            elements.photoPreview.classList.add('hidden');
            elements.photoPlaceholder.classList.add('hidden');
        }
    }

    // Initialize form with sample data
    function initializeForm() {
        handleAddExperience();
        handleAddEducation();
        generateCV(FormHandler.getFormData());
    }

    // Main function to generate CV from data
    function generateCV(data) {
        // Update personal info
        document.getElementById('previewName').textContent = data.personalInfo?.name || 'Your Name';
        document.getElementById('previewTitle').textContent = data.personalInfo?.title || 'Professional Title';

        // Update contact info
        document.getElementById('previewEmail').textContent = data.contact?.email || 'email@example.com';
        document.getElementById('previewPhone').textContent = data.contact?.phone || '+1 (555) 123-4567';
        document.getElementById('previewLocation').textContent = data.contact?.location || 'City, State';
        document.getElementById('previewLinkedIn').textContent = data.contact?.linkedin ?
            data.contact.linkedin.replace(/^https?:\/\//, '') : 'linkedin.com/in/username';
        document.getElementById('previewGithub').textContent = data.contact?.github ?
            data.contact.github.replace(/^https?:\/\//, '') : 'github.com/username';
        document.getElementById('previewPortfolio').textContent = data.contact?.portfolio ?
            data.contact.portfolio.replace(/^https?:\/\//, '') : 'yourwebsite.com';

        // Update summary
        document.getElementById('previewSummary').textContent = data.summary ||
            'Your professional summary will appear here. This should be a brief overview of your experience, skills, and career goals.';

        // Update skills
        const skillsContainer = document.getElementById('previewSkills');
        skillsContainer.innerHTML = '';
        if (data.skills && data.skills.length > 0) {
            data.skills.forEach(skill => {
                if (skill.trim()) {
                    const skillElement = document.createElement('div');
                    skillElement.className = 'skill-tag';
                    skillElement.textContent = skill;
                    skillsContainer.appendChild(skillElement);
                }
            });
        } else {
            skillsContainer.innerHTML = '<div class="skill-tag">Sample Skill 1</div><div class="skill-tag">Sample Skill 2</div><div class="skill-tag">Sample Skill 3</div>';
        }

        // Update languages
        const languagesContainer = document.getElementById('previewLanguages');
        languagesContainer.innerHTML = '';
        if (data.languages && data.languages.length > 0) {
            data.languages.forEach(lang => {
                const langElement = document.createElement('div');
                langElement.className = 'skill-tag';
                langElement.textContent = lang.proficiency ?
                    `${lang.language} (${lang.proficiency})` : lang.language;
                languagesContainer.appendChild(langElement);
            });
        } else {
            languagesContainer.innerHTML = '<div class="skill-tag">English (Native)</div><div class="skill-tag">Spanish (Intermediate)</div>';
        }

        // Update certifications
        const certificationsContainer = document.getElementById('previewCertifications');
        certificationsContainer.innerHTML = '';
        if (data.certifications && data.certifications.length > 0) {
            data.certifications.forEach(cert => {
                if (cert.trim()) {
                    const certElement = document.createElement('div');
                    certElement.className = 'skill-tag';
                    certElement.textContent = cert;
                    certificationsContainer.appendChild(certElement);
                }
            });
        } else {
            certificationsContainer.innerHTML = '<div class="skill-tag">Sample Certification 1</div><div class="skill-tag">Sample Certification 2</div>';
        }

        // Update experience
        const experienceContainer = document.getElementById('previewExperience');
        experienceContainer.innerHTML = '';
        if (data.experience && data.experience.length > 0) {
            data.experience.forEach(exp => {
                const expElement = document.createElement('div');
                expElement.className = 'experience-item';

                expElement.innerHTML = `
                    <div class="item-header">
                        <div class="item-title">${exp.title || 'Job Title'}</div>
                        <div class="item-date">${exp.startDate || 'Start'} - ${exp.endDate || 'End'}</div>
                    </div>
                    <div class="item-subtitle">${exp.company || 'Company Name'}, ${exp.location || 'Location'}</div>
                    <p>${exp.description || 'Brief description of your responsibilities and achievements in this role.'}</p>
                `;

                experienceContainer.appendChild(expElement);
            });
        } else {
            experienceContainer.innerHTML = `
                <div class="experience-item">
                    <div class="item-header">
                        <div class="item-title">Job Title</div>
                        <div class="item-date">Jan 2020 - Present</div>
                    </div>
                    <div class="item-subtitle">Company Name, Location</div>
                    <p>Brief description of your responsibilities and achievements in this role.</p>
                </div>
            `;
        }

        // Update education
        const educationContainer = document.getElementById('previewEducation');
        educationContainer.innerHTML = '';
        if (data.education && data.education.length > 0) {
            data.education.forEach(edu => {
                const eduElement = document.createElement('div');
                eduElement.className = 'education-item';

                eduElement.innerHTML = `
                    <div class="item-header">
                        <div class="item-title">${edu.degree || 'Degree Name'}</div>
                        <div class="item-date">${edu.startDate || 'Start'} - ${edu.endDate || 'End'}</div>
                    </div>
                    <div class="item-subtitle">${edu.institution || 'University Name'}, ${edu.location || 'Location'}</div>
                    <p>${edu.description || 'Additional details about your education, honors, or relevant coursework.'}</p>
                `;

                educationContainer.appendChild(eduElement);
            });
        } else {
            educationContainer.innerHTML = `
                <div class="education-item">
                    <div class="item-header">
                        <div class="item-title">Degree Name</div>
                        <div class="item-date">2016 - 2020</div>
                    </div>
                    <div class="item-subtitle">University Name, Location</div>
                    <p>Additional details about your education, honors, or relevant coursework.</p>
                </div>
            `;
        }

        // Update template and format
        if (data.template && ['modern', 'classic', 'minimalist', 'executive'].includes(data.template)) {
            state.currentTemplate = data.template;
            elements.templateOptions.forEach(option => {
                if (option.getAttribute('data-template') === state.currentTemplate) {
                    option.classList.add('selected');
                } else {
                    option.classList.remove('selected');
                }
            });
        }

        if (data.theme) {
            state.currentTheme = data.theme;
            updateThemeOptions();
        }

        if (data.format === 'photo' || data.format === 'international') {
            state.currentFormat = data.format;
            if (state.currentFormat === 'photo') {
                handlePhotoFormatSelection();
            } else {
                handleInternationalFormatSelection();
            }
        }

        if (data.photo) {
            state.photoData = data.photo;
            updateCVPreview();
        }

        updateCVTemplate();
    }

    // Optional: Function to optimize content for PDF
    function optimizeForPDF() {
        const cvTemplate = document.getElementById('cvPreview');

        // Reduce font sizes slightly for PDF
        cvTemplate.style.fontSize = '13px';

        // Compact spacing
        const sections = cvTemplate.querySelectorAll('.cv-section');
        sections.forEach(section => {
            section.style.marginBottom = '15px';
        });

        const items = cvTemplate.querySelectorAll('.experience-item, .education-item');
        items.forEach(item => {
            item.style.marginBottom = '10px';
        });

        // Compact skills
        const skillTags = cvTemplate.querySelectorAll('.skill-tag');
        skillTags.forEach(tag => {
            tag.style.padding = '3px 8px';
            tag.style.fontSize = '11px';
            tag.style.margin = '2px';
        });
    }

    // Update the PDF button handler to use this optimization
    function handleSaveAsPDF() {
        // Optimize for PDF first
        optimizeForPDF();

        // Ensure the CV template is updated before printing
        updateCVTemplate();

        // Add a small delay to ensure DOM is updated
        setTimeout(() => {
            window.print();

            // Restore original styles after printing
            setTimeout(() => {
                const cvTemplate = document.getElementById('cvPreview');
                cvTemplate.style.fontSize = '';
            }, 1000);
        }, 100);
    }

    // Public API
    return {
        init: init,
        generateCV: generateCV,
        getState: () => state,
        setState: (newState) => { state = { ...state, ...newState }; },
        updateThemeOptions: updateThemeOptions,
        updateThemeSelection: updateThemeSelection,
        updateCVTemplate: updateCVTemplate,
        updateCVPreview: updateCVPreview
    };
})();