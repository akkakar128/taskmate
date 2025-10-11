document.addEventListener('DOMContentLoaded', function () {
    const jsonFileInput = document.getElementById('jsonFile');
    const uploadArea = document.getElementById('uploadArea');
    const generateBtn = document.getElementById('generateBtn');
    const printBtn = document.getElementById('printBtn');
    const pdfBtn = document.getElementById('pdfBtn');
    const exportJsonBtn = document.getElementById('exportJsonBtn');
    const form = document.getElementById('cvForm');
    const addExperienceBtn = document.getElementById('addExperience');
    const addEducationBtn = document.getElementById('addEducation');
    const experienceList = document.getElementById('experienceList');
    const educationList = document.getElementById('educationList');
    const photoFormat = document.getElementById('photoFormat');
    const internationalFormat = document.getElementById('internationalFormat');
    const photoUploadArea = document.getElementById('photoUploadArea');
    const photoFileInput = document.getElementById('photoFile');
    const photoPreview = document.getElementById('photoPreview');
    const photoPlaceholder = document.getElementById('photoPlaceholder');
    const photoError = document.getElementById('photoError');
    const photoUploadSection = document.getElementById('photoUploadSection');
    const cvPreview = document.getElementById('cvPreview');
    const downloadExample = document.getElementById('downloadExample');
    const currentFormatText = document.getElementById('currentFormatText');
    const templateOptions = document.querySelectorAll('.template-option');
    const themeOptionsContainer = document.getElementById('themeOptions');

    let experienceCount = 0;
    let educationCount = 0;
    let currentFormat = 'photo';
    let currentTemplate = 'modern';
    let currentTheme = 'blue';
    let photoData = null;

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

    // Initialize theme options
    function initializeThemes() {
        updateThemeOptions();
    }

    // Update theme options based on current template
    function updateThemeOptions() {
        themeOptionsContainer.innerHTML = '';
        const templateThemes = themes[currentTemplate];

        templateThemes.forEach(theme => {
            const themeOption = document.createElement('div');
            themeOption.className = `theme-option ${currentTheme === theme.id ? 'selected' : ''}`;
            themeOption.setAttribute('data-theme', theme.id);
            themeOption.style.backgroundColor = theme.color;
            themeOption.textContent = theme.name;
            themeOption.addEventListener('click', function () {
                currentTheme = theme.id;
                updateThemeSelection();
                updateCVTemplate();
            });
            themeOptionsContainer.appendChild(themeOption);
        });
    }

    // Update theme selection UI
    function updateThemeSelection() {
        const themeOptions = document.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            if (option.getAttribute('data-theme') === currentTheme) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
    }

    // Template selection handler
    templateOptions.forEach(option => {
        option.addEventListener('click', function () {
            templateOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            currentTemplate = this.getAttribute('data-template');
            // Reset to default theme when template changes
            currentTheme = 'blue';
            updateThemeOptions();
            updateCVTemplate();
        });
    });

    // Format selection handler
    photoFormat.addEventListener('click', function () {
        photoFormat.classList.add('selected');
        internationalFormat.classList.remove('selected');
        currentFormat = 'photo';
        currentFormatText.textContent = 'Photo';
        photoUploadSection.style.display = 'block';
        updateCVTemplate();
    });

    internationalFormat.addEventListener('click', function () {
        internationalFormat.classList.add('selected');
        photoFormat.classList.remove('selected');
        currentFormat = 'international';
        currentFormatText.textContent = 'International';
        photoUploadSection.style.display = 'none';
        updateCVTemplate();
    });

    // Update CV template
    function updateCVTemplate() {
        let templateClass = `cv-template ${currentTemplate} theme-${currentTheme}`;
        if (currentFormat === 'international') {
            templateClass += ' international';
        }
        cvPreview.className = templateClass;
        updateCVPreview();
    }

    // Upload area click handler
    uploadArea.addEventListener('click', function () {
        jsonFileInput.click();
    });

    // Photo upload area click handler
    photoUploadArea.addEventListener('click', function () {
        photoFileInput.click();
    });

    // Photo file input handler - FIXED PHOTO UPLOAD ISSUE
    photoFileInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            // Check file size (max 200KB)
            if (file.size > 200 * 1024) {
                photoError.style.display = 'block';
                photoFileInput.value = ''; // Clear the invalid file
                return;
            } else {
                photoError.style.display = 'none';
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                photoData = e.target.result;
                updateCVPreview();
                alert('Photo uploaded successfully!');
            };
            reader.onerror = function () {
                alert('Error reading file. Please try again.');
                photoFileInput.value = '';
            };
            reader.readAsDataURL(file);
        }
    });

    // JSON file upload handler
    jsonFileInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const jsonData = JSON.parse(e.target.result);
                    populateForm(jsonData);
                    generateCV(jsonData);
                    alert('JSON file loaded successfully!');
                } catch (error) {
                    alert('Error parsing JSON file. Please check the format.');
                    console.error(error);
                }
            };
            reader.readAsText(file);
        }
    });

    // Download JSON Example based on current format
    downloadExample.addEventListener('click', function () {
        let exampleData;
        let filename;

        if (currentFormat === 'photo') {
            exampleData = {
                "format": "photo",
                "template": currentTemplate,
                "theme": currentTheme,
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
            filename = `${currentTemplate}-${currentTheme}-photo-cv-example.json`;
        } else {
            exampleData = {
                "format": "international",
                "template": currentTemplate,
                "theme": currentTheme,
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
            filename = `${currentTemplate}-${currentTheme}-international-cv-example.json`;
        }

        downloadJSON(exampleData, filename);
    });

    // Helper function to download JSON
    function downloadJSON(data, filename) {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Add experience handler
    addExperienceBtn.addEventListener('click', function () {
        experienceCount++;
        const experienceItem = document.createElement('div');
        experienceItem.className = 'dynamic-item';
        experienceItem.innerHTML = `
                    <button type="button" class="remove-btn" onclick="this.parentElement.remove()">×</button>
                    <div class="form-group">
                        <label for="expTitle${experienceCount}">Job Title</label>
                        <input type="text" id="expTitle${experienceCount}" placeholder="e.g., Marketing Manager">
                    </div>
                    <div class="form-group">
                        <label for="expCompany${experienceCount}">Company</label>
                        <input type="text" id="expCompany${experienceCount}" placeholder="Company Name">
                    </div>
                    <div class="form-group">
                        <label for="expLocation${experienceCount}">Location</label>
                        <input type="text" id="expLocation${experienceCount}" placeholder="City, State">
                    </div>
                    <div class="form-group">
                        <label for="expStart${experienceCount}">Start Date</label>
                        <input type="text" id="expStart${experienceCount}" placeholder="MMM YYYY (e.g., Jan 2020)">
                    </div>
                    <div class="form-group">
                        <label for="expEnd${experienceCount}">End Date</label>
                        <input type="text" id="expEnd${experienceCount}" placeholder="MMM YYYY or Present">
                    </div>
                    <div class="form-group">
                        <label for="expDescription${experienceCount}">Description</label>
                        <textarea id="expDescription${experienceCount}" placeholder="Describe your responsibilities and achievements"></textarea>
                    </div>
                `;
        experienceList.appendChild(experienceItem);
    });

    // Add education handler
    addEducationBtn.addEventListener('click', function () {
        educationCount++;
        const educationItem = document.createElement('div');
        educationItem.className = 'dynamic-item';
        educationItem.innerHTML = `
                    <button type="button" class="remove-btn" onclick="this.parentElement.remove()">×</button>
                    <div class="form-group">
                        <label for="eduDegree${educationCount}">Degree/Certificate</label>
                        <input type="text" id="eduDegree${educationCount}" placeholder="e.g., Bachelor of Science in Business">
                    </div>
                    <div class="form-group">
                        <label for="eduInstitution${educationCount}">Institution</label>
                        <input type="text" id="eduInstitution${educationCount}" placeholder="University Name">
                    </div>
                    <div class="form-group">
                        <label for="eduLocation${educationCount}">Location</label>
                        <input type="text" id="eduLocation${educationCount}" placeholder="City, State">
                    </div>
                    <div class="form-group">
                        <label for="eduStart${educationCount}">Start Date</label>
                        <input type="text" id="eduStart${educationCount}" placeholder="MMM YYYY (e.g., Aug 2016)">
                    </div>
                    <div class="form-group">
                        <label for="eduEnd${educationCount}">End Date</label>
                        <input type="text" id="eduEnd${educationCount}" placeholder="MMM YYYY or Present">
                    </div>
                    <div class="form-group">
                        <label for="eduDescription${educationCount}">Description</label>
                        <textarea id="eduDescription${educationCount}" placeholder="Honors, relevant coursework, or achievements"></textarea>
                    </div>
                `;
        educationList.appendChild(educationItem);
    });

    // Generate CV from form data
    generateBtn.addEventListener('click', function () {
        const formData = getFormData();
        generateCV(formData);
    });

    // Print CV - UPDATED
    printBtn.addEventListener('click', function () {
        // Ensure the CV template is updated before printing
        updateCVTemplate();

        // Add a small delay to ensure DOM is updated
        setTimeout(() => {
            window.print();
        }, 100);
    });

    // Save as PDF (using browser's print to PDF functionality) - UPDATED
    pdfBtn.addEventListener('click', function () {
        // Ensure the CV template is updated before printing
        updateCVTemplate();

        // Add a small delay to ensure DOM is updated
        setTimeout(() => {
            window.print();
        }, 100);
    });

    // Export JSON
    exportJsonBtn.addEventListener('click', function () {
        const formData = getFormData();
        const jsonString = JSON.stringify(formData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cv-data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // Update CV preview based on format - FIXED PHOTO DISPLAY ISSUE
    function updateCVPreview() {
        if (currentFormat === 'photo') {
            // Show photo in Photo CV format
            if (photoData) {
                photoPreview.src = photoData;
                photoPreview.classList.remove('hidden');
                photoPlaceholder.classList.add('hidden');
            } else {
                photoPreview.classList.add('hidden');
                photoPlaceholder.classList.remove('hidden');
            }
        } else {
            // Hide photo in International format
            photoPreview.classList.add('hidden');
            photoPlaceholder.classList.add('hidden');
        }
    }

    // Helper function to populate form with JSON data
    function populateForm(data) {
        document.getElementById('fullName').value = data.personalInfo?.name || '';
        document.getElementById('jobTitle').value = data.personalInfo?.title || '';
        document.getElementById('email').value = data.contact?.email || '';
        document.getElementById('phone').value = data.contact?.phone || '';
        document.getElementById('location').value = data.contact?.location || '';
        document.getElementById('linkedin').value = data.contact?.linkedin || '';
        document.getElementById('github').value = data.contact?.github || '';
        document.getElementById('portfolio').value = data.contact?.portfolio || '';
        document.getElementById('summary').value = data.summary || '';
        document.getElementById('skills').value = data.skills?.join(', ') || '';
        document.getElementById('languages').value = data.languages?.map(lang =>
            `${lang.language}${lang.proficiency ? ` (${lang.proficiency})` : ''}`).join(', ') || '';
        document.getElementById('certifications').value = data.certifications?.join(', ') || '';

        // Set template if specified in JSON
        if (data.template && ['modern', 'classic', 'minimalist', 'executive'].includes(data.template)) {
            currentTemplate = data.template;
            templateOptions.forEach(option => {
                if (option.getAttribute('data-template') === currentTemplate) {
                    option.classList.add('selected');
                } else {
                    option.classList.remove('selected');
                }
            });
        }

        // Set theme if specified in JSON
        if (data.theme) {
            currentTheme = data.theme;
            updateThemeOptions();
        }

        // Set format if specified in JSON
        if (data.format === 'photo' || data.format === 'international') {
            currentFormat = data.format;
            if (currentFormat === 'photo') {
                photoFormat.click();
            } else {
                internationalFormat.click();
            }
        }

        // Set photo if available in JSON
        if (data.photo) {
            photoData = data.photo;
            updateCVPreview();
        }

        // Clear existing dynamic lists
        experienceList.innerHTML = '';
        educationList.innerHTML = '';

        // Populate experience
        if (data.experience && data.experience.length > 0) {
            data.experience.forEach((exp, index) => {
                experienceCount++;
                const experienceItem = document.createElement('div');
                experienceItem.className = 'dynamic-item';
                experienceItem.innerHTML = `
                            <button type="button" class="remove-btn" onclick="this.parentElement.remove()">×</button>
                            <div class="form-group">
                                <label for="expTitle${experienceCount}">Job Title</label>
                                <input type="text" id="expTitle${experienceCount}" value="${exp.title || ''}" placeholder="e.g., Marketing Manager">
                            </div>
                            <div class="form-group">
                                <label for="expCompany${experienceCount}">Company</label>
                                <input type="text" id="expCompany${experienceCount}" value="${exp.company || ''}" placeholder="Company Name">
                            </div>
                            <div class="form-group">
                                <label for="expLocation${experienceCount}">Location</label>
                                <input type="text" id="expLocation${experienceCount}" value="${exp.location || ''}" placeholder="City, State">
                            </div>
                            <div class="form-group">
                                <label for="expStart${experienceCount}">Start Date</label>
                                <input type="text" id="expStart${experienceCount}" value="${exp.startDate || ''}" placeholder="MMM YYYY (e.g., Jan 2020)">
                            </div>
                            <div class="form-group">
                                <label for="expEnd${experienceCount}">End Date</label>
                                <input type="text" id="expEnd${experienceCount}" value="${exp.endDate || ''}" placeholder="MMM YYYY or Present">
                            </div>
                            <div class="form-group">
                                <label for="expDescription${experienceCount}">Description</label>
                                <textarea id="expDescription${experienceCount}" placeholder="Describe your responsibilities and achievements">${exp.description || ''}</textarea>
                            </div>
                        `;
                experienceList.appendChild(experienceItem);
            });
        }

        // Populate education
        if (data.education && data.education.length > 0) {
            data.education.forEach((edu, index) => {
                educationCount++;
                const educationItem = document.createElement('div');
                educationItem.className = 'dynamic-item';
                educationItem.innerHTML = `
                            <button type="button" class="remove-btn" onclick="this.parentElement.remove()">×</button>
                            <div class="form-group">
                                <label for="eduDegree${educationCount}">Degree/Certificate</label>
                                <input type="text" id="eduDegree${educationCount}" value="${edu.degree || ''}" placeholder="e.g., Bachelor of Science in Business">
                            </div>
                            <div class="form-group">
                                <label for="eduInstitution${educationCount}">Institution</label>
                                <input type="text" id="eduInstitution${educationCount}" value="${edu.institution || ''}" placeholder="University Name">
                            </div>
                            <div class="form-group">
                                <label for="eduLocation${educationCount}">Location</label>
                                <input type="text" id="eduLocation${educationCount}" value="${edu.location || ''}" placeholder="City, State">
                            </div>
                            <div class="form-group">
                                <label for="eduStart${educationCount}">Start Date</label>
                                <input type="text" id="eduStart${educationCount}" value="${edu.startDate || ''}" placeholder="MMM YYYY (e.g., Aug 2016)">
                            </div>
                            <div class="form-group">
                                <label for="eduEnd${educationCount}">End Date</label>
                                <input type="text" id="eduEnd${educationCount}" value="${edu.endDate || ''}" placeholder="MMM YYYY or Present">
                            </div>
                            <div class="form-group">
                                <label for="eduDescription${educationCount}">Description</label>
                                <textarea id="eduDescription${educationCount}" placeholder="Honors, relevant coursework, or achievements">${edu.description || ''}</textarea>
                            </div>
                        `;
                educationList.appendChild(educationItem);
            });
        }

        updateCVTemplate();
    }

    // Helper function to get form data
    function getFormData() {
        const data = {
            personalInfo: {
                name: document.getElementById('fullName').value,
                title: document.getElementById('jobTitle').value
            },
            contact: {
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                location: document.getElementById('location').value,
                linkedin: document.getElementById('linkedin').value,
                github: document.getElementById('github').value,
                portfolio: document.getElementById('portfolio').value
            },
            summary: document.getElementById('summary').value,
            skills: document.getElementById('skills').value.split(',').map(skill => skill.trim()),
            certifications: document.getElementById('certifications').value.split(',').map(cert => cert.trim()),
            experience: [],
            education: [],
            languages: [],
            format: currentFormat,
            template: currentTemplate,
            theme: currentTheme
        };

        // Add photo data if available
        if (photoData) {
            data.photo = photoData;
        }

        // Parse languages
        const languagesInput = document.getElementById('languages').value;
        if (languagesInput) {
            data.languages = languagesInput.split(',').map(lang => {
                const langParts = lang.trim().split('(');
                const language = langParts[0].trim();
                const proficiency = langParts[1] ? langParts[1].replace(')', '').trim() : '';
                return { language, proficiency };
            });
        }

        // Get experience data
        const experienceItems = document.querySelectorAll('#experienceList .dynamic-item');
        experienceItems.forEach(item => {
            const title = item.querySelector('input[id^="expTitle"]').value;
            const company = item.querySelector('input[id^="expCompany"]').value;
            const location = item.querySelector('input[id^="expLocation"]').value;
            const startDate = item.querySelector('input[id^="expStart"]').value;
            const endDate = item.querySelector('input[id^="expEnd"]').value;
            const description = item.querySelector('textarea[id^="expDescription"]').value;

            if (title || company) {
                data.experience.push({
                    title,
                    company,
                    location,
                    startDate,
                    endDate,
                    description
                });
            }
        });

        // Get education data
        const educationItems = document.querySelectorAll('#educationList .dynamic-item');
        educationItems.forEach(item => {
            const degree = item.querySelector('input[id^="eduDegree"]').value;
            const institution = item.querySelector('input[id^="eduInstitution"]').value;
            const location = item.querySelector('input[id^="eduLocation"]').value;
            const startDate = item.querySelector('input[id^="eduStart"]').value;
            const endDate = item.querySelector('input[id^="eduEnd"]').value;
            const description = item.querySelector('textarea[id^="eduDescription"]').value;

            if (degree || institution) {
                data.education.push({
                    degree,
                    institution,
                    location,
                    startDate,
                    endDate,
                    description
                });
            }
        });

        return data;
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
            currentTemplate = data.template;
            templateOptions.forEach(option => {
                if (option.getAttribute('data-template') === currentTemplate) {
                    option.classList.add('selected');
                } else {
                    option.classList.remove('selected');
                }
            });
        }

        if (data.theme) {
            currentTheme = data.theme;
            updateThemeOptions();
        }

        if (data.format === 'photo' || data.format === 'international') {
            currentFormat = data.format;
            if (currentFormat === 'photo') {
                photoFormat.click();
            } else {
                internationalFormat.click();
            }
        }

        if (data.photo) {
            photoData = data.photo;
            updateCVPreview();
        }

        updateCVTemplate();
    }

    // Initialize with sample data
    initializeThemes();
    addExperienceBtn.click();
    addEducationBtn.click();
    generateCV(getFormData());
});