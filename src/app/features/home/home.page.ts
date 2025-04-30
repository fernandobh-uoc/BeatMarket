import { Component, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/angular/standalone';
import { UserRepository } from 'src/app/core/domain/repositories/user.repository';
import { Role } from 'src/app/core/domain/models/user.model';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton],
})
export class HomePage {
  public userRepository = inject(UserRepository);

  public id: string = '6XI0qh0Io9XG6PZUXyfk';
  public email: string = 'fernandobh@uoc.edu';
  public username: string = 'fernandobh';

  async createUser() {
    console.log('creatingUser');

    await this.userRepository.saveUser({
      email: 'fernandobh@uoc.edu',
      username: 'fernandobh',
      profilePictureURL: 'https://avatars.githubusercontent.com/u/10497962?v=4',
      name: {
        first: 'Fernando',
        middle: 'Alberto',
        last: 'Barbosa'
      },
      dateOfBirth: new Date(1997, 1, 1),
      address: {
        line1: 'Rua Dr. Luiz de Queiroz, 100',
        line2: 'Centro',
        city: 'São Paulo',
        country: 'Brazil',
        zipcode: '01310-000'
      },
      roles: [Role.Student],
      bio: 'I am a student at the University of São Paulo',
      createdAt: new Date(),
      updatedAt: new Date(),
      activePosts: []
    });

    console.log('User has been created');
  }

  async getUserById() {
    const user = await this.userRepository.getUserById(this.id);
    console.log("user by id: ", user);
  }

  getUserById$() {
    const user$ = this.userRepository.getUserById$(this.id);
    user$?.subscribe(user => console.log("user$ by id: ", user));
  }

  async getUserByEmail() {
    const user = await this.userRepository.getUserByEmail(this.email);
    console.log("user by email: ", user);
  }

  getUserByEmail$() {
    const user$ = this.userRepository.getUserByEmail$(this.email);
    user$?.subscribe(user => console.log("user$ by email: ", user));
  }

  async getAllUsers() {
    const users = await this.userRepository.getAllUsers();
    console.log("all users: ", users);
  }

  getAllUsers$() {
    const users$ = this.userRepository.getAllUsers$();
    users$?.subscribe(users => console.log("all users$: ", users));
  }
}
