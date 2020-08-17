import { PhaserTextStyle, Text, CursorKeys, Tween, Sprite } from 'phaser-ce';

import * as Assets from '../assets';
import { Block } from '../models/block';
import { BlockLayout } from '../game-config/block-layout';
import { CurrentGame } from '../game-config/currentGame';
import { CurrentRound } from '../game-config/currentRound';


export default class Title extends Phaser.State {
    background: Sprite;
    cursors: CursorKeys;

    blocksInOrder: boolean;
    noMoreMovesPossible: boolean;

    scoreTextValue: Text;
    moveTextValue: Text;
    textStyle_Key: PhaserTextStyle;
    textStyle_Value: PhaserTextStyle;

    public preload() {
        // Load block sprites and left/right buttons
        this.load.image('Tile', Assets.Images.ImagesTile.getPNG());
        this.load.image('Background', Assets.Images.ImagesBackground.getPNG());
    }

    public create() {
        this.background = this.add.sprite(0, 0, 'Background');
        this.background.anchor.setTo(0.5, 0.7);
        this.background.position.setTo(this.game.world.centerX, this.game.world.centerY);
        this.background.scale.setTo(1.25, 1.25);

        // Set up a Phaser controller for keyboard input.
        this.cursors = this.game.input.keyboard.createCursorKeys();

        CurrentRound.tweensRunning = 0;

        this.blocksInOrder = false;
        this.noMoreMovesPossible = false;

        // // Generate semi-random block values
        // const blockValues: number[] = [];
        // for (let i = 0; i < BlockLayout.numOfBlocks; i++) {
        //     blockValues.push(this.generateBlockValue(blockValues));
        // }
        // // Need to shuffle block values as generator is semi-random
        // for (let i = blockValues.length - 1; i > 0; i--) {
        //     const j = Math.floor(Math.random() * (i + 1));
        //     [blockValues[i], blockValues[j]] = [blockValues[j], blockValues[i]];
        // }

        if (CurrentRound.newBlocks) {
            CurrentRound.setNewSequence();
        }
        const blockValues = CurrentRound.blockValues;

        // Create and position block sprites
        CurrentRound.blocksAll = [];
        for (let i = 0; i < blockValues.length; i++) {
            CurrentRound.blocksAll.push(new Block(blockValues[i], i, CurrentRound.blocksAll, this));
            CurrentRound.blocksAll[i].moveCenterTo(BlockLayout.getBlockX(CurrentRound.blocksAll[i], blockValues.length), BlockLayout.rowY);
        }
        CurrentRound.blocksRemaining = CurrentRound.blocksAll;

        // Add Score Text to top of game.
        CurrentRound.blocksRemainingTotalValue = 0;
        // this.updateScore();
        this.textStyle_Key = { font: 'bold 24px sans-serif', fill: '#542210', align: 'center' };
        this.textStyle_Value = { font: 'bold 28px sans-serif', fill: '#222290', align: 'center' };
        this.game.add.text(650, 50, 'HIGHEST POSSIBLE', this.textStyle_Key);
        this.scoreTextValue = this.game.add.text(900, 48, CurrentRound.finalSequenceTotalValue.toString(), this.textStyle_Value);
        this.game.add.text(650, 100, 'IN MOVES', this.textStyle_Key);
        this.moveTextValue = this.game.add.text(900, 98, CurrentRound.movesNeeded.toString(), this.textStyle_Value);
    }

    public update() {
        if (CurrentRound.tweensRunning === 0) {
            if (this.blocksInOrder) {
                if (CurrentRound.finalSequenceTotalValue > CurrentRound.getBlocksRemainingValue()) {
                    this.state.start('RoundOverLowScore');
                } else {
                    this.state.start('RoundOverSuccess');
                }
            }
            if (this.noMoreMovesPossible) {
                this.state.start('GameOver');
            }

            if (CurrentRound.currentlySelectedBlock) {
                if (this.cursors.left.justDown) {
                    this.moveCurrentlySelectedBlockLeft();
                    CurrentRound.currentlySelectedBlock = null;
                } else if (this.cursors.right.justDown) {
                    this.moveCurrentlySelectedBlockRight();
                    CurrentRound.currentlySelectedBlock = null;
                }
            }
        }
    }

    moveCurrentlySelectedBlockLeft() {
        if (CurrentRound.currentlySelectedBlock.value !== 0) {
            const oldIndex = CurrentRound.currentlySelectedBlock.position;
            const newIndex = oldIndex - CurrentRound.blocksRemaining[oldIndex].value;
            if (newIndex >= 0) {
                CurrentRound.currentlySelectedBlock.unshowPossibleMoves();

                // Move selected block to its new position on screen
                CurrentRound.currentlySelectedBlock.position = newIndex;
                const lastTweenExecuted: Tween = CurrentRound.currentlySelectedBlock.slideShrinkTween(
                    BlockLayout.getBlockX(CurrentRound.currentlySelectedBlock),
                    50 * CurrentRound.currentlySelectedBlock.value + 200
                );

                // Move selected block to new position in Block array and delete old block (in array and screen)
                CurrentRound.blocksRemaining.splice(oldIndex, 1)[0];
                const blockToRemove = CurrentRound.blocksRemaining.splice(newIndex, 1, CurrentRound.currentlySelectedBlock)[0];
                blockToRemove.remove();

                // Update index and positions of sprite and buttons of blocks to the right of moved block's old position
                for (let i = oldIndex; i < CurrentRound.blocksRemaining.length; i++) {
                    CurrentRound.blocksRemaining[i].position = i;
                }
                // Move all blocks to their correct positions on screen
                for (let i = 0; i < CurrentRound.blocksRemaining.length; i++) {
                    lastTweenExecuted.onComplete.add(
                        CurrentRound.blocksRemaining[i].slideXTo,
                        CurrentRound.blocksRemaining[i],
                        0,
                        BlockLayout.getBlockX(CurrentRound.blocksRemaining[i])
                    );
                }
                // Unselect block to prevent further changes
                CurrentRound.currentlySelectedBlock.unselect();
                this.checkGameStatus();
                // this.updateScore();
            }
        }
    }

