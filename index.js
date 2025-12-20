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
	let codeBlockIndent = '';
  let inList = false;
  let listItems = '';
  let listType = '';
	let listStack = [];
	let indentLevel = 0;

  function indent() {
    return '    '.repeat(indentLevel);
  }
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

		const indentMatch = line.match(/^(\s*)/);
    const mdIndent = indentMatch ? indentMatch[1].replace(/\t/g, '    ').length : 0;
    indentLevel = Math.floor(mdIndent / 4);
		
    // Code Blocks
    const codeMatch = line.match(/^\s*```.*$/);
    if (codeMatch) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockContent = '';
				codeBlockIndent = indent();
      } else {
        html += `${codeBlockIndent}<pre><code>${escapeHtml(codeBlockContent)}</code></pre>\n`;
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
    const unorderedMatch = line.match(/^\s*[\-\*\+]\s+(.+)$/);
    const orderedMatch = line.match(/^\s*\d+\.\s+(.+)$/);

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

			listItems += `${indent()}<li>${processInline(escapeHtml(content))}</li>`;
      continue;
		} else if (inList) {
			html += `${indent()}<${listType}>${listItems}</${listType}>\n`;
			inList = false;
			listType = '';
			listItems = '';
		}

		// Headings
		const headingMatch = line.match(/^\s*(#{1,6})\s+(.+)$/);
		if (headingMatch) {
			const level = headingMatch[1].length;
			const content = headingMatch[2];
			html += `${indent()}<h${level}>${processInline(escapeHtml(content))}</h${level}>\n`;
      continue;
		}

		// Quotes
		const quoteMatch = line.match(/^\s*>\s+(.+)$/);
    if (quoteMatch) {
			const content = quoteMatch[1];
    	html += `${indent()}<blockquote>${processInline(escapeHtml(content))}</blockquote>\n`;
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
      html += `${indent()}<p>${processInline(escapeHtml(line))}</p>\n`;
    }
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
    if (document.activeElement === html.input) {
      html.input.setRangeText('\t', html.input.selectionStart, html.input.selectionEnd, 'end');
      if (live) {
        const markdown = html.input.value;
        const output = convertMarkdown(markdown);
        html.output.innerHTML = output;
      }
    }
  }
});
