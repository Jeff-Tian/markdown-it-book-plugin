const MarkdownIt = require("markdown-it");
const markdownItBook = require("../src");
const path = require("path");
const generate = require("markdown-it-testgen");

// Initialize the MarkdownIt instance with the markdown-it-book plugin
const md = new MarkdownIt().use(markdownItBook);

describe('markdown-it-book', () => {
    describe('image', () => {
        describe('update or append chapter and image numbers', () => {

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
<p><img src="image1.png" alt="图 1-1" data-chapter-number="1" data-image-number="1" title="图 1-1"></p>
<p><img src="image2.png" alt="图 1-2" data-chapter-number="1" data-image-number="2" title="图 1-2"></p>
<h2>Chapter 2</h2>
<p><img src="image3.png" alt="图 2-1" data-chapter-number="2" data-image-number="1" title="图 2-1"></p>
`;

                expect(md.render(inputMarkdown)).toBe(expectedOutput);
            });

            test('should append chapter and image numbers', () => {
                const inputMarkdown = `
## Chapter 1

![力](image1.png)

![工](image2.png)

## Chapter 2

![要](image3.png)
  `;

                const expectedOutput = `<h2>Chapter 1</h2>
<p><img src="image1.png" alt="图 1-1：力" data-chapter-number="1" data-image-number="1" title="图 1-1：力"></p>
<p><img src="image2.png" alt="图 1-2：工" data-chapter-number="1" data-image-number="2" title="图 1-2：工"></p>
<h2>Chapter 2</h2>
<p><img src="image3.png" alt="图 2-1：要" data-chapter-number="2" data-image-number="1" title="图 2-1：要"></p>
`;

                expect(md.render(inputMarkdown)).toBe(expectedOutput);
            });

            test('should append chapter and image numbers to existing title', () => {
                const inputMarkdown = `
## Chapter 1

![力](image1.png "地")

![工](image2.png "土")

## Chapter 2

![要](image3.png "国")
  `;

                const expectedOutput = `<h2>Chapter 1</h2>
<p><img src="image1.png" alt="图 1-1：力" title="图 1-1：地" data-chapter-number="1" data-image-number="1"></p>
<p><img src="image2.png" alt="图 1-2：工" title="图 1-2：土" data-chapter-number="1" data-image-number="2"></p>
<h2>Chapter 2</h2>
<p><img src="image3.png" alt="图 2-1：要" title="图 2-1：国" data-chapter-number="2" data-image-number="1"></p>
`;

                expect(md.render(inputMarkdown)).toBe(expectedOutput);
            });
        })

        describe('works well with markdown-it-implicit-figures', () => {
            test('should append chapter and image numbers to existing title', () => {
                const inputMarkdown = `
## Chapter 1

![力](image1.png "地")

![工](image2.png "土")

## Chapter 2

![要](image3.png "国")
  `;

                const expectedOutput = `<h2>Chapter 1</h2>
<figure><img src="image1.png" alt="图 1-1：力" title="图 1-1：地" data-chapter-number="1" data-image-number="1"><figcaption>图 1-1：力</figcaption></figure>
<figure><img src="image2.png" alt="图 1-2：工" title="图 1-2：土" data-chapter-number="1" data-image-number="2"><figcaption>图 1-2：工</figcaption></figure>
<h2>Chapter 2</h2>
<figure><img src="image3.png" alt="图 2-1：要" title="图 2-1：国" data-chapter-number="2" data-image-number="1"><figcaption>图 2-1：要</figcaption></figure>
`;

                md.use(require('markdown-it-implicit-figures'), {
                    figcaption: true
                });

                expect(md.render(inputMarkdown)).toBe(expectedOutput);
            });
        })
    })

    describe('table', () => {
        const __dirname = path.dirname(__filename);

        generate(path.join(__dirname, 'fixtures/table/default.txt'), md);
    })
})