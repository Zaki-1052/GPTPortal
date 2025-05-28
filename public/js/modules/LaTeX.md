# LaTeX Implementation in GPTPortal

## Overview

This document describes the complete LaTeX/MathJax implementation in GPTPortal's MessageHandler module. The implementation supports all standard LaTeX delimiters through a two-stage rendering pipeline that combines marked-katex-extension with KaTeX auto-render.

## Architecture

### Two-Stage LaTeX Processing Pipeline

1. **Stage 1**: marked-katex-extension processes `$` and `$$` delimiters during markdown parsing
2. **Stage 2**: KaTeX auto-render processes `\[...\]`, `\(...\)`, and LaTeX environments after DOM insertion

This hybrid approach ensures:
- Full compatibility with all LaTeX delimiter types
- Proper integration with markdown processing
- Preservation of line breaks and formatting
- Security through DOMPurify sanitization

## Dependencies

### Required Scripts (portal.html)
```html
<!-- KaTeX for LaTeX rendering -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css" crossorigin="anonymous">
<script src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js" crossorigin="anonymous"></script>
<!-- KaTeX auto-render for additional delimiter support -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/contrib/auto-render.min.js" crossorigin="anonymous"></script>
<!-- marked-katex-extension for LaTeX integration -->
<script src="https://cdn.jsdelivr.net/npm/marked-katex-extension@5.1.4/lib/index.umd.js"></script>
```

## Implementation Details

### 1. Markdown Setup (setupMarkdown method)

```javascript
setupMarkdown() {
  if (typeof marked !== 'undefined') {
    this.markdownRenderer = marked;
    
    // Configure general options FIRST (before extensions)
    marked.setOptions({
      gfm: true,
      breaks: true,
      highlight: function(code, lang) {
        if (typeof hljs !== 'undefined') {
          const language = hljs.getLanguage(lang) ? lang : 'plaintext';
          return hljs.highlight(code, { language }).value;
        }
        return code;
      }
    });
    
    // THEN add KaTeX extension
    if (typeof window.markedKatex !== 'undefined') {
      marked.use(window.markedKatex({
        throwOnError: false,
        output: 'html',
        delimiters: [
          {left: '$$', right: '$$', display: true},
          {left: '\\[', right: '\\]', display: true},
          {left: '$', right: '$', display: false},
          {left: '\\(', right: '\\)', display: false}
        ]
      }));
    }
  }

  if (typeof DOMPurify !== 'undefined') {
    this.sanitizer = DOMPurify;
  }
}
```

**Key Points:**
- marked-katex-extension only processes `$` and `$$` delimiters despite configuration
- The `delimiters` configuration is passed to KaTeX, not to the markdown parser
- `throwOnError: false` prevents rendering failures from breaking the UI

### 2. LaTeX Delimiter Escaping

**Critical Issue:** marked.js treats `\[` as an escaped `[` character, converting it to just `[`. This breaks LaTeX bracket notation.

**Solution:** Escape backslash delimiters before markdown processing:

```javascript
escapeLatexDelimiters(text) {
  // Escape backslash-bracket delimiters so marked doesn't convert \[ to [
  return text
    .replace(/\\\[/g, '\\\\[')
    .replace(/\\\]/g, '\\\\]')
    .replace(/\\\(/g, '\\\\(')
    .replace(/\\\)/g, '\\\\)');
}
```

This ensures that:
- `\[` becomes `\\[` before marked.js processing
- After marked.js, it becomes `\[` in the HTML
- KaTeX auto-render can then properly detect and process it

### 3. Two-Stage Rendering Process

#### Stage 1: Markdown + Dollar Sign LaTeX
```javascript
// Escape LaTeX delimiters before markdown processing
const escapedText = this.escapeLatexDelimiters(text);

// Process with marked (which includes LaTeX support via markedKatex)
if (this.markdownRenderer) {
  processedHtml = this.markdownRenderer.parse(escapedText);
} else {
  processedHtml = this.escapeHtml(escapedText);
}
```

#### Stage 2: DOMPurify Sanitization
```javascript
// Sanitize HTML
if (this.sanitizer) {
  const safeHtml = this.sanitizer.sanitize(processedHtml, {
    ADD_TAGS: ['math', 'annotation', 'semantics', 'mtext', 'mn', 'mo', 'mi', 'mrow', 'msub', 'msup', 'mfrac', 'mroot', 'msqrt'],
    ADD_ATTR: ['data-mathml', 'aria-label', 'href', 'mathvariant', 'encoding']
  });
  textSpan.innerHTML = safeHtml;
} else {
  textSpan.innerHTML = processedHtml;
}
```

