const {testParagraph, endOfTable, makeCaption} = require("./table/table");

function prepend(currentChapterNumber, currentImageNumberInCurrentChapter, original) {
    return `图 ${currentChapterNumber}-${currentImageNumberInCurrentChapter}` + (original !== '' ? ('：' + original) : '');
}

function updateChapterAndImageNumbers(state) {
    let currentChapterNumber = 0;
    let currentImageNumberInCurrentChapter = 0;

    for (const token of state.tokens) {
        if (token.type === 'heading_open' && token.tag === 'h2') {
            currentChapterNumber++;
            currentImageNumberInCurrentChapter = 0;
        } else if (token.type === 'inline' && token.children) {
            for (const childToken of token.children) {

                if (childToken.type === 'image') {
                    currentImageNumberInCurrentChapter++;

                    childToken.attrPush(['data-chapter-number', currentChapterNumber]);
                    childToken.attrPush(['data-image-number', currentImageNumberInCurrentChapter]);

                    const modifiedAlt = prepend(currentChapterNumber, currentImageNumberInCurrentChapter, childToken.content);
                    childToken.attrSet('alt', modifiedAlt);

                    childToken.attrSet('title', prepend(currentChapterNumber, currentImageNumberInCurrentChapter, childToken.attrGet('title') || childToken.content));

                    childToken.content = modifiedAlt;

                    if (childToken.children && childToken.children.length > 0 && childToken.children[0].type === 'text') {
                        childToken.children[0].content = prepend(currentChapterNumber, currentImageNumberInCurrentChapter, childToken.children[0].content);
                    }
                }
            }
        }
    }
}

module.exports = function markdownItBook(md) {
    md.core.ruler.before('linkify', 'update_chapter_and_image_numbers', updateChapterAndImageNumbers);

    md.core.ruler.push('markdown-it-book-render', state => {
        md.renderer.rules.image = (tokens, idx, options, env, self) => {
            return self.renderToken(tokens, idx, options);
        }
    })

    md.core.ruler.after('block', 'book_table_captions', (state) => {
        let currentChapterNumber = 1;
        let currentNumberInCurrentChapter = 0;

        let i = 0;
        while (i < state.tokens.length) {
            const start = i
            const token = state.tokens[start]

            let end
            if (token.type === 'heading_open' && token.tag === 'h2') {
                currentChapterNumber++;
                currentNumberInCurrentChapter = 0;
            } else {
                if (end = testParagraph(state, start)) { // test for caption before table
                    if (state.tokens.length > end + 1) {
                        const after = state.tokens[end + 1]
                        if (after.tag === 'table' && after.nesting === 1) {
                            currentNumberInCurrentChapter++
                            makeCaption(state, start, end, currentChapterNumber, currentNumberInCurrentChapter)
                            const slice = state.tokens.splice(start, end + 1 - start)
                            state.tokens.splice(start + 1, 0, ...slice)
                        }
                    }
                } else if (end = endOfTable(state, start)) { // test for caption after table
                    if (state.tokens.length > end + 1) {
                        const captionEnd = testParagraph(state, end + 1)
                        if (captionEnd) {
                            currentNumberInCurrentChapter++
                            makeCaption(state, end + 1, captionEnd, currentChapterNumber, currentNumberInCurrentChapter)
                            const slice = state.tokens.splice(end + 1, captionEnd - end)
                            state.tokens.splice(start + 1, 0, ...slice)
                        }
                    }
                }
            }


            i = end || i + 1
        }

        return true
    })
};