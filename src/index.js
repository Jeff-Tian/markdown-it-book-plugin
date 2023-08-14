const {testParagraph, endOfTable, makeCaption} = require("./table/table");
const {makeChapterNumber} = require("./chapter/chapter");
const {makeMermaidCaption} = require("./mermaid/mermaid");

function prepend(currentChapterNumber, currentImageNumberInCurrentChapter, original) {
    return `图 ${currentChapterNumber}-${currentImageNumberInCurrentChapter}` + (original !== '' ? ('：' + original) : '');
}

module.exports = function markdownItBook(md, options) {
    const mainCounterTag = options?.mainCounterTag || 'h2';
    const updateMainCounter = options?.updateMainCounter || false;

    md.core.ruler.before('linkify', 'update_chapter_and_image_numbers', function (state) {
        let currentChapterNumber = 0;
        let currentImageNumberInCurrentChapter = 0;

        for (let index = 0; index < state.tokens.length; index++) {
            const token = state.tokens[index];

            if (token.type === 'heading_open' && token.tag === mainCounterTag) {
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

                        if (childToken.children && childToken.children.length <= 0) {
                            childToken.children = [{type: 'text', content: modifiedAlt}]
                        }
                    }
                }
            } else if (token.type === 'fence' && token.info === 'mermaid') {
                currentImageNumberInCurrentChapter++;

                token.attrPush(['data-chapter-number', currentChapterNumber]);
                token.attrPush(['data-image-number', currentImageNumberInCurrentChapter]);
                const newTokensAdded = makeMermaidCaption(state, index, currentChapterNumber, currentImageNumberInCurrentChapter);
                index += newTokensAdded;
            }
        }
    });

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
            if (token.type === 'heading_open' && token.tag === mainCounterTag) {
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
                    currentNumberInCurrentChapter++
                    if (state.tokens.length > end + 1) {
                        const captionEnd = testParagraph(state, end + 1)
                        if (captionEnd) {
                            makeCaption(state, end + 1, captionEnd, currentChapterNumber, currentNumberInCurrentChapter)
                            const slice = state.tokens.splice(end + 1, captionEnd - end)
                            state.tokens.splice(start + 1, 0, ...slice)
                        } else {
                            // for no caption, insert one
                            state.tokens.splice(start + 1, 0,
                                {content: '', nesting: 1, block: true},
                                {
                                    content: '',
                                    nesting: 0,
                                    type: 'inline',
                                    level: 1,
                                    children: [],
                                    markup: '',
                                    info: '',
                                    block: true,
                                    map: [4, 5]
                                },
                                {
                                    content: '',
                                    nesting: -1,
                                    block: true
                                })
                            makeCaption(state, start + 1, start + 3, currentChapterNumber, currentNumberInCurrentChapter)
                        }
                    } else {
                        // for no caption, insert one
                        state.tokens.splice(1, 0,
                            {content: '', nesting: 1, block: true},
                            {
                                content: '',
                                nesting: 0,
                                type: 'inline',
                                level: 1,
                                children: [],
                                markup: '',
                                info: '',
                                block: true,
                                map: [4, 5]
                            },
                            {
                                content: '',
                                nesting: -1,
                                block: true
                            })
                        makeCaption(state, 1, 3, currentChapterNumber, currentNumberInCurrentChapter)
                    }
                }
            }


            i = end || i + 1
        }

        return true
    })

    if (updateMainCounter) {
        const counters = typeof updateMainCounter === 'boolean' ? [] : updateMainCounter;

        md.core.ruler.after('block', 'book_chapters', (state) => {
            let currentChapterNumber = 0;

            for (const [index, token] of state.tokens.entries()) {
                if (token.type === 'heading_open' && token.tag === mainCounterTag) {
                    currentChapterNumber++;

                    const chapterNumber = typeof updateMainCounter === 'boolean' ? currentChapterNumber : counters[currentChapterNumber - 1];

                    token.attrPush(['data-chapter-number', chapterNumber]);
                    makeChapterNumber(state, token, index, chapterNumber);
                }
            }
        })
    }
};
