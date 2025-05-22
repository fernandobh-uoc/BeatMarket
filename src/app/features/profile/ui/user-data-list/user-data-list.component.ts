import { Component, input, OnInit } from '@angular/core';
import { User } from 'src/app/core/domain/models/user.model';
import { UserDataItemWrapperComponent } from '../user-data-item/user-data-item.wrapper.component';

@Component({
  selector: 'app-user-data-list',
  templateUrl: './user-data-list.component.html',
  styleUrls: ['./user-data-list.component.scss'],
  imports: [UserDataItemWrapperComponent]
})
export class UserDataListComponent  implements OnInit {
  user = input<User | null>(null);

  constructor() { }

  ngOnInit() {}

}
