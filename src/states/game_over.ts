import * as Assets from '../assets';
import { Text, PhaserTextStyle } from 'phaser-ce';
import { CurrentRound } from '../game-config/currentRound';
import { Block } from '../models/block';

export default class GameOver extends Phaser.State {
    scoreTextValue: Text;
    totalScoreTextValue: Text;
    textStyle_Key: PhaserTextStyle;
    textStyle_Value: PhaserTextStyle;

    public preload() {
    }

    public create() {
    }

    public startGame() {
        this.state.start('Game');
    }
}
