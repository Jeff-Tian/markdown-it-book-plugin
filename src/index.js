const {testParagraph, endOfTable, makeCaption, makeCaptionForRawTable} = require("./table/table");
const {makeChapterNumber, makeSectionNumber, makeMinorSectionNumber} = require("./chapter/chapter");
const {makeMermaidCaption, fenceMermaid} = require("./mermaid/mermaid");
const {fencePlantuml} = require("./plantuml/plantuml");

function prependSpanInsideFigCaption(currentChapterNumber, currentImageNumberInCurrentChapter, id, contextTokens, state) {
    const spanOpen = new state.Token('span_open', 'span', 1);
    if (id) {
        spanOpen.attrSet('id', id + '-caption');
    }
    const numberOfImage = new state.Token('text', '', 0);
    numberOfImage.block = false;
    numberOfImage.content = `图 ${currentChapterNumber}-${currentImageNumberInCurrentChapter}`;
    const spanClose = new state.Token('span_close', 'span', -1);
    contextTokens.splice(0, 0, spanOpen, numberOfImage, spanClose);
}

module.exports = (md, options) => {
    const mainCounterTag = options?.mainCounterTag || 'h2';
    const sectionCounterTag = options?.sectionCounterTag;
    const minorSectionCounterTag = options?.minorSectionCounterTag;
    const updateMainCounter = options?.updateMainCounter || false;
    const inlineListNumbering = options?.inlineListNumbering || false;
    const replaceImagePath = options?.replaceImagePath ? options?.replaceImagePath : x => x;

    // 给图片编号
    md.core.ruler.before('linkify', 'update_chapter_and_image_numbers', function (state) {
        const counters = typeof updateMainCounter === 'boolean' ? [] : updateMainCounter;

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

                        const chapterNumber = typeof updateMainCounter === 'boolean' ? currentChapterNumber : counters[currentChapterNumber - 1];


                        childToken.attrPush(['data-chapter-number', chapterNumber]);
                        childToken.attrPush(['data-image-number', currentImageNumberInCurrentChapter]);

                        if (!childToken.content) {
                            prependSpanInsideFigCaption(currentChapterNumber, currentImageNumberInCurrentChapter, childToken.attrGet('id') || childToken.attrGet('alt'), childToken.children, state);
                        } else {
                            childToken.attrSet('alt', childToken.content);
                        }

                        if (!!childToken.attrGet('title') && childToken.content !== childToken.attrGet('title')) {
                            childToken.content = childToken.attrGet('title');
                        }

                        if (childToken.children && childToken.children.length > 0 && childToken.children[0].type === 'text') {
                            if (!!childToken.attrGet('title') && childToken.children[0].content !== childToken.attrGet('title')) {
                                childToken.children[0].content = childToken.attrGet('title');
                            }
                            prependSpanInsideFigCaption(chapterNumber, currentImageNumberInCurrentChapter, childToken.attrGet('id') || childToken.attrGet('alt'), childToken.children, state);
                        }

                        if (childToken.children && childToken.children.length <= 0) {
                            prependSpanInsideFigCaption(currentChapterNumber, currentImageNumberInCurrentChapter, childToken.attrGet('id') || childToken.attrGet('alt'), childToken.children, state);
                        }
                    }
                }
            } else if (token.type === 'fence' && (token.info.startsWith('mermaid') || token.info.startsWith('plantuml'))) {
                currentImageNumberInCurrentChapter++;

                const chapterNumber = typeof updateMainCounter === 'boolean' ? currentChapterNumber : counters[currentChapterNumber - 1];

                token.attrPush(['data-chapter-number', chapterNumber]);
                token.attrPush(['data-image-number', currentImageNumberInCurrentChapter]);

                const [_, id, title] = token.info.split(' ');
                const newTokensAdded = makeMermaidCaption(
                    state,
                    index,
                    chapterNumber,
                    currentImageNumberInCurrentChapter,
                    id,
                    title
                );
                index += newTokensAdded;
            } else if (token.type === 'html_block' && token.content.startsWith('<img')) {
                currentImageNumberInCurrentChapter++;
                const numbering = `图 ${currentChapterNumber}-${currentImageNumberInCurrentChapter}`;

                const alt = token.content.match(/alt="([^"]+)"/);
                const id = alt ? alt[1] : numbering;

                token.content = `<figure>${token.content.replace(/<img/, `<img data-chapter-number="${currentChapterNumber}" data-image-number="${currentImageNumberInCurrentChapter}"`).replace(/src="([^"]+)"/g, replaceImagePath)}<figcaption><span id="${id}-caption">${numbering}</span>title</figcaption></figure>\n`;
            }
        }
    });

    md.core.ruler.push('markdown-it-book-render', state => {
        md.renderer.rules.image = (tokens, idx, options, env, self) => {
            return self.renderToken(tokens, idx, options, env, self);
        }
    })
    // 给图片编号结束

    // 给表格编号
    md.core.ruler.after('block', 'book_table_captions', (state) => {
        const counters = typeof updateMainCounter === 'boolean' ? [] : updateMainCounter;

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

                            const chapterNumber = typeof updateMainCounter === 'boolean' ? currentChapterNumber : counters[currentChapterNumber - 2];

                            makeCaption(state, start, end, chapterNumber, currentNumberInCurrentChapter)
                            const deleted = state.tokens.splice(start, end + 1 - start)
                            state.tokens.splice(start + 1, 0, ...deleted)
                        } else if (after.tag === '' && after.type === 'html_block' && after.content.startsWith('<table>') && after.content.indexOf('<caption>') < 0) {
                            currentNumberInCurrentChapter++
                            const chapterNumber = typeof updateMainCounter === 'boolean' ? currentChapterNumber : counters[currentChapterNumber - 2];

                            makeCaptionForRawTable(state, start, end, chapterNumber, currentNumberInCurrentChapter, after);
                        }
                    }
                } else if (end = endOfTable(state, start)) { // test for caption after table
                    currentNumberInCurrentChapter++

                    const chapterNumber = typeof updateMainCounter === 'boolean' ? currentChapterNumber : counters[currentChapterNumber - 2];

                    if (state.tokens.length > end + 1) {
                        const captionEnd = testParagraph(state, end + 1)
                        if (captionEnd) {

                            makeCaption(state, end + 1, captionEnd, chapterNumber, currentNumberInCurrentChapter)
                            const deleted = state.tokens.splice(end + 1, captionEnd - end)
                            state.tokens.splice(start + 1, 0, ...deleted)
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

                            makeCaption(state, start + 1, start + 3, chapterNumber, currentNumberInCurrentChapter)
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

                        makeCaption(state, 1, 3, chapterNumber, currentNumberInCurrentChapter)
                    }
                }
            }


            i = end || i + 1
        }

        return true
    })

    // 给列表编号
    if (inlineListNumbering !== false) {
        md.core.ruler.after('inline', 'custom-lists', (state) => {
            let processList = inlineListNumbering
            let listDepth = 0; // 用于跟踪当前列表的深度

            state.tokens.forEach((token, index) => {
                if (typeof inlineListNumbering === 'string') {
                    if (token.type === 'heading_open') {
                        const nextToken = state.tokens[index + 1];
                        if (nextToken.type === 'inline' && nextToken.children && nextToken.children.length >= 1) {
                            const [child] = nextToken.children;

                            if (child.type === 'text' && child.content.startsWith(inlineListNumbering)) {
                                processList = true;
                            }
                        }
                    }
                }

                if (processList === true && token.type === 'list_item_open' && token.markup === '.') {
                    listDepth++;
                }

                if (processList === true && listDepth > 0 && token.type === 'inline') {
                    const text = token.content.trim()

                    if (text) {
                        token.content = `${listDepth}. ${text}`; // 为列表项添加编号

                        const [firstChild] = token.children;
                        firstChild.content = `${listDepth}. ${firstChild.content}`;
                    }
                }

                if (processList === true && token.type === 'heading_open') {
                    listDepth = 0
                }
            })
        })
    }

    // 给章节编号
    if (updateMainCounter) {
        const counters = typeof updateMainCounter === 'boolean' ? [] : updateMainCounter;

        md.core.ruler.after('block', 'book_chapters', (state) => {
            let currentChapterNumber = 0;
            let currentSectionNumber = 0;
            let currentMinorSectionNumber = 0;

            for (const [index, token] of state.tokens.entries()) {
                if (token.type === 'heading_open' && token.tag === mainCounterTag) {
                    currentChapterNumber++;
                    currentSectionNumber = 0;

                    const chapterNumber = typeof updateMainCounter === 'boolean' ? currentChapterNumber : counters[currentChapterNumber - 1];

                    token.attrPush(['data-chapter-number', chapterNumber]);
                    makeChapterNumber(state, token, index, chapterNumber);
                }

                if (!!sectionCounterTag && token.type === 'heading_open' && token.tag === sectionCounterTag) {
                    currentSectionNumber++;
                    currentMinorSectionNumber = 0;

                    const chapterNumber = typeof updateMainCounter === 'boolean' ? currentChapterNumber : counters[currentChapterNumber - 1];

                    const sectionNumber = chapterNumber + '.' + currentSectionNumber;

                    token.attrPush(['data-section-number', sectionNumber]);
                    makeSectionNumber(state, token, index, sectionNumber);
                }

                if (!!minorSectionCounterTag && token.type === 'heading_open' && token.tag === minorSectionCounterTag) {
                    currentMinorSectionNumber++;

                    const chapterNumber = typeof updateMainCounter === 'boolean' ? currentChapterNumber : counters[currentChapterNumber - 1];

                    const minorSectionNumber = chapterNumber + '.' + currentSectionNumber + '.' + currentMinorSectionNumber;

                    token.attrPush(['data-minor-section-number', minorSectionNumber]);
                    makeMinorSectionNumber(state, token, index, minorSectionNumber);
                }
            }
        })
    }

    // 给链接添加 id 属性（将 title 作为 id）
    // Remember old renderer, if overridden, or proxy to default renderer
    const defaultRender = md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
    };

    md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
        const idIndex = tokens[idx].attrIndex('id');
        const titleIndex = tokens[idx].attrIndex('title');

        if (idIndex < 0 && titleIndex >= 0) {
            tokens[idx].attrPush(['id', tokens[idx].attrGet('title')]); // add new attribute
        }

        // pass token to default renderer.
        return defaultRender(tokens, idx, options, env, self);
    };
    // 给链接添加 id 属性（将 title 作为 id）结束

    // plantuml
    const fence = md.renderer.rules.fence.bind(md.renderer.rules);
    md.renderer.rules.fence = (tokens, index, options, env, slf) => {
        const token = tokens[index];

        if (token.info.startsWith('plantuml')) {
            return fencePlantuml(tokens, token, index, options, env, slf);
        }

        if (token.info.startsWith('mermaid')) {
            return fenceMermaid(tokens, token, index, options, env, slf);
        }

        return fence(tokens, index, options, env, slf);
    };
};
