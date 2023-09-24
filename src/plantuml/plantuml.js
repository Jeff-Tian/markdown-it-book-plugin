module.exports = {
    fencePlantuml: (tokens, token, index, options, env, slf) => {
        const deflate = require('./lib/deflate')

        const zippedCode = deflate.encode64(deflate.zip_deflate(
            unescape(encodeURIComponent(
                `@startuml\n${token.content}@enduml`
            )), 9
        ))
        return `<img src="https://www.plantuml.com/plantuml/png/${zippedCode}" alt="${token.info}" />\n`;
    }
}
