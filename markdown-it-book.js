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

                    const alt = `图 ${currentChapterNumber}-${currentImageNumberInCurrentChapter}`;
                    const altIndex = childToken.attrIndex("alt");

                    if (altIndex >= 0) {
                        childToken.attrs[altIndex][1] = alt;
                    } else {
                        childToken.attrs.push(["alt", alt]);
                    }

                    childToken.attrs.push(['title', `图 ${currentChapterNumber}-${currentImageNumberInCurrentChapter}`]);
                }
            }
        }
    }
}

module.exports = function markdownItBook(md) {
    md.core.ruler.push('update_chapter_and_image_numbers', updateChapterAndImageNumbers);
    md.core.ruler.push('markdown-it-book-render', state => {
        md.renderer.rules.image = (tokens, idx, options, env, self) => {
            return self.renderToken(tokens, idx, options);
        }
    })
};
