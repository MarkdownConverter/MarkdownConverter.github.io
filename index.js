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

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Code Blocks
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

        // Lists
        const unorderedMatch = line.match(/^[\-\*\+]\s+(.+)$/);
        const orderedMatch = line.match(/^\d+\.\s+(.+)$/);

		if (unorderedMatch || orderedMatch) {
			const content = unorderedMatch ? unorderedMatch[1] : orderedMatch[1];
			const currentType = unorderedMatch ? 'ul' : 'ol';

			if (!inList) {
                inList = true;
                listType = currentType;
                listItems = '';
            } else if (listType !== currentType) {
                html += `<${listType}>${listItems}</${listType}>\n`;
                listType = currentType;
                listItems = '';
            }

			listItems += `<li>${processInline(escapeHtml(content))}</li>`;
            continue;
		} else if (inList) {
			html += `<${listType}>${listItems}</${listType}>\n`;
			inList = false;
			listType = '';
			listItems = '';
		}

		// Headings
		const headingMatch = line.match(/^(#{1,6})\s+(.+)&/);
		if (headingMatch) {
			const level = headingMatch[1];
			const content = headingMatch[2];
			html += `<h${level}>${processInline(escapeHtml(content))}</h${level}>\n`;
            continue;
		}

		// Quotes
		const quoteMatch = line.match(/^>\s+(.+)$/);
        if (quoteMatch) {
			const content = quoteMatch[1];
    		html += `<blockquote>${processInline(escapeHtml(content))}</blockquote>\n`;
            continue;
        }

		// Horizontal Lines
		if (line.trim().match(/^(\-{3,}|\*{3,}|_{3,})$/)) {
	    	html += '<hr>\n';
	        continue;
        }
		
        // Plain text
        if (line.trim() === '') {
            html += '\n';
        } else {
            html += `<p>${processInline(escapeHtml(line))}</p>\n`;
        }
    }

	// Close any open lists
    if (inList) {
	    html += `<${listType}>${listItems}</${listType}>\n`;
	}
	
	return html;
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
