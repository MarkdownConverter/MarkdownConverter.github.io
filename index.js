function convert() {
    let text = html.input.value;
    let lines = text.split('\n');
    let output = '';

    for (let line of lines) {
        const headingMatch = line.match(/^(#+)\s*(.*)$/);

        if (headingMatch) {
            const num = headingMatch[1].length
            const content = headingMatch[2].trim(); 
            const validNum = Math.min(Math.max(1, num), 6); 
            output += `<h${validNum}>${content}</h${validNum}>\n`;
          
        } else {
            output += `${line}\n`;
        }
    }

    return output;
}

let html = {
  input: document.getElementById('input'),
  convert: document.getElementById('convert'),
  output: document.getElementById('output'),
};

html.convert.addEventListener('click', () => { html.output.innerHtml = convert(); });