**Security Configuration:**
- Allows KaTeX-generated MathML elements
- Preserves accessibility attributes
- Maintains math rendering while blocking malicious content

#### Stage 3: Auto-Render for Additional Delimiters
```javascript
parent.appendChild(textSpan);

// Apply KaTeX auto-render to handle additional delimiters
// Need to use requestAnimationFrame to ensure DOM is updated
if (typeof renderMathInElement !== 'undefined') {
  requestAnimationFrame(() => {
    renderMathInElement(textSpan, {
      delimiters: [
        {left: '\\[', right: '\\]', display: true},
        {left: '\\(', right: '\\)', display: false},
        {left: '\\begin{equation}', right: '\\end{equation}', display: true},
        {left: '\\begin{align}', right: '\\end{align}', display: true},
        {left: '\\begin{alignat}', right: '\\end{alignat}', display: true},
        {left: '\\begin{gather}', right: '\\end{gather}', display: true},
        {left: '\\begin{displaymath}', right: '\\end{displaymath}', display: true}
      ],
      throwOnError: false
    });
  });
}
```

**Critical Implementation Details:**
- `requestAnimationFrame` ensures DOM is fully updated before auto-render
- Auto-render runs AFTER the element is appended to the DOM
- Processes all LaTeX delimiters that marked-katex-extension missed

## Supported LaTeX Delimiters

### Processed by marked-katex-extension (Stage 1)
- `$...$` - Inline math
- `$$...$$` - Display math

### Processed by KaTeX auto-render (Stage 3)
- `\[...\]` - Display math
- `\(...\)` - Inline math
- `\begin{equation}...\end{equation}` - Numbered equations
- `\begin{align}...\end{align}` - Aligned equations
- `\begin{alignat}...\end{alignat}` - Aligned equations with spacing
- `\begin{gather}...\end{gather}` - Gathered equations
- `\begin{displaymath}...\end{displaymath}` - Display math

## Integration Points

The LaTeX implementation is integrated into three main rendering methods:

1. **renderMarkdownText()** - For text within code blocks
2. **renderSimpleTextMessage()** - For simple messages without code blocks
3. **updateMessage()** - For updating existing message content

Each method follows the same three-stage process:
1. Escape LaTeX delimiters
2. Process through marked.js with sanitization
3. Apply auto-render after DOM insertion

## Error Handling

- `throwOnError: false` in both stages prevents LaTeX errors from breaking rendering
- Graceful fallback to HTML escaping if markdown renderer unavailable
- Console warnings for missing dependencies without breaking functionality

## Performance Considerations

- **requestAnimationFrame**: Ensures rendering doesn't block the main thread
- **Lazy auto-render**: Only processes elements that contain unprocessed LaTeX
- **Sanitization caching**: DOMPurify efficiently handles repeated sanitization
- **Memory management**: Auto-render only processes specific DOM elements

## Browser Compatibility

- **KaTeX**: Modern browser support (IE 11+)
- **Auto-render**: Requires DOM Level 2 support
- **marked-katex-extension**: ES5+ compatible
- **Graceful degradation**: Falls back to text rendering if dependencies unavailable

## Debugging

The implementation includes debug logging at key points:
- Markdown setup confirmation
- Extension loading verification
- Auto-render availability checks

## Known Limitations

1. **marked-katex-extension limitation**: Only processes `$` and `$$` delimiters despite configuration
2. **Backslash escaping**: Required due to marked.js treating `\[` as escaped brackets
3. **Two-stage complexity**: Necessary to support all LaTeX delimiter types
4. **DOM timing**: Auto-render must wait for DOM insertion via requestAnimationFrame

## Testing

To test the implementation:

```javascript
// Test all delimiter types
const testEquation = `
Inline: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$

Display: $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

Bracket notation: \\[x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}\\]

Environment: \\begin{equation}
x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
\\end{equation}
`;
```

All forms should render as properly formatted mathematical equations.

## Future Improvements

1. **Single-stage processing**: Investigate alternatives to marked-katex-extension that support all delimiters
2. **Performance optimization**: Consider caching parsed LaTeX expressions
3. **Extended LaTeX support**: Add support for additional LaTeX packages and environments
4. **Accessibility**: Enhance screen reader support for mathematical content