import { Component, computed, effect, ElementRef, inject, input, OnInit, output, Signal, signal, viewChild } from '@angular/core';
import { UserDataItemComponent } from './user-data-item.component';
import { ProfileService } from '../../data-access/profile.service';
import { countries } from 'src/app/shared/utils/countries';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-user-data-item-wrapper',
  template: `
    <app-user-data-item
      [keyTag]="keyTag()"
      [editable]="editable()"
      [type]="type()"
      [label]="label()"
      [data]="data()"
      [profilePictureURL]="newProfilePictureDataURL() ?? data()"
      [usernameErrorMessage]="usernameErrorMessage()"
      [passwordUpdateSuccessMessage]="passwordUpdateSuccessMessage()"
      [editingStateActive]="editingStateActive()"
      [disabledSaveButtonPending]="disabledSaveButtonPending()"
      [disabledSaveButtonManual]="disabledSaveButtonManual()"
      [selectOptions]="countries"
      (save)="onSave($event)"
      (toggleEditingState)="onToggleEditingState()"
      (editAvatar)="onEditAvatar()"
      (handleFileInput)="handleFileInput($event)"
      (controlFocus)="onControlFocus()"
      (controlInput)="onControlInput($event)"
      (selectChange)="onSelectChange()"
    ></app-user-data-item>
    @if (type() === 'profilePicture') {
      <input 
        #fileInput
        type="file" 
        accept="image/*" 
        (change)="handleFileInput($event)"
        hidden
      />
    }
  `,
  styles: '',
  imports: [UserDataItemComponent]
})
export class UserDataItemWrapperComponent {
  profileService = inject(ProfileService);
  keyTag = input<string>('');

  type = input<'text' | 'password' | 'number' | 'profilePicture' | 'select'>('text');
  editable = input<boolean>(true);
  label = input<string>('');
  data = input<string>('');
  newProfilePictureDataURL = computed(() => this.profileService.newProfilePictureDataURL());

  disabledSaveButtonManual = signal<boolean>(true);
  disabledSaveButtonPending = computed(() => this.profileService.pending());
  editingStateActive = computed<boolean>(() => {
    const index = this.profileService.editingInputStates().findIndex(record => record.hasOwnProperty(this.keyTag()));
    if (index === -1) {
      return false;
    }
    return this.profileService.editingInputStates()[index][this.keyTag()];
  });

  storageErrorMessage = computed(() => this.profileService.storageErrorMessage());
  usernameErrorMessage = computed(() => this.profileService.usernameErrorMessage());
  passwordUpdateSuccessMessage = computed(() => this.profileService.passwordUpdateSuccessMessage());

  countries = countries;

  onToggleEditingState() {
    const editingInputStates = this.profileService.editingInputStates();
    const editingInputIndex = editingInputStates.findIndex(record => record.hasOwnProperty(this.keyTag()));
    const updatedEditingInputStates = [...editingInputStates];

    if (editingInputIndex === -1) {
      updatedEditingInputStates.push({ [this.keyTag()]: true });
    } else {
      updatedEditingInputStates[editingInputIndex][this.keyTag()] = !updatedEditingInputStates[editingInputIndex][this.keyTag()];
    }
    this.profileService.editingInputStates.set(updatedEditingInputStates);

    this.profileService.newProfilePictureDataURL.set(null);

    this.disabledSaveButtonManual.set(true);

    this.profileService.removeErrorMessages();
  }

  fileInput: Signal<ElementRef<HTMLInputElement> | undefined> = viewChild('fileInput');
  onEditAvatar = async () => {
    if (Capacitor.isNativePlatform()) {
      await this.profileService.getAvatarData();
      if (this.profileService.newProfilePictureDataURL()) {
        this.disabledSaveButtonManual.set(false);
      } else {
        this.onToggleEditingState();
      }
    } else {
      // Activate hidden file input
      this.fileInput()?.nativeElement.click();
    }
  }

  handleFileInput = async (event: Event) => {
    await this.profileService.setAvatarDataNotNative(event);
    if (this.profileService.newProfilePictureDataURL()) {
      this.disabledSaveButtonManual.set(false);
    }
  }

  onControlFocus() {
    this.profileService.removeErrorMessages();
  }

  onControlInput(data: string | number | null | undefined) {
    this.disabledSaveButtonManual.set(data === this.data());
  }

  onSelectChange() {
    this.disabledSaveButtonManual.set(false);
  }

  async onSave(data: string | number | null | undefined): Promise<void> {
    if (this.type() === 'profilePicture' && this.profileService.newProfilePictureDataURL()) { 
      if (await this.profileService.saveNewProfilePictureDataURL()) {
        this.disabledSaveButtonManual.set(true);
      }
      return;
    } 

    if (await this.profileService.editUserData(this.keyTag(), data)) {
      this.disabledSaveButtonManual.set(true);
    };
    
  }
}
