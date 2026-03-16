const NOTES_STORAGE_KEY = 'sidebar-notes';

function getNotes() {
    return localStorage.getItem(NOTES_STORAGE_KEY) || '';
}

function saveNotes(notes) {
    localStorage.setItem(NOTES_STORAGE_KEY, notes);
}

export function renderNotes() {
    const widgetWrapper = document.createElement('div');
    widgetWrapper.className = 'notes-widget';

    const title = document.createElement('h3');
    title.textContent = 'Notes';

    const textarea = document.createElement('textarea');
    textarea.className = 'notes-textarea';
    textarea.placeholder = 'Write your notes here...';
    textarea.value = getNotes();

    // Auto-expand textarea basic logic
    textarea.style.resize = 'vertical';
    textarea.style.minHeight = '100px';
    textarea.style.width = '100%';
    textarea.style.boxSizing = 'border-box';
    textarea.style.padding = '8px';
    textarea.style.background = 'var(--bg-secondary)';
    textarea.style.color = 'var(--text-primary)';
    textarea.style.border = '1px solid var(--border-color, rgba(128, 128, 128, 0.2))';
    textarea.style.borderRadius = '8px';

    textarea.addEventListener('input', () => {
        saveNotes(textarea.value);
    });

    widgetWrapper.appendChild(title);
    widgetWrapper.appendChild(textarea);

    return widgetWrapper;
}
