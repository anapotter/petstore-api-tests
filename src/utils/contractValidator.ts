export interface OpenAPISpec {
  swagger?: string;
  openapi?: string;
  info: {
    title: string;
    version: string;
  };
  paths: {
    [path: string]: {
      [method: string]: {
        responses: {
          [statusCode: string]: {
            description: string;
            schema?: any;
          };
        };
      };
    };
  };
  definitions?: {
    [name: string]: {
      type: string;
      required?: string[];
      properties?: {
        [prop: string]: any;
      };
      enum?: string[];
    };
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class ContractValidator {
  constructor(private spec: OpenAPISpec) {}

  validateEndpointExists(path: string, method: string = 'get'): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!this.spec.paths[path]) {
      errors.push(`Endpoint '${path}' not found in OpenAPI spec`);
      return { valid: false, errors, warnings };
    }

    if (!this.spec.paths[path][method.toLowerCase()]) {
      errors.push(`Method '${method.toUpperCase()}' not found for endpoint '${path}'`);
      return { valid: false, errors, warnings };
    }

    return { valid: true, errors, warnings };
  }

  validateSchemaExists(schemaName: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!this.spec.definitions || !this.spec.definitions[schemaName]) {
      errors.push(`Schema '${schemaName}' not found in OpenAPI spec definitions`);
      return { valid: false, errors, warnings };
    }

    return { valid: true, errors, warnings };
  }

  getSchema(schemaName: string): any {
    if (!this.spec.definitions) {
      throw new Error('No definitions found in OpenAPI spec');
    }
    return this.spec.definitions[schemaName];
  }

  validateResponseAgainstSchema(
    response: any,
    schemaName: string,
    options: { strictRequired?: boolean } = {}
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const strictRequired = options.strictRequired !== false;

    const schema = this.getSchema(schemaName);
    if (!schema) {
      errors.push(`Schema '${schemaName}' not found`);
      return { valid: false, errors, warnings };
    }

    // Check required fields
    if (schema.required && Array.isArray(schema.required)) {
      for (const requiredField of schema.required) {
        if (!(requiredField in response)) {
          const msg = `Required field '${requiredField}' is missing from response`;
          if (strictRequired) {
            errors.push(msg);
          } else {
            warnings.push(msg);
          }
        }
      }
    }

    // Check field types
    if (schema.properties) {
      for (const [fieldName, fieldSchema] of Object.entries(schema.properties)) {
        if (fieldName in response) {
          const fieldValue = response[fieldName];
          const validationType = this.validateFieldType(
            fieldName,
            fieldValue,
            fieldSchema as any
          );

          errors.push(...validationType.errors);
          warnings.push(...validationType.warnings);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private validateFieldType(
    fieldName: string,
    value: any,
    fieldSchema: any
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Handle $ref
    if (fieldSchema.$ref) {
      const refSchemaName = fieldSchema.$ref.split('/').pop();
      if (typeof value === 'object' && value !== null) {
        const refValidation = this.validateResponseAgainstSchema(value, refSchemaName);
        return refValidation;
      }
    }

    // Validate type
    if (fieldSchema.type) {
      const expectedType = fieldSchema.type;
      const actualType = this.getJsonType(value);

      if (expectedType !== actualType) {
        errors.push(
          `Field '${fieldName}' has type '${actualType}' but schema expects '${expectedType}' (value: ${JSON.stringify(value)})`
        );
      }

      // Validate enum
      if (fieldSchema.enum && Array.isArray(fieldSchema.enum)) {
        if (!fieldSchema.enum.includes(value)) {
          errors.push(
            `Field '${fieldName}' has value '${value}' which is not in allowed enum values: [${fieldSchema.enum.join(', ')}]`
          );
        }
      }

      // Validate array items
      if (expectedType === 'array' && fieldSchema.items && Array.isArray(value)) {
        value.forEach((item, index) => {
          if (fieldSchema.items.$ref) {
            const refSchemaName = fieldSchema.items.$ref.split('/').pop();
            const itemValidation = this.validateResponseAgainstSchema(item, refSchemaName);
            itemValidation.errors.forEach(err =>
              errors.push(`${fieldName}[${index}]: ${err}`)
            );
          } else if (fieldSchema.items.type) {
            const itemType = this.getJsonType(item);
            if (itemType !== fieldSchema.items.type) {
              errors.push(
                `${fieldName}[${index}] has type '${itemType}' but schema expects '${fieldSchema.items.type}'`
              );
            }
          }
        });
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  private getJsonType(value: any): string {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'number') {
      return Number.isInteger(value) ? 'integer' : 'number';
    }
    return typeof value;
  }

  getEndpointPaths(): string[] {
    return Object.keys(this.spec.paths);
  }

  getSchemaNames(): string[] {
    return this.spec.definitions ? Object.keys(this.spec.definitions) : [];
  }

  formatValidationErrors(result: ValidationResult): string {
    const lines: string[] = [];

    if (result.errors.length > 0) {
      lines.push('Validation Errors:');
      result.errors.forEach(err => lines.push(`  ❌ ${err}`));
    }

    if (result.warnings.length > 0) {
      lines.push('Warnings:');
      result.warnings.forEach(warn => lines.push(`  ⚠️  ${warn}`));
    }

    return lines.join('\n');
  }
}
