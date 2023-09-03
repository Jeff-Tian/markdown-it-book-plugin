module.exports = {
    makeChapterNumber: (state, token, index, currentChapterNumber) => {
        state.tokens[index + 1].content = `${!!currentChapterNumber ? `第 ${currentChapterNumber} 章：` : ''}${state.tokens[index + 1].content}`;
    },

    makeSectionNumber: (state, token, index, currentSectionNumber) => {
        state.tokens[index + 1].content = `${!!currentSectionNumber ? `${currentSectionNumber} ` : ''}${state.tokens[index + 1].content}`;
    },

    makeMinorSectionNumber: (state, token, index, currentMinorSectionNumber) => {
        state.tokens[index + 1].content = `${!!currentMinorSectionNumber ? `${currentMinorSectionNumber} ` : ''}${state.tokens[index + 1].content}`;
    }
}
