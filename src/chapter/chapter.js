module.exports = {
    makeChapterNumber: (state, token, index, currentChapterNumber) => {
        state.tokens[index + 1].content = `${!!currentChapterNumber ? `第 ${currentChapterNumber} 章：` : ''}${state.tokens[index + 1].content}`;
    }
}
