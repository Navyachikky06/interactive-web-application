document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('taskForm');
    const taskInput = document.getElementById('taskInput');
    const taskDatetime = document.getElementById('taskDatetime');
    const taskList = document.getElementById('taskList');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let notifiedTasks = JSON.parse(localStorage.getItem('notifiedTasks')) || [];

    tasks.forEach(task => addTaskToDOM(task));

    if ("Notification" in window) {
        Notification.requestPermission();
    }

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = taskInput.value.trim();
        const datetime = taskDatetime.value;
        if (text && datetime) {
            const task = {
                id: Date.now(),
                text: text,
                datetime: datetime,
                completed: false
            };
            tasks.push(task);
            saveTasks();
            addTaskToDOM(task);
            taskInput.value = '';
            taskDatetime.value = '';
        }
    });

    setInterval(() => {
        const now = new Date();
        tasks.forEach(task => {
            const taskTime = new Date(task.datetime);
            if (!task.completed && taskTime <= now && !notifiedTasks.includes(task.id)) {
                sendDeadlineNotification(task);
                notifiedTasks.push(task.id);
                localStorage.setItem('notifiedTasks', JSON.stringify(notifiedTasks));
            }
        });
    }, 10000);

    function sendDeadlineNotification(task) {
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification('Task Deadline Reached!', {
                body: `Your task "${task.text}" is due now.`,
            });
        }
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function addTaskToDOM(task) {
        const li = document.createElement('li');
        li.dataset.id = task.id;

        const taskContent = document.createElement('div');
        taskContent.textContent = task.text;
        if (task.completed) {
            taskContent.style.textDecoration = 'line-through';
        }

        const taskTime = document.createElement('div');
        taskTime.className = 'task-time';
        taskTime.textContent = formatDateTime(task.datetime);

        const btnGroup = document.createElement('div');
        btnGroup.className = 'btn-group';

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-btn';

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.className = 'edit-btn';

        const completeBtn = document.createElement('button');
        completeBtn.textContent = task.completed ? 'Undo' : 'Complete';
        completeBtn.className = 'complete-btn';

        deleteBtn.addEventListener('click', () => {
            tasks = tasks.filter(t => t.id !== task.id);
            saveTasks();
            li.remove();
        });

        editBtn.addEventListener('click', () => {
            const newText = prompt('Edit task:', task.text);
            if (newText && newText.trim() !== '') {
                task.text = newText.trim();
                taskContent.textContent = task.text;
                saveTasks();
                li.style.animation = 'fadeEdit 0.5s ease';
                setTimeout(() => {
                    li.style.animation = '';
                }, 500);
            }
        });

        completeBtn.addEventListener('click', () => {
            task.completed = !task.completed;
            taskContent.style.textDecoration = task.completed ? 'line-through' : '';
            completeBtn.textContent = task.completed ? 'Undo' : 'Complete';
            saveTasks();
            li.style.animation = 'fadeComplete 0.5s ease';
            setTimeout(() => {
                li.style.animation = '';
            }, 500);
        });

        btnGroup.appendChild(completeBtn);
        btnGroup.appendChild(editBtn);
        btnGroup.appendChild(deleteBtn);

        li.appendChild(taskContent);
        li.appendChild(taskTime);
        li.appendChild(btnGroup);
        taskList.appendChild(li);

        highlightOverdue(li, task);
    }

    function highlightOverdue(li, task) {
        const now = new Date();
        const taskTime = new Date(task.datetime);
        if (!task.completed && taskTime < now) {
            li.classList.add('overdue');
        }
    }

    function formatDateTime(datetime) {
        const dt = new Date(datetime);
        const options = {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        };
        return dt.toLocaleString('en-US', options);
    }
});
