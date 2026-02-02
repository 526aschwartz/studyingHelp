
// Keeps track of which month and year we're currently viewing
let currentDate = new Date();

// Loads all saved tasks from browser storage. If no tasks exist, creates an empty object
let tasks = JSON.parse(localStorage.getItem('calendarTasks')) || {};

// Stores the date that was clicked (will be set when user opens task modal)
let currentDateKey = null;

// Array of all month names for displaying the calendar header
const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

// Object that maps each subject to its color code
// This makes sure every subject always has the same color
const subjectColors = {
    'Mathematics': '#FF6B6B',      
    'Science': '#f072c6',          
    'English': '#a283f8',         
    'History': '#f7ce82',              
    'Electives': '#2ECC71'             
};


// renderCalendar() - Builds and displays the calendar
function renderCalendar() {
    // Get the calendar container and month/year header from HTML
    const calendar = document.getElementById('calendar');
    const monthYear = document.getElementById('monthYear');
    
    // Clear the calendar (remove all old content)
    calendar.innerHTML = '';
    
    // Update the header to show current month and year
    monthYear.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    
    // Create day headers (Sun, Mon, Tue, etc.)
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'day-header';
        header.textContent = day;
        calendar.appendChild(header);
    });
    
    // Calculate the first day of the month and the last day
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // Figure out what date to start drawing from (includes previous month's days)
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // Figure out what date to end drawing (includes next month's days)
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    // Loop through each day from start to end and create day boxes
    let date = new Date(startDate);
    while (date <= endDate) {
        // Create a box for this day
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day';
        
        // If this day is from a different month, make it look faded
        if (date.getMonth() !== currentDate.getMonth()) {
            dayDiv.classList.add('other-month');
        }
        
        // If this is today's date, highlight it in yellow
        if (date.toDateString() === new Date().toDateString()) {
            dayDiv.classList.add('today');
        }
        
        // Create the day number (1-31) and add it to the box
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = date.getDate();
        dayDiv.appendChild(dayNumber);
        
        // Check if there are any tasks saved for this day
        // dateKey is the date in YYYY-MM-DD format
        const dateKey = date.toISOString().split('T')[0];
        if (tasks[dateKey]) {
            // For each task on this day, create a colored box
            tasks[dateKey].forEach(task => {
                const taskDiv = document.createElement('div');
                taskDiv.className = 'task';
                taskDiv.style.backgroundColor = task.color;  // Use the subject's color
                taskDiv.textContent = task.name;
                dayDiv.appendChild(taskDiv);
            });
        }
        
        // When user clicks a day, open the task modal
        dayDiv.addEventListener('click', () => openTaskModal(dateKey));
        
        // Add this day to the calendar
        calendar.appendChild(dayDiv);
        
        // Move to next day
        date.setDate(date.getDate() + 1);
    }
}

