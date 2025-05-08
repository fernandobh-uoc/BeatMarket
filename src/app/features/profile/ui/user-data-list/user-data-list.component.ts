import { Component, input, OnInit } from '@angular/core';
import { User } from 'src/app/core/domain/models/user.model';
import { UserDataItemWrapperComponent } from '../smart-wrappers/user-data-item-smart-wrapper/user-data-item-wrapper.component';
import { CountryCodeToNamePipe } from 'src/app/shared/utils/pipes/country-code-to-name.pipe';

@Component({
  selector: 'app-user-data-list',
  templateUrl: './user-data-list.component.html',
  styleUrls: ['./user-data-list.component.scss'],
  imports: [UserDataItemWrapperComponent, CountryCodeToNamePipe]
})
export class UserDataListComponent  implements OnInit {
  user = input<User | null>(null);

  constructor() { }

  ngOnInit() {}

}
