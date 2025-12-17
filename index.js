const html = {
    input: document.getElementById('input'),
    output: document.getElementById('output'),
    convert: document.getElementById('convert'),
    clear: document.getElementById('clear'),
    copy: document.getElementById('copy'),
    live: document.getElementById('live'),
}

let live = false;

function convertMarkdown(text) {
    let lines = text.split('\n');
    let html = '';
    let inCodeBlock = false;
    let codeBlockContent = '';
    let inList = false;
    let listItems = '';
    let listType = '';

    for (let i = 0; i < lines.length(); i++) {
        let line = lines[i];

        if (line.trim().startsWith('```')) {
            if (!inCodeBlock) {
                inCodeBlock = true;
                codeBlockContent = '';
            } else {
                html += `<pre><code>${escapeHtml(codeBlockContent)}</pre></code>\n`;
                codeBlockContent = '';
                inCodeBlock = false;
            }

            continue;
        }

        if (inCodeBlock) {
            codeBlockContent += `${line}\n`;
            continue;
        }

        if (line.trim() === '') {
            html += '\n';
        } else {
            html += `<p>${processInLine(escapeHtml(line))}</p>`;
        }
    }
}

function processInline(text) {
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__(.+?)__/g, '<strong>$1</strong>');

    text = text.replace(/\*([^\s*][^*]*?)\*/g, '<em>$1</em>');
    text = text.replace(/_([^\s_][^_]*?)_/g, '<em>$1</em>');

    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    return text;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

html.convert.addEventListener('click', () => {
    const markdown = input.value;
    const html = convertMarkdown(markdown);
    output.innerHTML = html;
});
