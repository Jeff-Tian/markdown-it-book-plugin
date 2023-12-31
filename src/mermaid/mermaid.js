function makeMermaidCaption(state, index, currentChapterNumber, currentImageNumberInCurrentChapter, id, title) {
    const figureOpen = new state.Token('figure_open', 'figure', 1);
    figureOpen.block = true;

    const autoId = `fig-${currentChapterNumber}-${currentImageNumberInCurrentChapter}`;

    figureOpen.attrPush(['id', id || autoId]);
    const figureEnd = new state.Token('figure_close', 'figure', -1);
    figureEnd.block = true;

    state.tokens.splice(index + 1, 0, figureEnd);
    state.tokens.splice(index, 0, figureOpen)

    const figcaptionOpen = new state.Token('figcaption_open', 'figcaption', 1);
    figcaptionOpen.block = true;

    const spanOpen = new state.Token('span_open', 'span', 1);
    spanOpen.attrSet("id", `${id || autoId}-caption`)
    spanOpen.block = false;

    const numberOfFigure = new state.Token('text', '', 0);
    numberOfFigure.block = false;
    numberOfFigure.content = `图 ${currentChapterNumber}-${currentImageNumberInCurrentChapter}`;

    const spanClose = new state.Token('span_close', 'span', -1);

    const figcaption = new state.Token('text', '', 0);
    figcaption.block = true;
    figcaption.content = !title ? '': title;

    const figcaptionEnd = new state.Token('figcaption_close', 'figcaption', -1);
    figcaptionEnd.block = true;

    state.tokens.splice(index + 2, 0, figcaptionOpen, spanOpen, numberOfFigure, spanClose, figcaption, figcaptionEnd);

    return 5;
}

function fenceMermaid(tokens, token, index, options, env, slf) {
    try {
        const key = index;
        const cssClass = 'mermaid';
        return `
      <Suspense>
      <template #default>
      <Mermaid id="mermaid-${key}" class="${cssClass}" graph="${encodeURIComponent(
            token.content
        )}"></Mermaid>
      </template>
        <!-- loading state via #fallback slot -->
        <template #fallback>
          Loading...
        </template>
      </Suspense>`;
    } catch (err) {
        return `<pre>${err}</pre>`;
    }
}

module.exports = {
    makeMermaidCaption,
    fenceMermaid,
}
