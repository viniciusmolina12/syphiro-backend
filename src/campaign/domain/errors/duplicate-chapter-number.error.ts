export class DuplicateChapterNumberError extends Error {
    constructor() { super('Número de capítulo já existente nesta campanha'); }
}
