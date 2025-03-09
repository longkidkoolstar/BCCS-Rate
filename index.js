// Constants
const API_URL = 'https://api.jsonstorage.net/v1/json/d206ce58-9543-48db-a5e4-997cfc745ef3/c390d482-417d-42dc-b53f-687f4367141b';
const API_KEY = '42293adc-9756-411d-b058-cc6724ba423c';

// DOM Elements
const teacherListElement = document.getElementById('teacher-list');
const leaderboardBodyElement = document.getElementById('leaderboard-body');
const rankingSystemListElement = document.getElementById('ranking-system-list');
const teacherSelectElement = document.getElementById('teacher-select');
const ratingForm = document.getElementById('rating-form');
const stars = document.querySelectorAll('.star-rating i');
const ratingValueInput = document.getElementById('rating-value');

// Templates
const teacherCardTemplate = document.getElementById('teacher-card-template');
const ratingItemTemplate = document.getElementById('rating-item-template');

// Global Data Storage
let teachersData = [];
let rankingSystem = {};

// Konami Code sequence
const konamiCode = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'b', 'a'
];

let konamiCodePosition = 0;

// Function to handle the Konami Code
function handleKonamiCode(e) {
    const key = e.key;
    
    if (key === konamiCode[konamiCodePosition]) {
        konamiCodePosition++;
        
        if (konamiCodePosition === konamiCode.length) {
            // Trigger admin commands
            alert('Admin commands activated!');
            activateAdminMode();
            // Reset position for future use
            konamiCodePosition = 0;
        }
    } else {
        konamiCodePosition = 0; // Reset if the sequence is broken
    }
}

// Add event listener for keydown
document.addEventListener('keydown', handleKonamiCode);

// Fetch data from API
async function fetchData() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        
        // Store data globally
        teachersData = data.teachers;
        rankingSystem = data.ranking_system;
        
        // Initialize the app
        renderTeachers();
        renderLeaderboard(data.leaderboard);
        renderRankingSystem();
        populateTeacherSelect();
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to load data. Please try again later.');
    }
}

// Updated star rating functionality with half-star support
function initializeStarRating() {
    const starContainer = document.querySelector('.star-rating');
    const ratingInput = document.getElementById('rating-value');
    const stars = starContainer.querySelectorAll('i');
    
    // Function to update stars display
    function updateStars(rating) {
      stars.forEach((star, index) => {
        const position = index + 1;
        
        // Reset all stars
        star.className = 'far fa-star';
        
        if (position <= Math.floor(rating)) {
          // Full star
          star.className = 'fas fa-star';
        } else if (position === Math.ceil(rating) && rating % 1 !== 0) {
          // Half star
          star.className = 'fas fa-star-half-alt';
        }
      });
      
      // Update hidden input value
      ratingInput.value = rating;
    }
    
    // Add event listeners for mouse movement
    starContainer.addEventListener('mousemove', (e) => {
      const star = e.target;
      if (star.tagName === 'I') {
        const rect = star.getBoundingClientRect();
        const starMiddle = rect.left + rect.width / 2;
        const position = parseInt(star.dataset.rating);
        
        // Determine if mouse is on left half (half star) or right half (full star)
        let rating;
        if (e.clientX < starMiddle) {
          rating = position - 0.5;
        } else {
          rating = position;
        }
        
        updateStars(rating);
      }
    });
    
    // Handle click to set the rating
    starContainer.addEventListener('click', (e) => {
      const star = e.target;
      if (star.tagName === 'I') {
        // Rating is already set by mousemove
        // Just keep it as is
      }
    });
    
    // Reset stars when mouse leaves container
    starContainer.addEventListener('mouseleave', () => {
      updateStars(parseFloat(ratingInput.value) || 0);
    });
  }
  
  // Call this function when the DOM is loaded
  document.addEventListener('DOMContentLoaded', initializeStarRating);
  
  // Convert score to star display (for displaying existing ratings)
  function getStarRating(score) {
      const fullStars = Math.floor(score);
      const halfStar = score % 1 >= 0.5;
      let starsHtml = '';
      
      for (let i = 1; i <= 5; i++) {
          if (i <= fullStars) {
              starsHtml += '<i class="fas fa-star"></i>';
          } else if (i === fullStars + 1 && halfStar) {
              starsHtml += '<i class="fas fa-star-half-alt"></i>';
          } else {
              starsHtml += '<i class="far fa-star"></i>';
          }
      }
      
      return starsHtml;
  }

