// CGPA Calculator - JavaScript
// Philippines Grading System (1.0 - 5.0 Scale)

class CGPACalculator {
    constructor() {
        this.courses = [];
        this.studentInfo = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadDataFromStorage();
    }

    bindEvents() {
        // Student form submission
        document.getElementById('studentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveStudentInfo();
        });

        // Course form submission
        document.getElementById('courseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addCourse();
        });

        // Calculate CGPA button
        document.getElementById('calculateBtn').addEventListener('click', () => {
            this.calculateCGPA();
        });

        // Clear all button
        document.getElementById('clearAllBtn').addEventListener('click', () => {
            this.clearAllCourses();
        });

        // Edit student info button
        document.getElementById('editStudentBtn').addEventListener('click', () => {
            this.editStudentInfo();
        });

        // Clear profile button
        const clearProfileBtn = document.getElementById('clearProfileBtn');
        if (clearProfileBtn) {
            clearProfileBtn.addEventListener('click', () => this.clearProfile());
        }

        // Export results button
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportResults());
        }

        // Print button
        const printBtn = document.getElementById('printBtn');
        if (printBtn) {
            printBtn.addEventListener('click', () => printResults());
        }
    }

    clearProfile() {
        if (!this.studentInfo && this.courses.length === 0) {
            this.showAlert('Nothing to clear', 'info');
            return;
        }

        if (confirm('Clear profile and all saved courses? This will remove your data.')) {
            this.studentInfo = null;
            this.courses = [];

            // Reset UI
            const studentForm = document.getElementById('studentForm');
            const studentDisplay = document.getElementById('studentDisplay');
            studentForm.reset();
            studentForm.style.display = 'block';
            studentDisplay.style.display = 'none';

            const addCourseBtn = document.getElementById('addCourseBtn');
            const courseInputs = document.querySelectorAll('#courseForm input, #courseForm select');
            addCourseBtn.disabled = true;
            courseInputs.forEach(input => {
                input.value = '';
                input.disabled = true;
            });

            const note = document.querySelector('.note');
            if (note) note.style.display = 'block';

            // Clear list and results
            this.renderCourses();
            this.hideResults();
            this.clearDataFromStorage();
            this.showAlert('Profile and courses cleared', 'success');
        }
    }

    saveStudentInfo() {
        const studentName = document.getElementById('studentName').value.trim();
        const studentGrade = document.getElementById('studentGrade').value;
        const studentSection = document.getElementById('studentSection').value.trim();

        if (!studentName || !studentGrade || !studentSection) {
            this.showAlert('Please fill in all student information fields', 'error');
            return;
        }

        if (!validateStudentName(studentName)) {
            this.showAlert('Invalid student name', 'error');
            return;
        }

        this.studentInfo = {
            name: studentName,
            grade: studentGrade,
            section: studentSection
        };

        this.displayStudentInfo();
        this.enableCourseForm();
        this.saveDataToStorage();
        this.showAlert('Student information saved successfully!', 'success');
    }

    displayStudentInfo() {
        const studentForm = document.getElementById('studentForm');
        const studentDisplay = document.getElementById('studentDisplay');
        
        document.getElementById('displayName').textContent = this.studentInfo.name;
        document.getElementById('displayGrade').textContent = this.studentInfo.grade;
        document.getElementById('displaySection').textContent = this.studentInfo.section;

        studentForm.style.display = 'none';
        studentDisplay.style.display = 'block';
    }

    editStudentInfo() {
        const studentForm = document.getElementById('studentForm');
        const studentDisplay = document.getElementById('studentDisplay');
        
        // Pre-fill the form with current data
        document.getElementById('studentName').value = this.studentInfo.name;
        document.getElementById('studentGrade').value = this.studentInfo.grade;
        document.getElementById('studentSection').value = this.studentInfo.section;

        studentForm.style.display = 'block';
        studentDisplay.style.display = 'none';
    }

    enableCourseForm() {
        const addCourseBtn = document.getElementById('addCourseBtn');
        const courseInputs = document.querySelectorAll('#courseForm input, #courseForm select');
        
        addCourseBtn.disabled = false;
        courseInputs.forEach(input => input.disabled = false);
        
        // Hide the note
        const note = document.querySelector('.note');
        if (note) {
            note.style.display = 'none';
        }

        // Focus on course name input
        document.getElementById('courseName').focus();
    }

    addCourse() {
        if (!this.studentInfo) {
            this.showAlert('Please save student information first', 'error');
            return;
        }

        const courseName = document.getElementById('courseName').value.trim();
        const units = parseInt(document.getElementById('units').value);
        const grade = parseFloat(document.getElementById('grade').value);

        if (!courseName || !units || !grade) {
            this.showAlert('Please fill in all course fields', 'error');
            return;
        }

        if (!validateUnits(units)) {
            this.showAlert('Units must be a whole number between 1 and 10', 'error');
            return;
        }

        if (!validateGrade(grade)) {
            this.showAlert('Please select a valid grade from the list', 'error');
            return;
        }

        const course = {
            id: Date.now(),
            name: courseName,
            units: units,
            grade: grade,
            gradePoints: grade * units
        };

        this.courses.push(course);
        this.renderCourses();
        this.clearCourseForm();
        this.saveDataToStorage();
        this.showAlert('Course added successfully!', 'success');
    }

    removeCourse(courseId) {
        this.courses = this.courses.filter(course => course.id !== courseId);
        this.renderCourses();
        this.saveDataToStorage();
        this.hideResults();
        this.showAlert('Course removed successfully!', 'success');
    }

    renderCourses() {
        const coursesList = document.getElementById('coursesList');
        const actionButtons = document.getElementById('actionButtons');

        if (this.courses.length === 0) {
            coursesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No courses added yet. Add your first course above!</p>
                </div>
            `;
            actionButtons.style.display = 'none';
            return;
        }

        coursesList.innerHTML = this.courses.map(course => `
            <div class="course-item fade-in">
                <div class="course-info">
                    <div class="course-name">${course.name}</div>
                    <div class="course-details">
                        Units: ${course.units} | Grade Points: ${course.gradePoints.toFixed(2)}
                    </div>
                </div>
                <div class="course-grade">
                    <div class="grade-value">${course.grade.toFixed(2)}</div>
                    <div class="grade-points">${this.getGradeDescription(course.grade)}</div>
                </div>
                <button onclick="calculator.removeCourse(${course.id})" class="btn btn-remove">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        actionButtons.style.display = 'flex';
    }

    calculateCGPA() {
        if (this.courses.length === 0) {
            this.showAlert('Please add at least one course', 'error');
            return;
        }

        const totalUnits = this.courses.reduce((sum, course) => sum + course.units, 0);
        const totalGradePoints = this.courses.reduce((sum, course) => sum + course.gradePoints, 0);
        const cgpa = totalGradePoints / totalUnits;

        this.displayResults(cgpa, totalUnits, totalGradePoints);
    }

    displayResults(cgpa, totalUnits, totalGradePoints) {
        const resultsSection = document.getElementById('resultsSection');
        const cgpaValue = document.getElementById('cgpaValue');
        const totalCoursesEl = document.getElementById('totalCourses');
        const totalUnitsEl = document.getElementById('totalUnits');
        const totalGradePointsEl = document.getElementById('totalGradePoints');
        const performanceIndicator = document.getElementById('performanceIndicator');

        cgpaValue.textContent = cgpa.toFixed(2);
        totalCoursesEl.textContent = this.courses.length;
        totalUnitsEl.textContent = totalUnits;
        totalGradePointsEl.textContent = totalGradePoints.toFixed(2);

        const performance = this.getPerformanceIndicator(cgpa);
        performanceIndicator.innerHTML = `
            <div class="indicator-text">${performance.title}</div>
            <div class="indicator-description">${performance.description}</div>
        `;

        resultsSection.style.display = 'block';
        resultsSection.classList.add('fade-in');
        
        // Smooth scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    hideResults() {
        const resultsSection = document.getElementById('resultsSection');
        resultsSection.style.display = 'none';
    }

    getGradeDescription(grade) {
        if (grade === 1.0) return 'Outstanding';
        if (grade === 1.25) return 'Excellent';
        if (grade === 1.5) return 'Very Good';
        if (grade === 1.75) return 'Good';
        if (grade === 2.0) return 'Satisfactory';
        if (grade === 2.25) return 'Fair';
        if (grade <= 2.75) return 'Pass';
        if (grade === 3.0) return 'Pass';
        if (grade === 4.0) return 'Conditional';
        if (grade === 5.0) return 'Failed';
        return 'Unknown';
    }

    getPerformanceIndicator(cgpa) {
        if (cgpa <= 1.5) {
            return {
                title: 'Excellent Performance! 🏆',
                description: 'Dean\'s List - Outstanding academic achievement (93-100%)'
            };
        } else if (cgpa <= 2.0) {
            return {
                title: 'Very Good Performance! 🌟',
                description: 'Strong academic performance (84-92%)'
            };
        } else if (cgpa <= 2.5) {
            return {
                title: 'Good Performance! 👍',
                description: 'Solid academic standing (78-83%)'
            };
        } else if (cgpa <= 3.0) {
            return {
                title: 'Satisfactory Performance ✓',
                description: 'Meeting graduation requirements (75-77%)'
            };
        } else if (cgpa <= 4.0) {
            return {
                title: 'Needs Improvement ⚠️',
                description: 'Conditional standing - improvement required (65-74%)'
            };
        } else {
            return {
                title: 'Critical Status ❌',
                description: 'Academic probation - immediate action needed (Below 65%)'
            };
        }
    }

    clearCourseForm() {
        document.getElementById('courseName').value = '';
        document.getElementById('units').value = '';
        document.getElementById('grade').value = '';
        document.getElementById('courseName').focus();
    }

    clearAllCourses() {
        if (this.courses.length === 0) {
            this.showAlert('No courses to clear', 'info');
            return;
        }

        if (confirm('Are you sure you want to clear all courses? This action cannot be undone.')) {
            this.courses = [];
            this.renderCourses();
            this.hideResults();
            this.saveDataToStorage();
            this.showAlert('All courses cleared successfully!', 'success');
        }
    }

    showAlert(message, type = 'info') {
        // Remove existing alerts
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        // Create alert element
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;

        // Accessibility roles
        alert.setAttribute('role', type === 'error' ? 'alert' : 'status');
        alert.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');

        // Set background color based on type
        switch (type) {
            case 'success':
                alert.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
                break;
            case 'error':
                alert.style.background = 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)';
                break;
            case 'info':
                alert.style.background = 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)';
                break;
        }

        alert.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${message}
        `;

        document.body.appendChild(alert);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 3000);
    }

    // Storage Methods - use localStorage for persistence
    saveDataToStorage() {
        try {
            if (window && window.localStorage) {
                const payload = {
                    studentInfo: this.studentInfo,
                    courses: this.courses
                };
                localStorage.setItem('cgpa_calculator_data', JSON.stringify(payload));
            }
        } catch (e) {
            console.warn('Unable to access localStorage:', e);
        }
    }

    loadDataFromStorage() {
        try {
            if (window && window.localStorage) {
                const raw = localStorage.getItem('cgpa_calculator_data');
                if (raw) {
                    const data = JSON.parse(raw);
                    this.studentInfo = data.studentInfo || null;
                    this.courses = Array.isArray(data.courses) ? data.courses : [];
                }
            }
        } catch (e) {
            console.warn('Unable to read from localStorage:', e);
        }
        
        // Initialize form states and render if data exists
        this.updateFormStates();
        this.renderCourses();
    }

    updateFormStates() {
        const addCourseBtn = document.getElementById('addCourseBtn');
        const courseInputs = document.querySelectorAll('#courseForm input, #courseForm select');
        
        if (!this.studentInfo) {
            addCourseBtn.disabled = true;
            courseInputs.forEach(input => input.disabled = true);
        } else {
            this.displayStudentInfo();
            this.enableCourseForm();
        }
    }

    clearDataFromStorage() {
        try {
            if (window && window.localStorage) {
                localStorage.removeItem('cgpa_calculator_data');
            }
        } catch (e) {
            console.warn('Unable to clear localStorage:', e);
        }
    }

    // Export functionality (PDF)
    exportResults() {
        if (!this.studentInfo || this.courses.length === 0) {
            this.showAlert('No data to export', 'error');
            return;
        }
        const totalUnits = this.courses.reduce((sum, course) => sum + course.units, 0);
        const totalGradePoints = this.courses.reduce((sum, course) => sum + course.gradePoints, 0);
        const cgpa = totalGradePoints / totalUnits;

        // jsPDF UMD
        try {
            const { jsPDF } = window.jspdf || {};
            if (!jsPDF) throw new Error('jsPDF not loaded');
            const doc = new jsPDF({ unit: 'pt', format: 'a4' });

            const margin = 48;
            let y = margin;

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(18);
            doc.text('CGPA Calculation Report', margin, y);
            y += 24;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            doc.text(`Date: ${new Date().toLocaleString()}`, margin, y);
            y += 24;

            // Student info
            doc.setFont('helvetica', 'bold');
            doc.text('Student Information', margin, y);
            y += 16;
            doc.setFont('helvetica', 'normal');
            doc.text(`Name: ${this.studentInfo.name}`, margin, y); y += 16;
            doc.text(`Grade Level: ${this.studentInfo.grade}`, margin, y); y += 16;
            doc.text(`Section: ${this.studentInfo.section}`, margin, y); y += 24;

            // Courses
            doc.setFont('helvetica', 'bold');
            doc.text('Courses', margin, y); y += 16;
            doc.setFont('helvetica', 'normal');

            const lineHeight = 16;
            this.courses.forEach((course, index) => {
                const row = `${index + 1}. ${course.name}  |  Units: ${course.units}  |  Grade: ${course.grade}  |  Grade Points: ${course.gradePoints.toFixed(2)}`;
                // Add new page if near bottom
                if (y > doc.internal.pageSize.getHeight() - margin) {
                    doc.addPage();
                    y = margin;
                }
                doc.text(row, margin, y);
                y += lineHeight;
            });

            y += 8;
            if (y > doc.internal.pageSize.getHeight() - margin) { doc.addPage(); y = margin; }
            doc.setDrawColor(200);
            doc.line(margin, y, doc.internal.pageSize.getWidth() - margin, y);
            y += 16;

            // Summary
            doc.setFont('helvetica', 'bold');
            doc.text('Summary', margin, y); y += 16;
            doc.setFont('helvetica', 'normal');
            doc.text(`Total Courses: ${this.courses.length}`, margin, y); y += 16;
            doc.text(`Total Units: ${totalUnits}`, margin, y); y += 16;
            doc.text(`Total Grade Points: ${totalGradePoints.toFixed(2)}`, margin, y); y += 16;
            doc.text(`CGPA: ${cgpa.toFixed(2)}`, margin, y); y += 16;

            const performance = this.getPerformanceIndicator(cgpa);
            doc.text(`Performance: ${performance.title}`, margin, y); y += 16;
            doc.text(`Description: ${performance.description}`, margin, y);

            const fileName = `CGPA_Report_${this.studentInfo.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            this.showAlert('PDF exported successfully!', 'success');
        } catch (e) {
            console.error(e);
            this.showAlert('Failed to export PDF. Please check your internet connection.', 'error');
        }
    }

    // Grade recommendation system
    getGradeRecommendation(targetCGPA, remainingUnits) {
        if (this.courses.length === 0) {
            return {
                message: "Add some courses first to get recommendations",
                requiredGrade: null
            };
        }
        
        const currentUnits = this.courses.reduce((sum, course) => sum + course.units, 0);
        const currentGradePoints = this.courses.reduce((sum, course) => sum + course.gradePoints, 0);
        
        const totalUnits = currentUnits + remainingUnits;
        const requiredTotalGradePoints = targetCGPA * totalUnits;
        const requiredRemainingGradePoints = requiredTotalGradePoints - currentGradePoints;
        const requiredGrade = requiredRemainingGradePoints / remainingUnits;
        
        if (requiredGrade < 1.0) {
            return {
                message: `Great! You can achieve your target CGPA of ${targetCGPA} even with perfect grades (1.0) in remaining courses.`,
                requiredGrade: 1.0
            };
        } else if (requiredGrade > 5.0) {
            return {
                message: `Unfortunately, achieving a CGPA of ${targetCGPA} is not possible with the remaining ${remainingUnits} units.`,
                requiredGrade: null
            };
        } else {
            return {
                message: `To achieve a CGPA of ${targetCGPA}, you need an average grade of ${requiredGrade.toFixed(2)} in your remaining ${remainingUnits} units.`,
                requiredGrade: requiredGrade
            };
        }
    }
}