    moveCurrentlySelectedBlockRight() {
        if (CurrentRound.currentlySelectedBlock.value !== 0) {
            const oldIndex = CurrentRound.currentlySelectedBlock.position;
            const newIndex = oldIndex + CurrentRound.blocksRemaining[oldIndex].value;
            if (newIndex < CurrentRound.blocksRemaining.length) {
                CurrentRound.currentlySelectedBlock.unshowPossibleMoves();

                // Move block to removed block's position
                CurrentRound.currentlySelectedBlock.position = newIndex;
                const lastTweenExecuted: Tween = CurrentRound.currentlySelectedBlock.slideShrinkTween(
                    BlockLayout.getBlockX(CurrentRound.currentlySelectedBlock),
                    50 * CurrentRound.currentlySelectedBlock.value + 200
                );

                // Move block to new position in array and remove old block
                const blockToRemove = CurrentRound.blocksRemaining.splice(newIndex, 1, CurrentRound.currentlySelectedBlock)[0];
                blockToRemove.remove();
                CurrentRound.blocksRemaining.splice(oldIndex, 1)[0];

                // Update index and positions of sprite and buttons of blocks to the right of moved block's old position
                for (let i = oldIndex; i < CurrentRound.blocksRemaining.length; i++) {
                    CurrentRound.blocksRemaining[i].position = i;
                }
                // Move all blocks to their correct positions on screen
                for (let i = 0; i < CurrentRound.blocksRemaining.length; i++) {
                    lastTweenExecuted.onComplete.add(
                        CurrentRound.blocksRemaining[i].slideXTo,
                        CurrentRound.blocksRemaining[i],
                        0,
                        BlockLayout.getBlockX(CurrentRound.blocksRemaining[i])
                    );
                }
                // Unselect block to prevent further changes
                CurrentRound.currentlySelectedBlock.unselect();
                this.checkGameStatus();
                // this.updateScore();
            }
        }
    }

    checkGameStatus() {
        this.checkBlocksInOrder();
        if (!this.blocksInOrder) {
            this.checkNoMoreMovesPossible();
        }
    }

    checkBlocksInOrder() {
        let ascending = true;
        let descending = true;
        for (let i = 0; i < CurrentRound.blocksRemaining.length - 1; i++) {
            if (CurrentRound.blocksRemaining[i].value < CurrentRound.blocksRemaining[i + 1].value) {
                descending = false;
            }
            if (CurrentRound.blocksRemaining[i].value > CurrentRound.blocksRemaining[i + 1].value) {
                ascending = false;
            }
        }
        this.blocksInOrder = ascending || descending;
        if (this.blocksInOrder) {
            CurrentRound.success = true;
        }
    }

    checkNoMoreMovesPossible() {
        let movesPossible = false;
        for (let i = 0; i < CurrentRound.blocksRemaining.length; i++) {
            if (CurrentRound.blocksRemaining[i].value !== 0) {
                if (i - CurrentRound.blocksRemaining[i].value >= 0 || i + CurrentRound.blocksRemaining[i].value < CurrentRound.blocksRemaining.length) {
                    movesPossible = true;
                }
            }
        }
        this.noMoreMovesPossible = !movesPossible;
    }

    // updateScore() {
    //     GameGlobalVars.score = 0;
    //     if (!this.blocksInOrder && this.noMoreMovesPossible) {
    //         this.blocks.forEach((block: Block) => {
    //             GameGlobalVars.score -= (block.value);
    //         });
    //     } else {
    //         this.blocks.forEach((block: Block) => {
    //             GameGlobalVars.score += (block.value);
    //         });
    //     }
    //     // Refresh scoreboard.
    //     this.scoreTextValue.text = GameGlobalVars.score.toString();
    // }

    // generateBlockValue(blockValues: number[]) {
    //     let value = 0;
    //     const threshholdAcceptable = 10;
    //     const zeroesAcceptable = 2;
    //     let threshhold = 0;
    //     let zeroes = 0;
    //     do {
    //         // generate a block value
    //         value = Math.floor(Math.random() * 10);
    //         // reset and determine parameters to check if value is good
    //         threshhold = 0;
    //         zeroes = 0;
    //         blockValues.forEach(blockValue => {
    //             threshhold += this.getValueWeight(blockValue);
    //             zeroes = (blockValue === 0) ? zeroes + 1 : zeroes;
    //         });
    //         threshhold += this.getValueWeight(value);
    //         zeroes = (value === 0) ? zeroes + 1 : zeroes;
    //     } while (threshhold >= threshholdAcceptable || zeroes >= zeroesAcceptable);
    //     return value;
    // }

    // getValueWeight(value: number) {
    //     let weight = 0;
    //     switch (value) {
    //         case 7:
    //         case 8:
    //         case 9:
    //             weight = 5;
    //             break;
    //         case 6:
    //             weight = 3;
    //             break;
    //         case 5:
    //             weight = 2;
    //             break;
    //         case 4:
    //             weight = 1;
    //             break;
    //         default:
    //             break;
    //     }
    //     return weight;
    // }

}
