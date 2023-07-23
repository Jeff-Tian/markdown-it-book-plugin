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
};
