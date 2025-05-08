import { inject } from "@angular/core";
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from "@angular/forms";
import { UserRepository } from "src/app/core/domain/repositories/user.repository";

export class UsernameValidator {
  #userRepository = inject(UserRepository);

  validate(): AsyncValidatorFn {
    return async (control: AbstractControl): Promise<ValidationErrors | null> => {
      return await this.#userRepository.getUserByUsername(control.value) ? 
        { usernameExists: true } 
        : null;
      //return { usernameExists: await userRepository?.getUserByUsername(control.value.toLowerCase()) == null }; 
    };
  }
}