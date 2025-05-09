import { Component, computed, effect, input, OnInit, output, signal, viewChild } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { IonLabel, IonText, IonInput, IonAvatar, IonIcon, IonInputPasswordToggle, IonSelect, IonSelectOption } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { closeOutline, createOutline, saveOutline } from 'ionicons/icons';
import { CountryData } from 'src/app/shared/utils/countries';

@Component({
  selector: 'app-user-data-item',
  templateUrl: './user-data-item.component.html',
  styleUrls: ['./user-data-item.component.scss'],
  imports: [IonIcon, IonAvatar, IonInput, IonLabel, IonText, IonInputPasswordToggle, IonSelect, IonSelectOption]
})
export class UserDataItemComponent  implements OnInit {
  
  keyTag = input<string>('');
  type = input<'text' | 'password' | 'number' | 'avatar' | 'select'>('text');
  editable = input<boolean>(true);
  label = input<string>('');
  data = input<string>('');
  disabledSaveButtonPending = input<boolean>(false);
  disabledSaveButtonManual = input<boolean>(false);
  editingStateActive = input<boolean>(false);
  usernameErrorMessage = input<string>('');
  passwordUpdateSuccessMessage = input<string>('');

  editingPasswordStateActive = signal<boolean>(false);
  
  save = output<string | number | null | undefined>();
  toggleEditingState = output<void>();
  controlFocus = output<void>();
  controlInput = output<string | number | null | undefined>();
  selectChange = output<void>();

  selectOptions = input<CountryData[]>([]);
  
  editInput = viewChild<AbstractControl>('editInput');

  constructor() {
    addIcons({ createOutline, saveOutline, closeOutline });
  }


  ngOnInit() {}

}
