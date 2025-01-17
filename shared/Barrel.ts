import { Client } from "../client/Client";
import { BotState } from "./Bot";
import { BulletState, BULLET_RADIUS } from "./Bullet";
import { EntityState } from "./Entity";
import { createExplosion } from "./Explosion";
import { Game, generateId } from "./Game";
import { checkCircleCollision } from "./Physics";
import { PlayerState, PLAYER_RADIUS } from "./Player";

//const BARREL_RADIUS: number = 24;
export const BARREL_RADIUS: number = 42;

export interface BarrelState extends EntityState {
    id: number;
    positionX: number;
    positionY: number;
    health: number;
}

export function createBarrel(
    game: Game,
    positionX: number,
    positionY: number
): BarrelState {
    let state = {
        id: generateId(game),
        positionX: positionX,
        positionY: positionY,
        health: 2,
    };
    game.state.barrels[state.id] = state;
    return state;
}

export function renderBarrel(
    client: Client,
    state: BarrelState,
    ctx: CanvasRenderingContext2D
) {
    // Draw bullet
    ctx.save();
    ctx.translate(state.positionX, -state.positionY);
    let barrelWidth = client.assets.barrel.width * client.assets.scaleFactor;
    let barrelHeight = client.assets.barrel.height * client.assets.scaleFactor;
    ctx.drawImage(
        client.assets.barrel,
        -barrelWidth / 2,
        -barrelHeight / 2,
        barrelWidth,
        barrelHeight
    );
    ctx.restore();
}

export function onPlayerCollide(
    game: Game,
    state: BarrelState,
    player: PlayerState
) {
    let dirX = player.positionX - state.positionX;
    let dirY = player.positionY - state.positionY;
    let mag = Math.sqrt(dirY * dirY + dirX * dirX);
    let offset = BARREL_RADIUS + PLAYER_RADIUS;
    player.positionX = state.positionX + (dirX / mag) * offset;
    player.positionY = state.positionY + (dirY / mag) * offset;
}

export function onBotCollide(game: Game, state: BarrelState, bot: BotState) {
    let dirX = bot.positionX - state.positionX;
    let dirY = bot.positionY - state.positionY;
    let mag = Math.sqrt(dirY * dirY + dirX * dirX);
    let offset = BARREL_RADIUS + PLAYER_RADIUS;
    bot.positionX = state.positionX + (dirX / mag) * offset;
    bot.positionY = state.positionY + (dirY / mag) * offset;
}

export function updateBarrel(game: Game, state: BarrelState, dt: number) {
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
    for (let botID in game.state.bot) {
        let bot = game.state.bot[botID];
        if (
            checkCircleCollision(
                state.positionX,
                state.positionY,
                BARREL_RADIUS,
                bot.positionX,
                bot.positionY,
                PLAYER_RADIUS
            )
        ) {
            onBotCollide(game, state, bot);
        }
    }

    for (let bulletId in game.state.bullets) {
        let bullet = game.state.bullets[bulletId];
        if (
            checkCircleCollision(
                state.positionX,
                state.positionY,
                BARREL_RADIUS,
                bullet.positionX,
                bullet.positionY,
                BULLET_RADIUS
            )
        ) {
            onBulletCollision(game, state, bullet);
        }
    }
}

export function onBulletCollision(
    game: Game,
    state: BarrelState,
    bullet: BulletState
) {
    delete game.state.bullets[bullet.id];

    if (game.isServer) {
        state.health -= 1;
        if (state.health <= 0) {
            delete game.state.barrels[state.id];
            let time = 1;
            createExplosion(game, state.positionX, state.positionY, time);
        }
    }
}
