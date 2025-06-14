import { inject } from "@angular/core";
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from "@angular/forms";
import { UserRepository } from "src/app/core/domain/repositories/user.repository";

export class EmailValidator {
  #userRepository = inject(UserRepository);

  validate(): AsyncValidatorFn {
    return async (control: AbstractControl): Promise<ValidationErrors | null> => {
      return await this.#userRepository.getUserByEmail(control.value.toLowerCase(), false) ? 
        { emailExists: true } 
        : null;
    };
  }
}