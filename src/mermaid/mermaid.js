function makeMermaidCaption(state, index, currentChapterNumber, currentImageNumberInCurrentChapter, id, title) {
    const figureOpen = new state.Token('figure_open', 'figure', 1);
    figureOpen.block = true;
    figureOpen.attrPush(['id', id || `fig-${currentChapterNumber}-${currentImageNumberInCurrentChapter}`]);
    const figureEnd = new state.Token('figure_close', 'figure', -1);
    figureEnd.block = true;

    state.tokens.splice(index + 1, 0, figureEnd);
    state.tokens.splice(index, 0, figureOpen)

    const figcaptionOpen = new state.Token('figcaption_open', 'figcaption', 1);
    figcaptionOpen.block = true;
    const figcaption = new state.Token('text', '', 0);
    figcaption.block = true;

    const numberOfFigure = `图 ${currentChapterNumber}-${currentImageNumberInCurrentChapter}`;
    figcaption.content = !title ? numberOfFigure : `${numberOfFigure}：${title}`;
    const figcaptionEnd = new state.Token('figcaption_close', 'figcaption', -1);
    figcaptionEnd.block = true;
    state.tokens.splice(index + 2, 0, figcaptionOpen, figcaption, figcaptionEnd);

    return 5;
}

module.exports = {
    makeMermaidCaption
}
