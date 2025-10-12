// Form handling and data management
const FormHandler = (function () {
    // Helper function to populate form with JSON data
    // Helper function to populate form with JSON data
    // Helper function to populate form with JSON data
    function populateForm(data) {
        // Update basic form fields
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

        // Update application state for template, theme, and format
        if (data.template && ['modern', 'classic', 'minimalist', 'executive'].includes(data.template)) {
            CVGenerator.setState({ currentTemplate: data.template });
            // Update UI selection
            document.querySelectorAll('.template-option').forEach(option => {
                if (option.getAttribute('data-template') === data.template) {
                    option.classList.add('selected');
                } else {
                    option.classList.remove('selected');
                }
            });
        }

        if (data.theme) {
            CVGenerator.setState({ currentTheme: data.theme });
            // Update theme options using public method
            CVGenerator.updateThemeOptions();
            CVGenerator.updateThemeSelection();
        }

        if (data.format === 'photo' || data.format === 'international') {
            CVGenerator.setState({ currentFormat: data.format });
            // Update UI selection
            if (data.format === 'photo') {
                document.getElementById('photoFormat').classList.add('selected');
                document.getElementById('internationalFormat').classList.remove('selected');
                document.getElementById('photoUploadSection').style.display = 'block';
            } else {
                document.getElementById('internationalFormat').classList.add('selected');
                document.getElementById('photoFormat').classList.remove('selected');
                document.getElementById('photoUploadSection').style.display = 'none';
            }
            // Update format text
            document.getElementById('currentFormatText').textContent = data.format === 'photo' ? 'Photo' : 'International';
            document.getElementById('currentFormatText2').textContent = data.format === 'photo' ? 'Photo' : 'International';
        }

        // Set photo if available in data
        if (data.photo) {
            CVGenerator.setState({ photoData: data.photo });
        }

        // Clear existing dynamic lists
        document.getElementById('experienceList').innerHTML = '';
        document.getElementById('educationList').innerHTML = '';

        let experienceCount = 0;
        let educationCount = 0;

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
                document.getElementById('experienceList').appendChild(experienceItem);
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
                document.getElementById('educationList').appendChild(educationItem);
            });
        }

        // Update the counters in the state
        CVGenerator.setState({
            experienceCount: experienceCount,
            educationCount: educationCount
        });

        // Update CV template and preview using public methods
        CVGenerator.updateCVTemplate();
        CVGenerator.updateCVPreview();
    }

    // Helper function to get form data
    function getFormData() {
        const state = CVGenerator.getState();
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
            format: state.currentFormat,
            template: state.currentTemplate,
            theme: state.currentTheme
        };

        // Add photo data if available
        if (state.photoData) {
            data.photo = state.photoData;
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

    // Public API
    return {
        populateForm: populateForm,
        getFormData: getFormData
    };
})();