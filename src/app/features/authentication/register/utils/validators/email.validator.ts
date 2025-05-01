import { inject } from "@angular/core";
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from "@angular/forms";
import { UserRepository } from "src/app/core/domain/repositories/user.repository";

export class EmailValidator {
  static validate(userRepository?: UserRepository): AsyncValidatorFn {
    return async (control: AbstractControl): Promise<ValidationErrors | null> => {
      return new Promise<any>(resolve => {
        setTimeout(() => {
          /* resolve({
            emailExists: "it is taken"
          }); */ 
          resolve(null);
        }, 1000);
      });
      //return { emailExists: await userRepository?.getUserByEmail(control.value.toLowerCase()) == null };
    };
  }
}