// Client-side validation helpers for enhanced dynamic accounting

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    message?: string;
}

export interface ValidationError {
    field: string;
    message: string;
    code?: string;
}

export interface ValidationWarning {
    field: string;
    message: string;
    code?: string;
}

export class ValidationService {
    // Real-time validation for form fields
    static validateField(fieldName: string, value: unknown, rules: ValidationRule[]): ValidationResult {
        const result: ValidationResult = {
            isValid: true,
            errors: [],
            warnings: []
        };

        for (const rule of rules) {
            const ruleResult = rule.validate(value);
            if (!ruleResult.isValid) {
                result.errors.push({
                    field: fieldName,
                    message: ruleResult.message || 'Validation failed',
                    code: rule.code
                });
                result.isValid = false;
            } else if (ruleResult.warning) {
                result.warnings.push({
                    field: fieldName,
                    message: ruleResult.warning || 'Warning',
                    code: rule.code
                });
            }
        }

        return result;
    }

    // Validate entire form/model
    static validateModel<T>(model: T, validationRules: Record<string, ValidationRule[]>): ValidationResult {
        const result: ValidationResult = {
            isValid: true,
            errors: [],
            warnings: []
        };

        for (const [fieldName, rules] of Object.entries(validationRules)) {
            const fieldValue = (model as Record<string, unknown>)[fieldName];
            const fieldResult = this.validateField(fieldName, fieldValue, rules);

            result.errors.push(...fieldResult.errors);
            result.warnings.push(...fieldResult.warnings);

            if (!fieldResult.isValid) {
                result.isValid = false;
            }
        }

        return result;
    }

