import { BadRequestException, Injectable } from "@nestjs/common";
import { generateId } from "src/game/game.utils";
import { User } from "src/types/user.types";
let users: User[] = [];
@Injectable()
export class AuthService {
  createUser(name: string) {
    const id = generateId();
    const foundUser = this.findByName(name);
    if (foundUser) {
      throw new BadRequestException("Given name is already used");
    }
    users.push({
      name,
      id
    });
    return id;
  }

  findById(id: number) {
    return users.find(user => user.id === id);
  }

  findByName(name: string) {
    return users.find(user => user.name === name);
  }
}