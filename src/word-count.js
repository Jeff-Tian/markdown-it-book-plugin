const englishWords = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

module.exports = s => {
    s = s.replace(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~！￥……（）—【】‘；：”“'。，、？《》]/g, '')

    let count = 0;
    let englishMode = false;

    for (let i = 0; i < s.length; i++) {
        if (englishWords.indexOf(s[i]) >= 0) {
            englishMode = true;
        } else {
            count++;
        }

        if (englishMode && (s[i] === ' ' || s[i] === '\n')) {
            englishMode = false;
        }

        if (englishMode && i >= s.length - 1) {
            count++;
        }
    }

    return count;
}
