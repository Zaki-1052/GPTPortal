# LaTeX Test Examples for GPTPortal

## Inline Math Examples

Basic inline math: \(x^2 + y^2 = z^2\)

Inline with dollar signs: $E = mc^2$

Fraction inline: \(\frac{a}{b}\)

Greek letters: $\alpha, \beta, \gamma, \delta$

## Display Math Examples

Display with double dollars:
$$\int_0^\infty e^{-x} dx = 1$$

Display with brackets:
\[\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}\]

Equation environment:
\begin{equation}
\nabla \cdot \mathbf{E} = \frac{\rho}{\epsilon_0}
\end{equation}

## Complex Examples

Matrix:
$$\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}$$

Nested fractions:
\[\frac{\frac{a}{b}}{\frac{c}{d}} = \frac{ad}{bc}\]

## Mixed Content

Here's a paragraph with inline math $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$ embedded in regular text.

## Edge Cases

Dollar signs in text: The price is $5 and $10 (should not render as LaTeX)

Code block with LaTeX-like content (should not render):
```
$x = 5$
\frac{1}{2}
```

## Error Cases

Malformed LaTeX: $\frac{1}{2$ (missing closing)

Empty LaTeX: $$$$

Non-LaTeX between dollars: $hello world$ (no backslash, ^, or _)