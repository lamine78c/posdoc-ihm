import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ONE, ZERO } from './Constants';

export default class CustomValidators {
  static lenghtValidation(min, max?): ValidatorFn {
    return function validate(control: AbstractControl): ValidationErrors {
      const nullValidate = !control.value && min === ZERO; // autorise null validate si min=0
      const minMaxValidate = !!control.value && control.value.toString().length >= min && control.value.toString().length <= max;
      const minValidate = !!control.value && control.value.toString().length === min;
      const msgErrorMinMaxValidate = {
        isError: true,
        message: 'La valeur doit avoir ' + min + ' caractère minimum et ' + max + ' maximum',
      };
      const msgErrorMinValidate = {
        isError: true,
        message: 'La valeur doit avoir ' + min + ' caractère',
      };
      const testMinMaxValidate = minMaxValidate ? null : msgErrorMinMaxValidate;
      const testMinValidate = minValidate ? null : msgErrorMinValidate;
      const testNullValidate = nullValidate ? null : testMinMaxValidate;
      return max ? testNullValidate : testMinValidate;
    };
  }

  static lenghtMaxValidation(max): ValidatorFn {
    return function validate(control: AbstractControl): ValidationErrors {
      const isValidate = Validators.maxLength(max)(control) == null;
      const msgError = {
        isError: true,
        message: 'La valeur doit avoir ' + max + ' caractères maximum',
      };
      return isValidate ? null : msgError;
    };
  }

  static required(): ValidatorFn {
    return function validate(control: AbstractControl): ValidationErrors {
      const isValidate = !!control.value || control.value === ZERO; // ATTENTION pour typeof(control.value) number, le chiffre 0 doit être valider
      const msgError = {
        isError: true,
        message: 'La valeur ne peut pas être nulle',
      };
      return isValidate ? null : msgError;
    };
  }

  static oneRequired(messageError?: string): ValidatorFn {
    return function validate(control: AbstractControl): ValidationErrors {
      let oneSelected = false;
      if (control instanceof FormGroup) {
        const ctrl = control.getRawValue();
        Object.keys(ctrl).forEach(e => {
          if (typeof ctrl[e] == 'object') {
            const t = ctrl[e];
            Object.keys(t).forEach(i => {
              oneSelected = oneSelected || t[i];
            });
          } else {
            oneSelected = oneSelected || ctrl[e];
          }
        });
      } else if (control instanceof FormControl) {
        const value = control.getRawValue();
        oneSelected = value && value instanceof Array && value.length > ZERO;
      }
      const msgError = {
        isError: true,
        message: messageError ? messageError : 'Au moins une valeur doit être sélectionner.',
      };
      return oneSelected ? null : msgError;
    };
  }

  static charValidation(validation: ValidationInterface): ValidatorFn {
    return function validate(control: AbstractControl): ValidationErrors {
      const reg = validation.regex;
      const isRegValidate = !!control.value && reg.test(control.value);
      const msgError = {
        isError: true,
        message: validation.messageError,
      };
      return isRegValidate ? null : msgError;
    };
  }

  static min(min): ValidatorFn {
    return function validate(control: AbstractControl): ValidationErrors {
      const isValidate = Validators.min(min)(control) === null;
      const msgError = {
        isError: true,
        message: 'La valeur doit être supérieure ou égale à ' + min,
      };
      return isValidate ? null : msgError;
    };
  }

  static maxValueValidator(max): ValidatorFn {
    return function validate(control: AbstractControl): ValidationErrors {
      const reg = new RegExp(/^\d*$/);
      const isRegValidate = (control.value || control.value == ZERO) && reg.test(control.value);
      const msgErrorRegValidate = {
        isError: true,
        message: 'La valeur doit être un entier',
      };
      const isMaxValidate = control.value <= max;
      const msgErrorMaxValidate = {
        isError: true,
        message: 'La valeur doit être inférieure ou égale à ' + max,
      };
      const testMaxValidate = isMaxValidate ? null : msgErrorMaxValidate;
      return isRegValidate ? testMaxValidate : msgErrorRegValidate;
    };
  }

  static numberValidator(): ValidatorFn {
    return function validate(control: AbstractControl): ValidationErrors {
      const reg = new RegExp(/^\d*$/);
      const isRegValidate = (control.value || control.value == ZERO) && reg.test(control.value);
      const msgError = {
        isError: true,
        message: 'La valeur doit être un entier',
      };
      return isRegValidate ? null : msgError;
    };
  }

  static numericValidator(): ValidatorFn {
    return function validate(control: AbstractControl): ValidationErrors {
      const reg = new RegExp(/^(\d*[.]\d+|\d+)$/);
      const isRegValidate = control.value && reg.test(control.value);
      const msgError = {
        isError: true,
        message: 'La valeur doit être numéric',
      };
      return isRegValidate ? null : msgError;
    };
  }

  // validator tarif coupli between 0 and 99.999
  static coupliValidator(): ValidatorFn {
    return function validate(control: AbstractControl): ValidationErrors {
      const reg = new RegExp(/^\d{1,2}(\.\d{1,3})?$/);
      const isRegValidate = control.value && reg.test(control.value);
      const msgError = {
        isError: true,
        message: 'La valeur doit être entre 0 et 99.999',
      };
      return isRegValidate ? null : msgError;
    };
  }

  static onlyOneRequired(): ValidatorFn {
    return function validate(control: AbstractControl): ValidationErrors {
      const ctrl = (control as FormGroup).getRawValue();
      let nbrSelected = 0;
      Object.keys(ctrl).forEach(e => {
        if (typeof ctrl[e] == 'object') {
          const t = ctrl[e];
          Object.keys(t).forEach(i => {
            if (t[i]) {
              nbrSelected++;
            }
          });
        } else if (ctrl[e]) {
          nbrSelected++;
        }
      });
      const isValidate = nbrSelected === ONE;
      const msgError = {
        isError: true,
        message: 'Seulement une valeur doit etre sélectionner',
      };
      return isValidate ? null : msgError;
    };
  }

  static positiveValueValidator(): ValidatorFn {
    return function validate(control: AbstractControl): ValidationErrors {
      const isValidate = control.value > 0;
      const msgError = {
        isError: true,
        message: 'La valeur doit être un entier positif',
      };
      return isValidate ? null : msgError;
    };
  }
}

export interface ValidationInterface {
  regex: RegExp;
  messageError: string;
}
