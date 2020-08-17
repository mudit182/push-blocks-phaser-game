import { Block } from '../models/block';
import { gameData } from '../game-config/game-data';

export class CurrentRound {
    public static newBlocks: boolean = true;

    public static blockValues: number[];
    public static finalSequence: number[];
    public static finalSequenceTotalValue: number;
    public static movesNeeded: number;

    public static success: boolean;
    public static blocksRemaining: Block[];
    public static blocksRemainingTotalValue: number;

    public static blocksAll: Block[];
    public static currentlySelectedBlock: Block;

    public static tweensRunning: number = 0;

    public static setNewSequence() {
        const i = Math.round(Math.random() * 2000);
        CurrentRound.blockValues = gameData.items[i].sequence;
        CurrentRound.finalSequence = gameData.items[i].endSequence;
        CurrentRound.finalSequenceTotalValue = gameData.items[i].highestScore;
        CurrentRound.movesNeeded = gameData.items[i].moves;
    }

    public static tweenStarting() {
        CurrentRound.tweensRunning++;
    }

    public static tweenComplete(uselessOb1: any, uselessOb2: any) {
        CurrentRound.tweensRunning--;
    }

    public static getBlocksRemainingValue() {
        let score = 0;
        CurrentRound.blocksRemaining.forEach((block: Block) => {
            score += block.value;
        });
        return score;
    }
}
