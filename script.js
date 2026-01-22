let currentDate = new Date();
let tasks = JSON.parse(localStorage.getItem('calendarTasks')) || {};

const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

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
                taskDiv.textContent = `${task.name} (${task.duration}h)`;
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
    const modal = new bootstrap.Modal(document.getElementById('taskModal'));
    const form = document.getElementById('taskForm');
    
    form.onsubmit = (e) => {
        e.preventDefault();
        const taskName = document.getElementById('taskName').value;
        const taskColor = document.getElementById('taskColor').value;
        const taskDuration = parseFloat(document.getElementById('taskDuration').value);
        
        if (!tasks[dateKey]) {
            tasks[dateKey] = [];
        }
        
        tasks[dateKey].push({
            name: taskName,
            color: taskColor,
            duration: taskDuration
        });
        
        localStorage.setItem('calendarTasks', JSON.stringify(tasks));
        renderCalendar();
        modal.hide();
        form.reset();
    };
    
    modal.show();
}

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