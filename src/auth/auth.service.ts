import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
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
      id,
      bestScore: 0
    });
    return id;
  }

  findById(id: number) {
    console.log(id);
    const user = users.find(user => user.id === id);
    if (!user) {
      throw new NotFoundException("User is not found");
    }
    return user;
  }

  findByName(name: string) {
    return users.find(user => user.name === name);
  }

  logout(userId: number) {
    users = users.filter(u => u.id !== userId);
  }

  getScores() {
    return [...users].sort((a, b) => b.bestScore - a.bestScore);
  }
}