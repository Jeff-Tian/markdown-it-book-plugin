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
    const inl = state.tokens[start + 1]
    inl.content = `表 ${currentChapterNumber}-${currentNumberInCurrentChapter}：${inl.content.replace(rex, '')}`
    state.tokens[start].tag = 'caption'
    state.tokens[start].type = 'caption_open'
    state.tokens[end].tag = 'caption'
    state.tokens[end].type = 'caption_close'
}

module.exports = {
    testParagraph,
    endOfTable,
    makeCaption
}