// openTaskModal() - Opens the popup to add/view tasks for a day
function openTaskModal(dateKey) {
    // Remember which day was clicked
    currentDateKey = dateKey;
    
    // Convert the dateKey (YYYY-MM-DD) back into a date object
    const date = new Date(dateKey + 'T00:00:00');
    
    // Get the modal title and update it to show which day was selected
    const modalDate = document.getElementById('modalDate');
    modalDate.textContent = `Tasks for ${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    
    // Show all tasks for this day
    displayTasksForDay(dateKey);
    
    // Create a modal and show it
    const modal = new bootstrap.Modal(document.getElementById('taskModal'));
    modal.show();
}

// displayTasksForDay() - Shows all tasks for a specific day
function displayTasksForDay(dateKey) {
    // Get the container where tasks will be shown
    const tasksForDay = document.getElementById('tasksForDay');
    
    // Clear any old content
    tasksForDay.innerHTML = '';
    
    // Check if there are any tasks for this day
    if (tasks[dateKey] && tasks[dateKey].length > 0) {
        // Add a header
        tasksForDay.innerHTML = '<h6 style="margin-bottom: 12px; color: #333;">Tasks for this day:</h6>';
        
        // Loop through each task and create a box for it
        tasks[dateKey].forEach((task, index) => {
            // Create a container for this task
            const taskDiv = document.createElement('div');
            taskDiv.className = 'task-item';
            
            // Color the left border based on the subject's color
            taskDiv.style.borderLeftColor = task.color;
            
            // Create the HTML for the task (name, subject badge, description, duration, delete button)
            taskDiv.innerHTML = `
                <div class="task-item-header">
                    <div style="flex: 1;">
                        <div class="task-item-name">${task.name}</div>
                        <span class="task-item-subject" style="background-color: ${task.color};">${task.subject}</span>
                        ${task.description ? `<div class="task-item-description">${task.description}</div>` : ''}
                        <div class="task-item-duration">⏱️ ${task.duration} hours</div>
                    </div>
                    <div style="display:flex; gap:8px; align-items:center;">
                        <button class="task-start-btn" data-duration="${task.duration}">Start Timer</button>
                        <button class="task-delete-btn" data-index="${index}">Delete</button>
                    </div>
                </div>
            `;
            
            // Add click event to delete button
            taskDiv.querySelector('.task-delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();  // Don't trigger other events
                deleteTask(dateKey, index);
            });

            // Start timer from this task's duration (opens Timer.html with params)
            const startBtn = taskDiv.querySelector('.task-start-btn');
            if (startBtn) {
                startBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const durHours = parseFloat(e.currentTarget.dataset.duration) || 0;
                    const seconds = Math.round(durHours * 3600);
                    const name = encodeURIComponent(task.name || 'Task');
                    // navigate to Timer.html with duration (seconds) and name
                    window.location.href = `Timer.html?duration=${seconds}&name=${name}`;
                });
            }
            
            // Add the task to the display
            tasksForDay.appendChild(taskDiv);
        });
    } else {
        // If no tasks, show a message
        tasksForDay.innerHTML = '<p style="color: #999; text-align: center;">No tasks yet. Add one below!</p>';
    }
}

// deleteTask() - Removes a task from a specific da
function deleteTask(dateKey, index) {
    // Check if the day has tasks
    if (tasks[dateKey]) {
        // Remove the task at the specified index
        tasks[dateKey].splice(index, 1);
        
        // If the day now has no tasks, delete the entire day entry
        if (tasks[dateKey].length === 0) {
            delete tasks[dateKey];
        }
        
        // Save the updated tasks to browser storage
        localStorage.setItem('calendarTasks', JSON.stringify(tasks));
        
        // Update the display to show the changes
        displayTasksForDay(dateKey);
        
        // Redraw the calendar (update the day's task boxes)
        renderCalendar();
    }
}

// Handle Form Submission - When user clicks "Add Task" button
const _taskForm = document.getElementById('taskForm');
if (_taskForm) {
    _taskForm.addEventListener('submit', (e) => {
        // Prevent the form from refreshing the page
        e.preventDefault();

        // Get the values the user typed in
        const taskName = document.getElementById('taskName').value;
        const taskSubject = document.getElementById('taskSubject').value;
        const taskDescription = document.getElementById('taskDescription').value;
        const taskDuration = parseFloat(document.getElementById('taskDuration').value);

        // Get the color for this subject from our color map
        const taskColor = subjectColors[taskSubject];

        // If this day doesn't have a task list yet, create one
        if (!tasks[currentDateKey]) {
            tasks[currentDateKey] = [];
        }

        // Add the new task to the list
        tasks[currentDateKey].push({
            name: taskName,
            subject: taskSubject,
            description: taskDescription,
            color: taskColor,
            duration: taskDuration
        });

        // Save all tasks to browser storage (so they stay even after refresh)
        localStorage.setItem('calendarTasks', JSON.stringify(tasks));

        // Redraw the calendar to show the new task
        renderCalendar();

        // Update the modal to show the new task
        displayTasksForDay(currentDateKey);

        // Clear the form so it's ready for the next task
        document.getElementById('taskForm').reset();
    });
}

// Navigation Buttons - Move between months

// Previous Month button - Go back one month
const _prevMonth = document.getElementById('prevMonth');
if (_prevMonth) {
    _prevMonth.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();  // Redraw to show the new month
    });
}

// Next Month button - Go forward one month
const _nextMonth = document.getElementById('nextMonth');
if (_nextMonth) {
    _nextMonth.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();  // Redraw to show the new month
    });
}

// Only render calendar if calendar container exists on this page
if (document.getElementById('calendar')) {
    renderCalendar();
}

/* Timer module moved from Timer.html: initializes only when timer elements exist */
(function(){
    // detect timer page elements
    const display = document.getElementById('timeDisplay');
    if (!display) return; // not on timer page

    const minutesInput = document.getElementById('minutesInput');
    const secondsInput = document.getElementById('secondsInput');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');

    let totalSeconds = 0;
    let remaining = 0;
    let timerInterval = null;
    let isRunning = false;

    function pad(n){ return n.toString().padStart(2,'0'); }

    function updateDisplay(seconds){
        const s = seconds == null ? remaining : seconds;
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        display.textContent = `${pad(mins)}:${pad(secs)}`;
    }

    function tick(){
        if (remaining <= 0){
            clearInterval(timerInterval);
            timerInterval = null;
            isRunning = false;
            display.classList.add('done');
            try{ new Audio('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg').play(); }catch(e){}
            alert('Time is up!');
            return;
        }
        remaining -= 1;
        updateDisplay();
    }

    startBtn.addEventListener('click', ()=>{
        if (!isRunning){
            // If no time remaining, don't start
            if (remaining <= 0) return;
            timerInterval = setInterval(tick, 1000);
            isRunning = true;
            display.classList.remove('done');
        }
    });

    pauseBtn.addEventListener('click', ()=>{
        if (isRunning){
            clearInterval(timerInterval);
            timerInterval = null;
            isRunning = false;
        }
    });

    resetBtn.addEventListener('click', ()=>{
        clearInterval(timerInterval);
        timerInterval = null;
        isRunning = false;
        remaining = totalSeconds;
        updateDisplay();
        display.classList.remove('done');
    });

    // initialize display
    updateDisplay(0);

    // If the page was opened with a duration parameter, use it and auto-start
    const params = new URLSearchParams(window.location.search);
    const durationParam = parseInt(params.get('duration'));
    const nameParam = params.get('name');
    if (nameParam) {
        try { document.getElementById('taskName').textContent = decodeURIComponent(nameParam); } catch(e) { document.getElementById('taskName').textContent = nameParam; }
    }
    if (durationParam && durationParam > 0) {
        remaining = durationParam;
        totalSeconds = durationParam;
        updateDisplay();
        // auto-start
        if (!isRunning) {
            timerInterval = setInterval(tick, 1000);
            isRunning = true;
        }
    }
})();