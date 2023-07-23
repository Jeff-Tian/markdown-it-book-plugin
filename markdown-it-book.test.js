const MarkdownIt = require("markdown-it");
const markdownItBook = require("./markdown-it-book");

// Initialize the MarkdownIt instance with the markdown-it-book plugin
const md = new MarkdownIt().use(markdownItBook);

// Test case 1: Test if chapter and image numbers are updated correctly
test('should update chapter and image numbers', () => {
    const inputMarkdown = `
## Chapter 1

![](image1.png)

![](image2.png)

## Chapter 2

![](image3.png)
  `;

    const expectedOutput = `<h2>Chapter 1</h2>
<p><img src="image1.png" alt="图 1-1" title="图 1-1"></p>
<p><img src="image2.png" alt="图 1-2" title="图 1-2"></p>
<h2>Chapter 2</h2>
<p><img src="image3.png" alt="图 2-1" title="图 2-1"></p>
`;

    expect(md.render(inputMarkdown)).toBe(expectedOutput);
});
