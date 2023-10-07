const rex = /^(?:Table)?:\s?/

function testParagraph(state, i) {
    const token = state.tokens[i]
    if (token.tag === 'p' && token.nesting === 1 && rex.test(state.tokens[i + 1].content)) {
        return i + 2 + state.tokens.slice(i + 2).findIndex(t => t.tag === 'p' && t.nesting === -1)
    }
}

function endOfTable(state, i) {
    const token = state.tokens[i]
    if (token.tag === 'table' && token.nesting === 1) {
        return i + 1 + state.tokens.slice(i + 1).findIndex(t => t.tag === 'table' && t.nesting === -1)
    }
}

function makeCaption(state, start, end, currentChapterNumber, currentNumberInCurrentChapter) {
    const text = new state.Token('text', '', 0)
    text.content = `表 ${currentChapterNumber}-${currentNumberInCurrentChapter}`

    const inl = state.tokens[start + 1]
    const captionContent = inl.content.replace(rex, '');
    const id = (captionContent || text.content).replace(/\s/g, '-').toLowerCase();

    inl.content = captionContent;

    state.tokens[start].tag = 'caption'
    state.tokens[start].type = 'caption_open'
    state.tokens[end].tag = 'caption'
    state.tokens[end].type = 'caption_close'

    const spanOpen = new state.Token('span_open', 'span', 1)
    spanOpen.attrPush(['id', id + '-caption'])
    const spanClose = new state.Token('span_close', 'span', -1)

    inl.children = [spanOpen, text, spanClose, ...inl.children]
}

module.exports = {
    testParagraph,
    endOfTable,
    makeCaption
}