// Determine rank based on score
function getRankFromScore(score) {
    if (score >= 4.8) return 'S';
    if (score >= 4.0) return 'A';
    if (score >= 3.0) return 'B';
    if (score >= 2.0) return 'C';
    if (score >= 1.0) return 'D';
    return 'F';
}

// Render teacher cards
function renderTeachers() {
    teacherListElement.innerHTML = '';
    
    teachersData.forEach(teacher => {
        const cardClone = teacherCardTemplate.content.cloneNode(true);
        
        // Fill in teacher details
        cardClone.querySelector('.teacher-name').textContent = teacher.name;
        cardClone.querySelector('.teacher-subject').textContent = teacher.subject;
        cardClone.querySelector('.teacher-description').textContent = teacher.description;
        cardClone.querySelector('.rating-number').textContent = teacher.average_rating.toFixed(1);
        cardClone.querySelector('.rating-stars').innerHTML = getStarRating(teacher.average_rating);
        
        // Set rank
        const rankElement = cardClone.querySelector('.teacher-rank');
        rankElement.textContent = teacher.rank;
        rankElement.classList.add(`rank-${teacher.rank}`);
        
        // Add ratings
        const ratingsList = cardClone.querySelector('.ratings-list');
        
        if (teacher.ratings && teacher.ratings.length > 0) {
            teacher.ratings.forEach(rating => {
                const ratingClone = ratingItemTemplate.content.cloneNode(true);
                ratingClone.querySelector('.rating-username').textContent = rating.user;
                ratingClone.querySelector('.rating-score').textContent = `${rating.score} ★`;
                ratingClone.querySelector('.rating-comment').textContent = rating.comment;
                ratingsList.appendChild(ratingClone);
            });
        } else {
            ratingsList.innerHTML = '<p class="no-ratings">No ratings yet</p>';
        }
        
        teacherListElement.appendChild(cardClone);
    });
}

// Render leaderboard
function renderLeaderboard(leaderboardData) {
    leaderboardBodyElement.innerHTML = '';
    
    leaderboardData.forEach((item, index) => {
        const teacher = teachersData.find(t => t.id === item.teacher_id);
        if (!teacher) return;
        
        const row = document.createElement('tr');
        
        const rankCell = document.createElement('td');
        rankCell.textContent = `#${index + 1}`;
        
        const nameCell = document.createElement('td');
        nameCell.textContent = teacher.name;
        
        const subjectCell = document.createElement('td');
        subjectCell.textContent = teacher.subject;
        
        const ratingCell = document.createElement('td');
        const ratingSpan = document.createElement('span');
        ratingSpan.innerHTML = `${teacher.average_rating.toFixed(1)} ${getStarRating(teacher.average_rating)}`;
        ratingCell.appendChild(ratingSpan);
        
        const gradeCell = document.createElement('td');
        const gradeBadge = document.createElement('span');
        gradeBadge.textContent = teacher.rank;
        gradeBadge.className = `teacher-rank rank-${teacher.rank}`;
        gradeCell.appendChild(gradeBadge);
        
        row.appendChild(rankCell);
        row.appendChild(nameCell);
        row.appendChild(subjectCell);
        row.appendChild(ratingCell);
        row.appendChild(gradeCell);
        
        leaderboardBodyElement.appendChild(row);
    });
}

// Render ranking system
function renderRankingSystem() {
    rankingSystemListElement.innerHTML = '';
    
    Object.entries(rankingSystem).forEach(([rank, description]) => {
        const rankItem = document.createElement('div');
        rankItem.className = 'ranking-system-item';
        
        const rankBadge = document.createElement('div');
        rankBadge.className = `rank-badge rank-${rank}`;
        rankBadge.textContent = rank;
        
        const rankDescDiv = document.createElement('div');
        rankDescDiv.className = 'rank-description';
        rankDescDiv.textContent = description;
        
        rankItem.appendChild(rankBadge);
        rankItem.appendChild(rankDescDiv);
        
        rankingSystemListElement.appendChild(rankItem);
    });
}

// Populate teacher select dropdown
function populateTeacherSelect() {
    teacherSelectElement.innerHTML = '<option value="">--Select a Teacher--</option>';
    
    teachersData.forEach(teacher => {
        const option = document.createElement('option');
        option.value = teacher.id;
        option.textContent = `${teacher.name} (${teacher.subject})`;
        teacherSelectElement.appendChild(option);
    });
}

