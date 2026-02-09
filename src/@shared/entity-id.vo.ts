
import { ValueObject } from './value-object';
import { randomUUID } from 'crypto';

export abstract class EntityId extends ValueObject {
    protected readonly value: string
  
    constructor(value?: string) {
       super();
       this.value = value ?? randomUUID()
    }
  
    equals(id: EntityId): boolean {
      return this.value === id.value
    }
  
    toString(): string {
      return this.value
    }
  }
  