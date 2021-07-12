import { Client } from "../client/Client";
import { BARREL_RADIUS } from "./Barrel";
import { EntityState } from "./Entity";
import { Game, generateId } from "./Game";
import { checkCircleCollision } from "./Physics";
import { PlayerState, PLAYER_RADIUS } from "./Player";
import { Utilities } from "./Utilities";

export interface HealthPackState extends EntityState {
    id: number;
    positionX: number;
    positionY: number;
    health: number;
}

export function createHealthPack(game: Game): HealthPackState {
    let state = {
        id: generateId(game),
        positionX: Utilities.lerp(
            -game.arenaSize / 2,
            game.arenaSize / 2,
            Math.random()
        ),
        positionY: Utilities.lerp(
            -game.arenaSize / 2,
            game.arenaSize / 2,
            Math.random()
        ),
        health: 1,
    };
    game.state.healthpack[state.id] = state;
    return state;
}

export function renderHealthPack(
    client: Client,
    state: HealthPackState,
    ctx: CanvasRenderingContext2D
) {
    // Draw bullet
    ctx.save();
    ctx.translate(state.positionX, -state.positionY);
    let healthPackWidth =
        client.assets.healthPack.width * client.assets.scaleFactor;
    let healthPackHeight =
        client.assets.healthPack.height * client.assets.scaleFactor;
    ctx.drawImage(
        client.assets.healthPack,
        -healthPackWidth / 2,
        -healthPackHeight / 2,
        healthPackWidth,
        healthPackHeight
    );
    ctx.restore();
}

export function onPlayerCollide(
    game: Game,
    state: HealthPackState,
    player: PlayerState
) {
    delete game.state.healthpack[state.id];
    player.health + 1;
    createHealthPack(game);
}

export function updateHealthPack(
    game: Game,
    state: HealthPackState,
    dt: number
) {
    for (let playerId in game.state.players) {
        let player = game.state.players[playerId];
        if (
            checkCircleCollision(
                state.positionX,
                state.positionY,
                BARREL_RADIUS,
                player.positionX,
                player.positionY,
                PLAYER_RADIUS
            )
        ) {
            onPlayerCollide(game, state, player);
        }
    }
}
