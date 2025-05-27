# LaTeX Implementation Test Plan

## Current State Analysis

### What's Working
- Inline math: `$x^2 + y^2$` ✓
- Inline math with parentheses: `\(x^2 + y^2\)` ✓  
- Display math with brackets: `\[x^2 + y^2\]` ✓
- Display math with dollars: `$$x^2 + y^2$$` (single line only)

### What's Not Working
- Multi-line equation environments:
  ```latex
  \begin{equation}
  x = \frac{a}{b}
  \end{equation}
  ```
- Multi-line display math with `$$` (untested)

## Root Cause

The `processMultiLineEnvironments` method has a regex matching issue. After markdown processing, the content looks like:

```html
<p>\begin{equation}<br>
x = \frac{a}{b}<br>
\end{equation}</p>
```

The regex `/\\begin\{equation\}([\s\S]*?)\\end\{equation\}/g` needs to properly match this HTML content.

## Solution Approach

### Primary Solution: Fix Regex Pattern

The issue might be with how the regex matches the backslashes in innerHTML. We need to:

1. Debug what's actually in the innerHTML
2. Adjust the regex pattern accordingly
3. Ensure the `<br>` tags are properly handled

### Alternative Solution: Pre-Markdown Processing

If DOM-based processing continues to be problematic:

1. Extract LaTeX expressions before markdown
2. Use robust placeholders
3. Render LaTeX after markdown
4. Apply DOMPurify to final output

## Test Cases

### Test 1: Single-line Equation
```latex
\begin{equation}x = 5\end{equation}
```

### Test 2: Multi-line Equation (Currently Failing)
```latex
\begin{equation}
x = \frac{a}{b}
\end{equation}
```

### Test 3: Complex Multi-line Equation
```latex
\begin{equation}
\begin{aligned}
x &= \frac{-b \pm \sqrt{b^2 - 4ac}}{2a} \\
&= \frac{-b \pm \sqrt{\Delta}}{2a}
\end{aligned}
\end{equation}
```

### Test 4: Multi-line Display Math
```latex
$$
\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$
```

### Test 5: Mixed Content
```
Here's an inline equation $E = mc^2$ followed by a display equation:

\begin{equation}
F = ma
\end{equation}

And another inline \(v = \frac{d}{t}\).
```

## Original Test Examples

### Inline Math Examples

Basic inline math: \(x^2 + y^2 = z^2\)

Inline with dollar signs: $E = mc^2$

Fraction inline: \(\frac{a}{b}\)

Greek letters: $\alpha, \beta, \gamma, \delta$

### Display Math Examples

Display with double dollars:
$$\int_0^\infty e^{-x} dx = 1$$

Display with brackets:
\[\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}\]

Equation environment:
\begin{equation}
\nabla \cdot \mathbf{E} = \frac{\rho}{\epsilon_0}
\end{equation}

### Complex Examples

Matrix:
$$\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}$$

Nested fractions:
\[\frac{\frac{a}{b}}{\frac{c}{d}} = \frac{ad}{bc}\]

### Mixed Content

Here's a paragraph with inline math $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$ embedded in regular text.

### Edge Cases

Dollar signs in text: The price is $5 and $10 (should not render as LaTeX)

Code block with LaTeX-like content (should not render):
```
$x = 5$
\frac{1}{2}
```

### Error Cases

Malformed LaTeX: $\frac{1}{2$ (missing closing)

Empty LaTeX: $$$$

Non-LaTeX between dollars: $hello world$ (no backslash, ^, or _)