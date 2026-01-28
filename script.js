let currentDate = new Date();
let tasks = JSON.parse(localStorage.getItem('calendarTasks')) || {};
let currentDateKey = null;

const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

const subjectColors = {
    'Mathematics': '#FF6B6B',
    'Science': '#4ECDC4',
    'English': '#45B7D1',
    'History': '#FFA502',
    'PE/Sports': '#9B59B6',
    'Art': '#2ECC71'
};

function renderCalendar() {
    const calendar = document.getElementById('calendar');
    const monthYear = document.getElementById('monthYear');
    
    calendar.innerHTML = '';
    monthYear.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    
    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'day-header';
        header.textContent = day;
        calendar.appendChild(header);
    });
    
    // Calculate first day of month and last day
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    // Generate calendar days
    let date = new Date(startDate);
    while (date <= endDate) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day';
        
        if (date.getMonth() !== currentDate.getMonth()) {
            dayDiv.classList.add('other-month');
        }
        
        if (date.toDateString() === new Date().toDateString()) {
            dayDiv.classList.add('today');
        }
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = date.getDate();
        dayDiv.appendChild(dayNumber);
        
        // Add tasks for this day
        const dateKey = date.toISOString().split('T')[0];
        if (tasks[dateKey]) {
            tasks[dateKey].forEach(task => {
                const taskDiv = document.createElement('div');
                taskDiv.className = 'task';
                taskDiv.style.backgroundColor = task.color;
                taskDiv.textContent = task.name;
                dayDiv.appendChild(taskDiv);
            });
        }
        
        // Add click event to open task modal
        dayDiv.addEventListener('click', () => openTaskModal(dateKey));
        
        calendar.appendChild(dayDiv);
        date.setDate(date.getDate() + 1);
    }
}

function openTaskModal(dateKey) {
    currentDateKey = dateKey;
    const date = new Date(dateKey + 'T00:00:00');
    const modalDate = document.getElementById('modalDate');
    modalDate.textContent = `Tasks for ${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    
    displayTasksForDay(dateKey);
    
    const modal = new bootstrap.Modal(document.getElementById('taskModal'));
    modal.show();
}

function displayTasksForDay(dateKey) {
    const tasksForDay = document.getElementById('tasksForDay');
    tasksForDay.innerHTML = '';
    
    if (tasks[dateKey] && tasks[dateKey].length > 0) {
        tasksForDay.innerHTML = '<h6 style="margin-bottom: 12px; color: #333;">Tasks for this day:</h6>';
        tasks[dateKey].forEach((task, index) => {
            const taskDiv = document.createElement('div');
            taskDiv.className = 'task-item';
            taskDiv.style.borderLeftColor = task.color;
            
            taskDiv.innerHTML = `
                <div class="task-item-header">
                    <div style="flex: 1;">
                        <div class="task-item-name">${task.name}</div>
                        <span class="task-item-subject" style="background-color: ${task.color};">${task.subject}</span>
                        ${task.description ? `<div class="task-item-description">${task.description}</div>` : ''}
                        <div class="task-item-duration">⏱️ ${task.duration} hours</div>
                    </div>
                    <button class="task-delete-btn" data-index="${index}">Delete</button>
                </div>
            `;
            
            taskDiv.querySelector('.task-delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                deleteTask(dateKey, index);
            });
            
            tasksForDay.appendChild(taskDiv);
        });
    } else {
        tasksForDay.innerHTML = '<p style="color: #999; text-align: center;">No tasks yet. Add one below!</p>';
    }
}

function deleteTask(dateKey, index) {
    if (tasks[dateKey]) {
        tasks[dateKey].splice(index, 1);
        if (tasks[dateKey].length === 0) {
            delete tasks[dateKey];
        }
        localStorage.setItem('calendarTasks', JSON.stringify(tasks));
        displayTasksForDay(dateKey);
        renderCalendar();
    }
}

// Handle form submission
document.getElementById('taskForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const taskName = document.getElementById('taskName').value;
    const taskSubject = document.getElementById('taskSubject').value;
    const taskDescription = document.getElementById('taskDescription').value;
    const taskDuration = parseFloat(document.getElementById('taskDuration').value);
    const taskColor = subjectColors[taskSubject];
    
    if (!tasks[currentDateKey]) {
        tasks[currentDateKey] = [];
    }
    
    tasks[currentDateKey].push({
        name: taskName,
        subject: taskSubject,
        description: taskDescription,
        color: taskColor,
        duration: taskDuration
    });
    
    localStorage.setItem('calendarTasks', JSON.stringify(tasks));
    renderCalendar();
    displayTasksForDay(currentDateKey);
    document.getElementById('taskForm').reset();
});

// Month navigation
document.getElementById('prevMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

// Initial render
renderCalendar();