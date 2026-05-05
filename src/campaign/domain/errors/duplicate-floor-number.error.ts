export class DuplicateFloorNumberError extends Error {
    constructor() { super('Número de andar já existente neste capítulo'); }
}
