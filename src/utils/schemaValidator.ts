import Ajv, { JSONSchemaType, ValidateFunction, ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';

export class SchemaValidationError extends Error {
  constructor(
    public errors: ErrorObject[],
    public data: unknown
  ) {
    const errorMessages = errors
      .map((err) => {
        const path = err.instancePath || 'root';
        const message = err.message || 'validation failed';
        const params = JSON.stringify(err.params);
        return `  - ${path}: ${message} ${params !== '{}' ? params : ''}`;
      })
      .join('\n');

    super(`Schema validation failed:\n${errorMessages}\n\nData: ${JSON.stringify(data, null, 2)}`);
    this.name = 'SchemaValidationError';
  }
}

export class SchemaValidator {
  private static ajv: Ajv;

  private static getAjv(): Ajv {
    if (!this.ajv) {
      this.ajv = new Ajv({
        allErrors: true,
        verbose: true,
        strict: false,
        validateFormats: true,
      });
      addFormats(this.ajv);
    }
    return this.ajv;
  }

  static validateSchema<T>(schema: JSONSchemaType<T> | object, data: unknown): T {
    const ajv = this.getAjv();
    const validate: ValidateFunction = ajv.compile(schema);
    const valid = validate(data);

    if (!valid && validate.errors) {
      throw new SchemaValidationError(validate.errors, data);
    }

    return data as T;
  }

  static validate<T>(schema: JSONSchemaType<T> | object, data: unknown): {
    valid: boolean;
    errors: string[];
    data?: T;
  } {
    try {
      const validatedData = this.validateSchema(schema, data);
      return {
        valid: true,
        errors: [],
        data: validatedData,
      };
    } catch (error) {
      if (error instanceof SchemaValidationError) {
        return {
          valid: false,
          errors: error.errors.map(
            (err) => `${err.instancePath || 'root'}: ${err.message}`
          ),
        };
      }
      throw error;
    }
  }

  static assertValid<T>(schema: JSONSchemaType<T> | object, data: unknown, context?: string): T {
    try {
      return this.validateSchema(schema, data);
    } catch (error) {
      if (error instanceof SchemaValidationError) {
        const contextMsg = context ? ` (${context})` : '';
        throw new Error(`Schema validation failed${contextMsg}: ${error.message}`);
      }
      throw error;
    }
  }
}

export function validateSchema<T>(schema: JSONSchemaType<T> | object, data: unknown): T {
  return SchemaValidator.validateSchema(schema, data);
}
