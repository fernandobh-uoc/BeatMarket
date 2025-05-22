import { Component, computed, effect, inject, input, OnInit, output, signal } from '@angular/core';
import { UserDataItemComponent } from './user-data-item.component';
import { UserDataItemEditService } from '../../utils/user-data-item-edit.service'; 
import { countries } from 'src/app/shared/utils/countries';

@Component({
  selector: 'app-user-data-item-wrapper',
  template: `
    <app-user-data-item
      [keyTag]="keyTag()"
      [editable]="editable()"
      [type]="type()"
      [label]="label()"
      [data]="data()"
      [usernameErrorMessage]="usernameErrorMessage()"
      [passwordUpdateSuccessMessage]="passwordUpdateSuccessMessage()"
      [editingStateActive]="editingStateActive()"
      [disabledSaveButtonPending]="disabledSaveButtonPending()"
      [disabledSaveButtonManual]="disabledSaveButtonManual()"
      [selectOptions]="countries"
      (save)="onSave($event)"
      (toggleEditingState)="onToggleEditingState()"
      (controlFocus)="onControlFocus()"
      (controlInput)="onControlInput($event)"
      (selectChange)="onSelectChange()"
    ></app-user-data-item>
  `,
  styles: '',
  imports: [UserDataItemComponent]
})
export class UserDataItemWrapperComponent {
  userDataEditService = inject(UserDataItemEditService);
  keyTag = input<string>('');

  type = input<'text' | 'password' | 'number' | 'avatar' | 'select'>('text');
  editable = input<boolean>(true);
  label = input<string>('');
  data = input<string>('');

  disabledSaveButtonManual = signal<boolean>(true);
  disabledSaveButtonPending = computed(() => this.userDataEditService.pending());
  editingStateActive = computed<boolean>(() => {
    const index = this.userDataEditService.editingInputStates().findIndex(record => record.hasOwnProperty(this.keyTag()));
    if (index === -1) {
      return false;
    }
    return this.userDataEditService.editingInputStates()[index][this.keyTag()];
  });

  storageErrorMessage = computed(() => this.userDataEditService.storageErrorMessage());
  usernameErrorMessage = computed(() => this.userDataEditService.usernameErrorMessage());
  passwordUpdateSuccessMessage = computed(() => this.userDataEditService.passwordUpdateSuccessMessage());

  countries = countries;

  onToggleEditingState() {
    const editingInputStates = this.userDataEditService.editingInputStates();
    const editingInputIndex = editingInputStates.findIndex(record => record.hasOwnProperty(this.keyTag()));
    const updatedEditingInputStates = [...editingInputStates];

    if (editingInputIndex === -1) {
      updatedEditingInputStates.push({ [this.keyTag()]: true }); 
    } else {
      updatedEditingInputStates[editingInputIndex][this.keyTag()] = !updatedEditingInputStates[editingInputIndex][this.keyTag()];
    }
    this.userDataEditService.editingInputStates.set(updatedEditingInputStates);

    this.userDataEditService.removeErrorMessages();
  }

  onControlFocus() {
    this.userDataEditService.removeErrorMessages();
  }

  onControlInput(data: string | number | null | undefined) {
    this.disabledSaveButtonManual.set(data === this.data());
  }

  onSelectChange() {
    this.disabledSaveButtonManual.set(false);
  }

  async onSave(data: string | number | null | undefined): Promise<void> {
    if (await this.userDataEditService.editUserData(this.keyTag(), data)) {
      this.disabledSaveButtonManual.set(true);
    };
  }
}
