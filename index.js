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
    const codeMatch = line.match(/^(\t*)(\s*)```$/);
    if (codeMatch) {
      const indent = codeMatch[1].length * 16 + codeMatch[2].length * 4 + 8;
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockContent = '';
      } else {
        html += `<pre style="margin-left: ${indent}px"><code>${escapeHtml(codeBlockContent)}</code></pre>\n`;
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
    const unorderedMatch = line.match(/^(\t*)(\s*)[\-\*\+]\s+(.+)$/);
    const orderedMatch = line.match(/^(\t*)(\s*)\d+\.\s+(.+)$/);

		if (unorderedMatch || orderedMatch) {
		  const content = unorderedMatch ? unorderedMatch[3] : orderedMatch[3];
		  const currentType = unorderedMatch ? 'ul' : 'ol';
      const indent = unorderedMatch ? unorderedMatch[1] * 16 + unorderedMatch[2].length * 4 + 8 : orderedMatch[1] * 16 + orderedMatch[2].length * 4 + 8;

			if (!inList) {
        inList = true;
        listType = currentType;
        listItems = '';
      } else if (listType !== currentType) {
        html += `<${listType}>${listItems}</${listType}>\n`;
        listType = currentType;
        listItems = '';
      }

			listItems += `<li style="margin-left: ${indent}px">${processInline(escapeHtml(content))}</li>`;
      continue;
		} else if (inList) {
			html += `<${listType}>${listItems}</${listType}>\n`;
			inList = false;
			listType = '';
			listItems = '';
		}

		// Headings
		const headingMatch = line.match(/^(\t*)(\s*)(#{1,6})\s+(.+)$/);
		if (headingMatch) {
			const level = headingMatch[3].length;
			const content = headingMatch[4];
      const indent = headingMatch[1].length * 16 + headingMatch[2].length * 4;
			html += `<h${level} style="margin-left: ${indent}px">${processInline(escapeHtml(content))}</h${level}>\n`;
      continue;
		}

		// Quotes
		const quoteMatch = line.match(/^(\t*)(\s*)>\s+(.+)$/);
    if (quoteMatch) {
			const content = quoteMatch[3];
      const indent = quoteMatch[1] * 16 + quoteMatch[2] * 4;
    	html += `<blockquote style="margin-left: ${indent}">${processInline(escapeHtml(content))}</blockquote>\n`;
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
      const indent = line.match(/^(\t*).*$/);
      html += `<p style="margin-left: ${indent}px">${processInline(escapeHtml(line))}</p>\n`;
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
  const markdown = html.input.value;
  const output = convertMarkdown(markdown);
  html.output.innerHTML = output;
});

html.clear.addEventListener('click', () => {
  html.input.value = '';
  if (live) {
    const markdown = html.input.value;
    const output = convertMarkdown(markdown);
    html.output.innerHTML = output;
  }
});

html.live.addEventListener('click', () => {
  html.live.classList.toggle('active');
  live = !live;
  const markdown = html.input.value;
  const output = convertMarkdown(markdown);
  html.output.innerHTML = output;
});

html.input.addEventListener('input', () => {
  if (live) {
    const markdown = html.input.value;
    const output = convertMarkdown(markdown);
    html.output.innerHTML = output;
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Tab') {
    event.preventDefault();  
    if (document.activeElement === html.input) html.input.value += '\t';
  }
});
