import { Block } from '../models/block';
import { CurrentRound } from '../game-config/currentRound';

let gameWidth = 1100;

export class BlockLayout {
    public static readonly numOfBlocks = 10;

    public static readonly blockTileWidth: number = 90;
    public static readonly blockGridWidth: number = 100;

    public static readonly rowStartingX: number = 100;
    public static readonly rowY: number = 400;

    public static viewportCenter: number = 10;

    public static getBlockX(block: Block, numOfBlocks ?: number): number {
        if (numOfBlocks === undefined) {
            numOfBlocks = CurrentRound.blocksRemaining.length;
        }
        const centerX = gameWidth / 2;
        if (numOfBlocks % 2 === 0) {
            const centerLeftBlockIndex = numOfBlocks / 2 - 1;
            return centerX - BlockLayout.blockGridWidth / 2 + (block.position - centerLeftBlockIndex) * BlockLayout.blockGridWidth;
        } else {
            const centerBlockIndex = (numOfBlocks - 1) / 2;
            return centerX + (block.position - centerBlockIndex) * BlockLayout.blockGridWidth;
        }
    }
}
