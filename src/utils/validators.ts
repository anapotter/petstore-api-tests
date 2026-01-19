import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true });

export class SchemaValidator {
  static validate(data: unknown, schema: object): { valid: boolean; errors: string[] } {
    const validate = ajv.compile(schema);
    const valid = validate(data);
    if (valid === false && validate.errors) {
      return {
        valid: false,
        errors: validate.errors.map((err) => `${err.instancePath} ${err.message}`),
      };
    }
    return { valid: true, errors: [] };
  }
}

export class ResponseValidator {
  static assertStatusCode(actual: number, expected: number): void {
    if (actual !== expected) {
      throw new Error(`Expected status code ${expected}, but got ${actual}`);
    }
  }

  static assertHasProperty(obj: any, property: string): void {
    if (!Object.prototype.hasOwnProperty.call(obj, property)) {
      throw new Error(`Expected object to have property "${property}"`);
    }
  }

  static assertType(value: any, expectedType: string): void {
    const actualType = typeof value;
    if (actualType !== expectedType) {
      throw new Error(`Expected type "${expectedType}", but got "${actualType}"`);
    }
  }
}
