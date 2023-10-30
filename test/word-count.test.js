const wordCount = require('../src/word-count')

describe('word count', () => {
    describe('count words', () => {
        test('count English words', () => {
            expect(wordCount('hello world')).toBe(2)
        })

        test('count Chinese words', () => {
            expect(wordCount('你好世界')).toBe(4)
        })

        test('count English and Chinese words', () => {
            expect(wordCount('你好世界hello world')).toBe(6)
        })
    })
});