// Initialize the calculator when DOM is loaded
let calculator;

document.addEventListener('DOMContentLoaded', function() {
    calculator = new CGPACalculator();
    
    // Add some sample validation and user experience improvements
    const studentNameInput = document.getElementById('studentName');
    const courseNameInput = document.getElementById('courseName');
    const unitsInput = document.getElementById('units');
    const gradeSelect = document.getElementById('grade');
    
    // Auto-capitalize names
    studentNameInput.addEventListener('input', function() {
        this.value = this.value.replace(/\b\w/g, l => l.toUpperCase());
    });
    
    courseNameInput.addEventListener('input', function() {
        this.value = this.value.replace(/\b\w/g, l => l.toUpperCase());
    });
    
    // Limit units input
    unitsInput.addEventListener('input', function() {
        if (this.value > 10) this.value = 10;
        if (this.value < 1) this.value = 1;
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter to calculate CGPA
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (calculator.courses.length > 0) {
                calculator.calculateCGPA();
            }
        }
        
        // Escape key to clear course form
        if (e.key === 'Escape') {
            calculator.clearCourseForm();
        }
    });
    
    // Add focus management
    studentNameInput.focus();
});

// Additional utility functions
function printResults() {
    if (!calculator.studentInfo || calculator.courses.length === 0) {
        calculator.showAlert('No data to print', 'error');
        return;
    }
    
    window.print();
}

// Validation helpers
function validateGrade(grade) {
    const validGrades = [1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 4.0, 5.0];
    return validGrades.includes(parseFloat(grade));
}

function validateUnits(units) {
    return units >= 1 && units <= 10 && Number.isInteger(units);
}

function validateStudentName(name) {
    return name.trim().length >= 2 && /^[a-zA-Z\s.,-]+$/.test(name);
}