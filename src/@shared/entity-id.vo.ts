import { v4 as uuidv4 } from 'uuid';
import { ValueObject } from './value-object';

export abstract class EntityId extends ValueObject {
    protected readonly value: string
  
    constructor(value?: string) {
       super();
       this.value = value ?? uuidv4()
    }
  
    equals(id: EntityId): boolean {
      return this.value === id.value
    }
  
    toString(): string {
      return this.value
    }
  }
  