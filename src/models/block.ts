import { Sprite, State, Text, PhaserTextStyle, Easing, Tween } from 'phaser-ce';
import { CurrentRound } from '../game-config/currentRound';


export class Block {
    currentGameState: State;
    parentBlockArray: Block[];

    value: number;
    position: number;

    private sprite: Sprite;
    valueText: Text;
    static readonly valueTextStyle: PhaserTextStyle = { font: 'bold 54px sans-serif', fill: 'rgb(100, 30, 0)', align: 'center' };
    static readonly valueTextStyleEnlarged: PhaserTextStyle = { font: 'bold 60px sans-serif', fill: 'rgb(100, 30, 0)', align: 'center' };

    showingPossibleMoves: boolean;

    constructor(value: number, position: number, parentBlockArray: Block[], gameState: State, ) {
        this.value = value;
        this.position = position;
        this.currentGameState = gameState;
        this.parentBlockArray = parentBlockArray;

        // Create corresponding sprite with value as text
        this.sprite = this.currentGameState.add.sprite(0, 0, 'Tile');
        this.sprite.inputEnabled = true;
        this.sprite.scale.setTo(0.9, 0.9);
        this.sprite.anchor.setTo(0.5, 0.5);
        this.sprite.visible = false;
        this.valueText = this.currentGameState.add.text(0, 0, value.toString(), Block.valueTextStyle);
        this.valueText.anchor.setTo(0.5, 0.5);
        this.valueText.visible = false;

        this.sprite.events.onInputOver.add(this.enlarge, this);
        this.sprite.events.onInputOut.add(this.unenlarge, this);
        this.sprite.events.onInputOut.add(this.unshowPossibleMoves, this);
        this.sprite.events.onInputOut.add(this.unselect, this);
        this.sprite.events.onInputDown.add(this.toggleShowPossibleMoves, this);
    }

    updateCurrentGameState(state: State) {
        this.currentGameState = state;

        this.sprite = this.currentGameState.add.sprite(0, 0, 'Tile');
        this.sprite.inputEnabled = true;
        this.sprite.scale.setTo(0.9, 0.9);
        this.sprite.anchor.setTo(0.5, 0.5);
        this.sprite.visible = false;
        this.valueText = this.currentGameState.add.text(0, 0, this.value.toString(), Block.valueTextStyle);
        this.valueText.anchor.setTo(0.5, 0.5);
        this.valueText.visible = false;

        this.sprite.events.onInputOver.add(this.enlarge, this);
        this.sprite.events.onInputOut.add(this.unenlarge, this);
    }

    moveCenterTo(x: number, y: number) {
        this.sprite.x = x;
        this.sprite.y = y;
        this.valueText.x = x;
        this.valueText.y = y;
        this.sprite.visible = true;
        this.valueText.visible = true;
    }


    // Function that first slides the selected block
    slideShrinkTween(x: number, durationMove: number): Tween {
        this.sprite.bringToTop();
        this.valueText.bringToTop();

        const spriteMoveTween = this.currentGameState.add.tween(this.sprite).to({ x: x }, durationMove, Easing.Cubic.Out, false);
        const spriteShrinkTween = this.currentGameState.add.tween(this.sprite.scale).to({x: 0.9, y: 0.9}, 300, Easing.Linear.None, false);
        spriteMoveTween.chain(spriteShrinkTween);
        spriteMoveTween.start();
        CurrentRound.tweenStarting();
        CurrentRound.tweenStarting();
        spriteMoveTween.onComplete.add(CurrentRound.tweenComplete, CurrentRound, 0);
        spriteShrinkTween.onComplete.add(CurrentRound.tweenComplete, CurrentRound, 0);

        const textMoveTween = this.currentGameState.add.tween(this.valueText).to({ x: x }, durationMove, Easing.Cubic.Out, false);
        const textShrinkTween = this.currentGameState.add.tween(this.valueText.scale).to({ x: 0.9, y: 0.9 }, 300, Easing.Linear.None, false);
        textMoveTween.chain(textShrinkTween);
        textMoveTween.start();
        CurrentRound.tweenStarting();
        CurrentRound.tweenStarting();
        textMoveTween.onComplete.add(CurrentRound.tweenComplete, CurrentRound, 0);
        textShrinkTween.onComplete.add(CurrentRound.tweenComplete, CurrentRound, 0);

        // Returns the last executed tween - if further tween chaining is required
        return spriteShrinkTween;
    }

    // Function that slides all the blocks in their correct centered positions once a block is removed
    slideXTo(uselessOb1: any, uselessOb2: any, x: number) {
        const spriteTween = this.currentGameState.add.tween(this.sprite);
        const textTween = this.currentGameState.add.tween(this.valueText);
        spriteTween.to({ x: x }, 500, Easing.Cubic.Out, true);
        textTween.to({ x: x }, 500, Easing.Cubic.Out, true);
        CurrentRound.tweenStarting();
        CurrentRound.tweenStarting();
        spriteTween.onComplete.add(CurrentRound.tweenComplete, CurrentRound, 0);
        textTween.onComplete.add(CurrentRound.tweenComplete, CurrentRound, 0);
    }

    unenlarge() {
        this.sprite.scale.setTo(0.9, 0.9);
        this.valueText.setStyle(Block.valueTextStyle);
    }

    enlarge() {
        this.sprite.scale.setTo(1, 1);
        this.valueText.setStyle(Block.valueTextStyleEnlarged);
    }

    showPossibleMoves() {
        if (this.value !== 0) {
            this.showingPossibleMoves = true;
            if (this.position - this.value >= 0) {
                this.parentBlockArray[this.position - this.value].halfenAlpha();
            }
            if (this.position + this.value < this.parentBlockArray.length) {
                this.parentBlockArray[this.position + this.value].halfenAlpha();
            }
        }
    }

    unshowPossibleMoves() {
        if (this.value !== 0) {
            if (this.position - this.value >= 0) {
                this.parentBlockArray[this.position - this.value].unhalfenAlpha();
            }
            if (this.position + this.value < this.parentBlockArray.length) {
                this.parentBlockArray[this.position + this.value].unhalfenAlpha();
            }
            this.showingPossibleMoves = false;
        }
    }

    toggleShowPossibleMoves() {
        if (!this.showingPossibleMoves) {
            this.select();
            this.showPossibleMoves();
        } else {
            this.unshowPossibleMoves();
            this.unselect();
        }
    }

    halfenAlpha() {
        this.sprite.alpha = 0.5;
    }

    unhalfenAlpha() {
        this.sprite.alpha = 1;
    }

    select() {
        CurrentRound.currentlySelectedBlock = this;
    }

    unselect() {
        if (CurrentRound.currentlySelectedBlock === this) {
            CurrentRound.currentlySelectedBlock = null;
        }
    }

    remove() {
        this.sprite.destroy();
        this.valueText.destroy();
    }

}