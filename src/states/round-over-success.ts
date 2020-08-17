import { Text, PhaserTextStyle, Button } from 'phaser-ce';

import * as Assets from '../assets';
import { CurrentRound } from '../game-config/currentRound';
import { BlockLayout } from '../game-config/block-layout';

export default class RoundOverSuccess extends Phaser.State {
    message: string = 'Congrats! You win!\n This is the best possible arrangement!';
    messageText: Text;
    messageTextStyle: PhaserTextStyle;

    labelButton: string = 'Show Another!';
    labelButtonText: Text;
    labelButtonTextStyle: PhaserTextStyle;

    startButton: Button;

    public preload() {
        this.load.image('button', Assets.Images.ImagesButton.getPNG());
    }

    public create() {
        for (let i = 0; i < CurrentRound.blocksRemaining.length; i++) {
            CurrentRound.blocksRemaining[i].updateCurrentGameState(this);
            CurrentRound.blocksRemaining[i].moveCenterTo(BlockLayout.getBlockX(CurrentRound.blocksRemaining[i]), BlockLayout.rowY);
        }

        this.messageTextStyle = { font: 'bold 36px sans-serif', fill: '#013020', align: 'center' };
        this.messageText = this.game.add.text(550, 150, this.message, this.messageTextStyle);
        this.messageText.anchor.setTo(0.5, 0.5);

        this.startButton = this.add.button(550, 250, 'button', this.startGame, this);
        this.startButton.anchor.setTo(0.5, 0.5);
        this.startButton.scale.setTo(0.4, 0.25);
        this.labelButtonTextStyle = { font: 'bold 24px sans-serif', fill: '#013020', align: 'center' };
        this.labelButtonText = this.game.add.text(550, 250, this.labelButton, this.labelButtonTextStyle);
        this.labelButtonText.anchor.setTo(0.5, 0.5);
    }

    public startGame() {
        CurrentRound.newBlocks = true;
        this.state.start('Game');
    }
}
