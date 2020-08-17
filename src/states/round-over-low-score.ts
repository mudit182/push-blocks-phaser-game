import { Text, PhaserTextStyle, Button } from 'phaser-ce';

import * as Assets from '../assets';
import { CurrentRound } from '../game-config/currentRound';
import { BlockLayout } from '../game-config/block-layout';

export default class RoundOverLowScore extends Phaser.State {
    message: string = 'Blocks Arranged!\n But not the best arrangement';
    messageText: Text;
    messageTextStyle: PhaserTextStyle;

    labelButton1: string = 'Try Again';
    labelButton1Text: Text;
    labelButton1TextStyle: PhaserTextStyle;
    button1: Button;

    labelButton2: string = 'Show Another';
    labelButton2Text: Text;
    labelButton2TextStyle: PhaserTextStyle;
    button2: Button;


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

        this.button1 = this.add.button(400, 250, 'button', this.startSameGame, this);
        this.button1.anchor.setTo(0.5, 0.5);
        this.button1.scale.setTo(0.4, 0.25);
        this.labelButton1TextStyle = { font: 'bold 24px sans-serif', fill: '#013020', align: 'center' };
        this.labelButton1Text = this.game.add.text(400, 250, this.labelButton1, this.labelButton1TextStyle);
        this.labelButton1Text.anchor.setTo(0.5, 0.5);

        this.button2 = this.add.button(700, 250, 'button', this.startNewGame, this);
        this.button2.anchor.setTo(0.5, 0.5);
        this.button2.scale.setTo(0.4, 0.25);
        this.labelButton2TextStyle = { font: 'bold 24px sans-serif', fill: '#013020', align: 'center' };
        this.labelButton2Text = this.game.add.text(700, 250, this.labelButton2, this.labelButton2TextStyle);
        this.labelButton2Text.anchor.setTo(0.5, 0.5);
    }

    public startSameGame() {
        CurrentRound.newBlocks = false;
        this.state.start('Game');
    }

    public startNewGame() {
        CurrentRound.newBlocks = true;
        this.state.start('Game');
    }
}