    // Async validation with server-side rules
    static async validateWithServer<T>(model: T, endpoint: string): Promise<ValidationResult> {
        try {
            const response = await fetch(`/api/validation/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(model)
            });

            if (response.ok) {
                return await response.json();
            } else {
                return {
                    isValid: false,
                    errors: [{ field: 'general', message: 'Server validation failed' }],
                    warnings: []
                };
            }
        } catch {
            return {
                isValid: false,
                errors: [{ field: 'general', message: 'Validation service unavailable' }],
                warnings: []
            };
        }
    }

    // Format validation errors for display
    static formatErrorsForDisplay(errors: ValidationError[]): Record<string, string[]> {
        const formatted: Record<string, string[]> = {};

        for (const error of errors) {
            if (!formatted[error.field]) {
                formatted[error.field] = [];
            }
            formatted[error.field].push(error.message);
        }

        return formatted;
    }

    // Check if field has errors
    static hasFieldError(errors: ValidationError[], fieldName: string): boolean {
        return errors.some(error => error.field === fieldName);
    }

    // Get errors for specific field
    static getFieldErrors(errors: ValidationError[], fieldName: string): string[] {
        return errors
            .filter(error => error.field === fieldName)
            .map(error => error.message);
    }
}

// Validation rule interface
export interface ValidationRule {
    code?: string;
    validate: (value: unknown) => { isValid: boolean; message?: string; warning?: string };
}

// Common validation rules
export class ValidationRules {
    static required(message: string = 'This field is required'): ValidationRule {
        return {
            code: 'REQUIRED',
            validate: (value: unknown) => ({
                isValid: value !== null && value !== undefined && value !== '',
                message: message
            })
        };
    }

    static minLength(min: number, message?: string): ValidationRule {
        return {
            code: 'MIN_LENGTH',
            validate: (value: unknown) => ({
                isValid: !value || (typeof value === 'string' && value.length >= min),
                message: message || `Minimum length is ${min} characters`
            })
        };
    }

    static maxLength(max: number, message?: string): ValidationRule {
        return {
            code: 'MAX_LENGTH',
            validate: (value: unknown) => ({
                isValid: !value || (typeof value === 'string' && value.length <= max),
                message: message || `Maximum length is ${max} characters`
            })
        };
    }

    static email(message: string = 'Please enter a valid email address'): ValidationRule {
        return {
            code: 'EMAIL',
            validate: (value: unknown) => {
                if (!value) return { isValid: true };
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return {
                    isValid: typeof value === 'string' && emailRegex.test(value),
                    message: message
                };
            }
        };
    }

    static numeric(message: string = 'Please enter a valid number'): ValidationRule {
        return {
            code: 'NUMERIC',
            validate: (value: unknown) => {
                if (!value) return { isValid: true };
                return {
                    isValid: !isNaN(Number(value)),
                    message: message
                };
            }
        };
    }

    static positiveNumber(message: string = 'Please enter a positive number'): ValidationRule {
        return {
            code: 'POSITIVE_NUMBER',
            validate: (value: unknown) => {
                if (!value) return { isValid: true };
                const num = Number(value);
                return {
                    isValid: !isNaN(num) && num > 0,
                    message: message
                };
            }
        };
    }

    static dateNotFuture(message: string = 'Date cannot be in the future'): ValidationRule {
        return {
            code: 'DATE_NOT_FUTURE',
            validate: (value: unknown) => {
                if (!value) return { isValid: true };
                const date = new Date(value as string);
                const today = new Date();
                today.setHours(23, 59, 59, 999); // End of today
                return {
                    isValid: date <= today,
                    message: message
                };
            }
        };
    }

    static accountCodeFormat(message: string = 'Account code should be numeric'): ValidationRule {
        return {
            code: 'ACCOUNT_CODE_FORMAT',
            validate: (value: unknown) => {
                if (!value) return { isValid: true };
                const isNumeric = /^\d+$/.test(String(value));
                return {
                    isValid: true, // Don't fail validation
                    warning: isNumeric ? undefined : message
                };
            }
        };
    }

    static balancedTransaction(): ValidationRule {
        return {
            code: 'BALANCED_TRANSACTION',
            validate: (lines: unknown) => {
                const linesArray = lines as Array<{ debit?: number; credit?: number }>;
                if (!linesArray || linesArray.length === 0) {
                    return { isValid: false, message: 'Transaction must have at least one line' };
                }

                const totalDebits = linesArray.reduce((sum, line) => sum + (line.debit || 0), 0);
                const totalCredits = linesArray.reduce((sum, line) => sum + (line.credit || 0), 0);

                const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

                return {
                    isValid: isBalanced,
                    message: isBalanced ? undefined : `Transaction is not balanced. Debits: ${totalDebits}, Credits: ${totalCredits}`
                };
            }
        };
    }

    static custom(validationFn: (value: unknown) => boolean, message: string, code?: string): ValidationRule {
        return {
            code: code || 'CUSTOM',
            validate: (value: unknown) => ({
                isValid: validationFn(value),
                message: message
            })
        };
    }
}

// Validation context for complex scenarios
export class ValidationContext {
    private rules: Record<string, ValidationRule[]> = {};
    private asyncRules: Record<string, (value: unknown) => Promise<ValidationResult>> = {};

    addRule(fieldName: string, rule: ValidationRule): ValidationContext {
        if (!this.rules[fieldName]) {
            this.rules[fieldName] = [];
        }
        this.rules[fieldName].push(rule);
        return this;
    }

    addAsyncRule(fieldName: string, rule: (value: unknown) => Promise<ValidationResult>): ValidationContext {
        this.asyncRules[fieldName] = rule;
        return this;
    }

    validate<T>(model: T): ValidationResult {
        return ValidationService.validateModel(model, this.rules);
    }

    async validateAsync<T>(model: T): Promise<ValidationResult> {
        // First run synchronous validation
        const syncResult = this.validate(model);

        // Then run async validation
        const asyncResults: ValidationResult[] = [];

        for (const [fieldName, asyncRule] of Object.entries(this.asyncRules)) {
            const fieldValue = (model as Record<string, unknown>)[fieldName];
            const asyncResult = await asyncRule(fieldValue);
            asyncResults.push(asyncResult);
        }

        // Combine results
        const combinedResult: ValidationResult = {
            isValid: syncResult.isValid && asyncResults.every(r => r.isValid),
            errors: [...syncResult.errors, ...asyncResults.flatMap(r => r.errors)],
            warnings: [...syncResult.warnings, ...asyncResults.flatMap(r => r.warnings)]
        };

        return combinedResult;
    }
}

// Export commonly used validation contexts
export const CashBookEntryValidation = new ValidationContext()
    .addRule('transactionDate', ValidationRules.required('Transaction date is required'))
    .addRule('transactionDate', ValidationRules.dateNotFuture())
    .addRule('referenceNumber', ValidationRules.required('Reference number is required'))
    .addRule('referenceNumber', ValidationRules.maxLength(50))
    .addRule('lines', ValidationRules.balancedTransaction());

export const CategoryValidation = new ValidationContext()
    .addRule('accountName', ValidationRules.required('Category name is required'))
    .addRule('accountName', ValidationRules.maxLength(200))
    .addRule('accountCode', ValidationRules.required('Account code is required'))
    .addRule('accountCode', ValidationRules.maxLength(10))
    .addRule('accountCode', ValidationRules.accountCodeFormat());

export const ContactValidation = new ValidationContext()
    .addRule('name', ValidationRules.required('Contact name is required'))
    .addRule('name', ValidationRules.maxLength(200))
    .addRule('email', ValidationRules.required('Email is required'))
    .addRule('email', ValidationRules.email())
    .addRule('companyName', ValidationRules.maxLength(100));