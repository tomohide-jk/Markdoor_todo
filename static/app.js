const API_URL = 'http://127.0.0.1:8000/tasks';

let currentFilter = 'all';
let editingTaskId = null; 
let selectedTaskId = null; 

// 1. フォームを新規追加モードにリセットする関数
function resetForm() {
    editingTaskId = null;
    document.getElementById('form-title').innerText = 'タスクの追加';
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.innerText = '追加する';
    submitBtn.style.backgroundColor = '#28a745'; 
    submitBtn.style.color = '#fff';

    const toggleBtn = document.getElementById('btn-toggle-form');
    if (toggleBtn) {
        toggleBtn.innerText = '＋ タスクを追加';
        toggleBtn.style.backgroundColor = '#28a745';
    }

    // 💡 フォーム内の削除ボタンを完全に消去する
    const formDeleteArea = document.getElementById('form-delete-area');
    if (formDeleteArea) formDeleteArea.innerHTML = '';
}

// 2. フォームの表示・非表示を切り替える関数
function toggleFormVisibility() {
    const formContainer = document.getElementById('form-container');
    const toggleBtn = document.getElementById('btn-toggle-form'); 
    const filterButtons = document.querySelector('.filter-buttons'); 

    if (formContainer.style.display === 'none' || formContainer.style.display === '') {
        formContainer.style.display = 'block';
        document.getElementById('title').focus();
        
        toggleBtn.innerText = '✕ 戻る';
        toggleBtn.style.backgroundColor = '#6c757d'; 
        if (filterButtons) filterButtons.style.display = 'none';
    } else {
        formContainer.style.display = 'none';
        toggleBtn.innerText = '＋ タスクを追加';
        toggleBtn.style.backgroundColor = '#28a745'; 
        if (filterButtons) filterButtons.style.display = 'flex';
        
        selectedTaskId = null; 
        resetForm();
        fetchTasks();
    }
}

// 3. タスク選択による編集フォームの表示（フォーム内に削除ボタンを生成）
function startEdit(id, title, description) {
    editingTaskId = id; 
    selectedTaskId = id; 
    
    document.getElementById('form-container').style.display = 'block';
    document.getElementById('form-title').innerText = 'タスクの編集';
    document.getElementById('title').value = title;       
    document.getElementById('description').value = description; 

    const submitBtn = document.getElementById('submit-btn');
    submitBtn.innerText = '変更を保存';
    submitBtn.style.backgroundColor = '#28a745'; 
    submitBtn.style.color = '#fff';
    
    // 💡 変更点：フォーム内の「変更を保存」の下に、このタスク専用の削除ボタンをドカンと生成する
    const formDeleteArea = document.getElementById('form-delete-area');
    if (formDeleteArea) {
        formDeleteArea.innerHTML = `
            <button type="button" style="background-color: #dc3545; color: white; padding: 10px; font-weight: bold; width: 100%; border: none; border-radius: 4px; cursor: pointer; margin-top: 8px;" 
                    onclick="deleteTaskFromForm(${id})">
                タスクを削除
            </button>
        `;
    }
    
    const filterButtons = document.querySelector('.filter-buttons');
    if (filterButtons) filterButtons.style.display = 'none';
    
    const toggleBtn = document.getElementById('btn-toggle-form');
    if (toggleBtn) {
        toggleBtn.innerText = '✕ 戻る';
        toggleBtn.style.backgroundColor = '#6c757d';
    }
    document.getElementById('title').focus();

    fetchTasks(); 
}

// 4. チェックボックスによる完了切り替え
async function toggleTask(id, title, description, is_completed, event) {
    event.stopPropagation(); 
    await fetch(`${API_URL}/${id}?is_completed=${!is_completed}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
    });
    fetchTasks(); 
}

// 5. 💡 フォーム内のボタンから削除を実行する新しい関数
async function deleteTaskFromForm(id) {
    if (confirm('本当にこのタスクを削除しますか？')) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        
        // 削除が成功したらフォームを閉じ、画面をすっきり元に戻す
        document.getElementById('form-container').style.display = 'none';
        const filterButtons = document.querySelector('.filter-buttons');
        if (filterButtons) filterButtons.style.display = 'flex';
        
        selectedTaskId = null;
        resetForm();
        fetchTasks();
    }
}

// 6. 【Read】タスク一覧の取得と描画
async function fetchTasks() {
    const response = await fetch(API_URL);
    const tasks = await response.json();
    
    const todoList = document.getElementById('todo-list');
    todoList.innerHTML = ''; 

    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'active') return !task.is_completed;
        if (currentFilter === 'completed') return task.is_completed;
        return true;
    });

    filteredTasks.forEach(task => {
        const div = document.createElement('div');
        div.className = `todo-item ${task.is_completed ? 'completed' : ''}`;
        
        if (selectedTaskId === task.id) {
            div.style.cssText = "display: flex; align-items: center; justify-content: space-between; padding: 12px; margin-bottom: 8px; border: 2px solid #007bff; border-radius: 6px; background: #f0f4f8; transition: background 0.2s;";
        } else {
            div.style.cssText = "display: flex; align-items: center; justify-content: space-between; padding: 12px; margin-bottom: 8px; border: 1px solid #eee; border-radius: 6px; background: white; transition: background 0.2s;";
        }
        
        div.onclick = (event) => {
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'BUTTON') return;
            startEdit(task.id, task.title, task.description || '');
        };
        
        // 💡 タスク一覧側の「右端の削除ボタン」は完全に消去。圧倒的にシンプルな1行に！
        div.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; flex-grow: 1; cursor: pointer;">
                <input type="checkbox" ${task.is_completed ? 'checked' : ''} 
                       style="width: 18px; height: 18px; cursor: pointer;"
                       onclick="toggleTask(${task.id}, '${task.title}', '${task.description || ''}', ${task.is_completed}, event)">
                <div style="flex-grow: 1;">
                    <span style="${task.is_completed ? 'text-decoration: line-through; color: #aaa; font-weight: normal;' : 'font-weight: bold;'}">${task.title}</span>
                    ${task.description ? `<br><small style="color: #666; font-size: 13px;">${task.description}</small>` : ''}
                    <br><small style="color: #aa1111; font-size: 11px;">🕒 ${new Date(task.created_at + "Z").toLocaleString('ja-JP')}</small>
                </div>
            </div>
        `;
        todoList.appendChild(div);
    });
}

// 画面読み込み後のイベント設定
document.addEventListener('DOMContentLoaded', () => {
    fetchTasks();

    document.getElementById('filter-all').addEventListener('click', () => { currentFilter = 'all'; fetchTasks(); });
    document.getElementById('filter-active').addEventListener('click', () => { currentFilter = 'active'; fetchTasks(); });
    document.getElementById('filter-completed').addEventListener('click', () => { currentFilter = 'completed'; fetchTasks(); });

    document.getElementById('btn-toggle-form').addEventListener('click', () => {
        resetForm();
        toggleFormVisibility();
    });

    document.getElementById('todo-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;

        if (editingTaskId) {
            await fetch(`${API_URL}/${editingTaskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description })
            });
        } else {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description })
            });
        }

        document.getElementById('form-container').style.display = 'none';
        const filterButtons = document.querySelector('.filter-buttons');
        if (filterButtons) filterButtons.style.display = 'flex';
        
        selectedTaskId = null;
        resetForm();
        fetchTasks();
    });
});