module.exports = {
    makeChapterNumber: (state, token, index, currentChapterNumber) => {
        state.tokens.splice(index + 1, 0, {
            content: `第 ${currentChapterNumber} 章：`,
            nesting: 0,
            type: 'inline',
            level: 1,
            children: [],
            markup: '',
            info: '',
            block: true,
        })
    }
}
