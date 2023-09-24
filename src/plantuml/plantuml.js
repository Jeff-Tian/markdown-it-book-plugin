module.exports = {
    fencePlantuml: (tokens, token, index, options, env, slf) => {
        return `@startuml\n${token.content}@enduml\n`;
    }
}
