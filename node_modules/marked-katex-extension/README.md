# marked-katex-extension

Render [katex](https://katex.org/) code in marked

```markdown
This is inline katex: $c = \\pm\\sqrt{a^2 + b^2}$

This is block level katex:

$$
c = \\pm\\sqrt{a^2 + b^2}
$$
```

You will still need to include the css in your html document to allow katex styles.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css" integrity="sha384-GvrOXuhMATgEsSwCs4smul74iXGOixntILdUW9XmUC6+HX0sLNAK3q71HotJqlAn" crossorigin="anonymous">
```

# Usage

```js
import {marked} from "marked";
import markedKatex from "marked-katex-extension";

// or in the browser
// <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@{version}/dist/katex.min.css" crossorigin="anonymous">
// <script src="https://cdn.jsdelivr.net/npm/katex@{version}/dist/katex.min.js" crossorigin="anonymous"></script>
// <script src="https://cdn.jsdelivr.net/npm/marked@{version}/lib/marked.umd.js"></script>
// <script src="https://cdn.jsdelivr.net/npm/marked-katex-extension@{version}/lib/index.umd.js"></script>

const options = {
  throwOnError: false
};

marked.use(markedKatex(options));

marked.parse("katex: $c = \\pm\\sqrt{a^2 + b^2}$");
```

![image](https://user-images.githubusercontent.com/97994/188899567-e6e8268c-209e-4067-8f44-0ada16caacdd.png)

## Block level

You can include newlines in block level katex. Block level katex must contain starting and ending delimiters on their own line.

```js
marked.parse(`
$$
\\begin{array}{cc}
   a & b \\\\
   c & d
\\end{array}
$$
`);
```

## DisplayMode

[`displayMode`](https://katex.org/docs/options.html) will be on by default when using two dollar signs (`$$`) in inline or block katex. And it will be off by default for a single dollar sign (`$`) in inline or block katex.

## Non Standard

If you want to be able to parse mathematical formulas in non-standard markdown format, that is, without spaces before and after $ or $$, you can turn on the nonStandard option.

```js
import {marked} from "marked";
import markedKatex from "marked-katex-extension";

const options = {
  nonStandard: true
};

marked.use(markedKatex(options));

marked.parse(`
afdaf$x=x^2$4$x=x^2$

$$
x = x^2
$$
`);
```

![image](https://private-user-images.githubusercontent.com/14917591/353790887-22238ca5-4a83-487d-912e-95eb10643b34.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MjI0Nzg0NjEsIm5iZiI6MTcyMjQ3ODE2MSwicGF0aCI6Ii8xNDkxNzU5MS8zNTM3OTA4ODctMjIyMzhjYTUtNGE4My00ODdkLTkxMmUtOTVlYjEwNjQzYjM0LnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNDA4MDElMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjQwODAxVDAyMDkyMVomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPWJkYjhkM2EwNzFiNGRmMTQ0M2QwN2FhN2NlNjhjZDI2ZTY4YmY0OWFjN2JlOGE3MzY3ZmQ5ZTdlYmMwNzliNjYmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JmFjdG9yX2lkPTAma2V5X2lkPTAmcmVwb19pZD0wIn0.EEIyMrF2xQXTRAnM3HrTIIPjdwtCGrQ2M9LoFyKHAww)

## `options`

Options are sent directly to [`katex`](https://katex.org/docs/options.html)
