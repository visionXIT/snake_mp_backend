import { FieldSettingsType, GameSettingsType } from "src/types/game.types";

export class CreateGameDto {
  gameSettings: GameSettingsType
  fieldSettings: FieldSettingsType;
}