// Handle star rating
stars.forEach(star => {
    star.addEventListener('mouseover', function() {
        const rating = this.getAttribute('data-rating');
        highlightStars(rating);
    });
    
    star.addEventListener('mouseout', function() {
        const currentRating = ratingValueInput.value;
        highlightStars(currentRating);
    });
    
    star.addEventListener('click', function() {
        const rating = this.getAttribute('data-rating');
        ratingValueInput.value = rating;
        highlightStars(rating);
    });
});

function highlightStars(rating) {
    stars.forEach(star => {
        const starRating = star.getAttribute('data-rating');
        if (starRating <= rating) {
            star.classList.remove('far');
            star.classList.add('fas');
        } else {
            star.classList.remove('fas');
            star.classList.add('far');
        }
    });
}

// Handle form submission
ratingForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const teacherId = parseInt(teacherSelectElement.value);
    const username = document.getElementById('username').value;
    const score = parseFloat(ratingValueInput.value);
    const comment = document.getElementById('comment').value;
    
    if (!teacherId || !username || score === 0 || !comment) {
        alert('Please fill out all fields and provide a rating');
        return;
    }
    
    try {
        // Find the teacher to update
        const teacherIndex = teachersData.findIndex(t => t.id === teacherId);
        if (teacherIndex === -1) {
            throw new Error('Teacher not found');
        }
        
        // Add the new rating
        const newRating = {
            user: username,
            score: score,
            comment: comment
        };
        
        teachersData[teacherIndex].ratings.push(newRating);
        
        // Recalculate average rating
        const ratings = teachersData[teacherIndex].ratings.map(r => r.score);
        const averageRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        teachersData[teacherIndex].average_rating = averageRating;
        
        // Update rank
        teachersData[teacherIndex].rank = getRankFromScore(averageRating);
        
        // Update leaderboard
        const leaderboard = teachersData
            .map(teacher => ({
                teacher_id: teacher.id,
                name: teacher.name,
                average_rating: teacher.average_rating
            }))
            .sort((a, b) => b.average_rating - a.average_rating);
        
        // Prepare the updated data
        const updatedData = {
            teachers: teachersData,
            leaderboard: leaderboard,
            ranking_system: rankingSystem
        };
        
        // Send the update to the API
        const response = await fetch(`${API_URL}?apiKey=${API_KEY}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to update data');
        }
        
        // Update the UI
        renderTeachers();
        renderLeaderboard(leaderboard);
        
        // Reset the form
        ratingForm.reset();
        highlightStars(0);
        
        alert('Rating submitted successfully!');
    } catch (error) {
        console.error('Error submitting rating:', error);
        alert('Failed to submit rating. Please try again later.');
    }
});

// Navigation active state
const navLinks = document.querySelectorAll('nav a');
navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        navLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
});

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Get elements once the DOM is loaded
    let teacherListElement = document.getElementById('teacher-list');
    let teacherCardTemplate = document.getElementById('teacher-card-template');
    let ratingItemTemplate = document.getElementById('rating-item-template');
    let teacherSelectElement = document.getElementById('teacher-select');
    let ratingFormElement = document.getElementById('rating-form');
    let searchInput = document.getElementById('search-teacher');
    let sortSelectElement = document.getElementById('sort-select');
    let rankFilterElement = document.getElementById('rank-filter');
    let leaderboardBodyElement = document.getElementById('leaderboard-body');
    let rankingSystemListElement = document.getElementById('ranking-system-list');
    
    // Set the default active tab if it exists
    const defaultTab = document.querySelector('.tab-link[data-tab="teachers-tab"]');
    if (defaultTab) {
        defaultTab.click();
    }
    
    // Initialize star rating
    initializeStarRating();
    
    // Fetch data from API
    fetchData();
});

// Admin functions
function activateAdminMode() {
    console.log('Admin mode activated!');
    
    const adminPanel = document.createElement('div');
    adminPanel.id = 'admin-panel';
    adminPanel.className = 'admin-panel';
    adminPanel.innerHTML = `
        <div class="admin-panel-header">
            <h3>Admin Panel</h3>
            <button id="close-admin">X</button>
        </div>
        <div class="admin-panel-content">
            <button id="create-teacher">Create New Teacher</button>
            <button id="delete-teacher">Delete Teacher</button>
            <button id="modify-ranking">Modify Ranking System</button>
            <button id="clear-ratings">Clear All Ratings</button>
        </div>
    `;
    
    document.body.appendChild(adminPanel);
    
    // Add event listeners for admin actions
    document.getElementById('close-admin').addEventListener('click', function() {
        document.body.removeChild(adminPanel);
    });
    
    document.getElementById('create-teacher').addEventListener('click', function() {
        createNewTeacher();
    });
    
    document.getElementById('delete-teacher').addEventListener('click', function() {
        deleteTeacher();
    });
    
    document.getElementById('modify-ranking').addEventListener('click', function() {
        modifyRankingSystem();
    });
    
    document.getElementById('clear-ratings').addEventListener('click', function() {
        if (confirm('Are you sure you want to clear all ratings? This cannot be undone!')) {
            clearAllRatings();
        }
    });
}

// Admin functions implementations
function createNewTeacher() {
    const teacherName = prompt('Enter teacher name:');
    if (!teacherName) return;
    
    const subject = prompt('Enter subject:');
    if (!subject) return;
    
    const description = prompt('Enter description:');
    if (!description) return;

    // Determine the new teacher ID
    const highestId = teachersData.length > 0 ? Math.max(...teachersData.map(t => t.id)) : 0;
    const newTeacherId = highestId + 1; // Increment the highest ID by 1

    const newTeacher = {
        id: newTeacherId, // Use the new ID
        name: teacherName,
        subject: subject,
        description: description,
        average_rating: 0,
        rank: 'F',
        ratings: []
    };
    
    teachersData.push(newTeacher);
    saveDataToAPI('New teacher created successfully!');
}

function deleteTeacher() {
    const teacherOptions = teachersData.map(t => `${t.id}: ${t.name} (${t.subject})`).join('\n');
    const teacherInput = prompt(`Enter the ID or name of the teacher to delete:\n${teacherOptions}`);
    
    if (!teacherInput) return;

    // Check if the input is a number (ID) or a string (name)
    const id = parseInt(teacherInput);
    const index = isNaN(id) 
        ? teachersData.findIndex(t => t.name.toLowerCase() === teacherInput.toLowerCase()) // Find by name
        : teachersData.findIndex(t => t.id === id); // Find by ID

    if (index === -1) {
        alert('Teacher not found');
        return;
    }
    
    if (confirm(`Are you sure you want to delete ${teachersData[index].name}?`)) {
        teachersData.splice(index, 1);
        saveDataToAPI('Teacher deleted successfully!');
    }
}

function modifyRankingSystem() {
    const rankOptions = Object.entries(rankingSystem)
        .map(([rank, desc]) => `${rank}: ${desc}`)
        .join('\n');
        
    const rankToModify = prompt(`Enter the rank to modify:\n${rankOptions}`);
    
    if (!rankToModify || !rankingSystem[rankToModify]) {
        alert('Invalid rank');
        return;
    }
    
    const newDescription = prompt(`Enter new description for rank ${rankToModify}:`, rankingSystem[rankToModify]);
    
    if (newDescription) {
        rankingSystem[rankToModify] = newDescription;
        saveDataToAPI('Ranking system updated successfully!');
    }
}

function clearAllRatings() {
    teachersData = teachersData.map(teacher => ({
        ...teacher,
        average_rating: 0,
        rank: 'F',
        ratings: []
    }));
    
    saveDataToAPI('All ratings have been cleared!');
}

async function saveDataToAPI(successMessage) {
    try {
        // Update leaderboard
        const leaderboard = teachersData
            .map(teacher => ({
                teacher_id: teacher.id,
                name: teacher.name,
                average_rating: teacher.average_rating
            }))
            .sort((a, b) => b.average_rating - a.average_rating);
        
        // Prepare the updated data
        const updatedData = {
            teachers: teachersData,
            leaderboard: leaderboard,
            ranking_system: rankingSystem
        };
        
        // Send the update to the API
        const response = await fetch(`${API_URL}?apiKey=${API_KEY}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to update data');
        }
        
        // Update the UI
        renderTeachers();
        renderLeaderboard(leaderboard);
        renderRankingSystem();
        populateTeacherSelect();
        
        alert(successMessage);
    } catch (error) {
        console.error('Error saving data:', error);
        alert('Failed to save changes. Please try again later.');
    }
}