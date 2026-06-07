import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
    private users = [
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Smith' }
    ];

    findAll() {
        return this.users;
    }
    findOne(id: number) {
        let user = this.users.find(user => user.id === id);
        if(!user) {
            return 'User not found';
        }
        return user ? user : null;
    }
    addUser(name: string) {
        const newUser = { id: this.users.length + 1, name };
        this.users.push(newUser);
        return newUser;
    }
}
